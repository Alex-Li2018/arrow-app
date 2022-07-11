function merge(target, source) {
    Object.keys(source).forEach((property) => {
        target[property] = source[property]
    })
}

class CanvasAdaptor {
    constructor(ctx) {
        this.ctx = ctx
    }

    save() {
        this.ctx.save()
    }

    restore() {
        this.ctx.restore()
    }

    translate(dx, dy) {
        this.ctx.translate(dx, dy)
    }

    scale(x) {
        this.ctx.scale(x, x)
    }

    rotate(angle) {
        this.ctx.rotate(angle)
    }

    beginPath() {
        this.ctx.beginPath()
    }

    closePath() {
        this.ctx.closePath()
    }

    moveTo(x, y) {
        this.ctx.moveTo(x, y)
    }


    lineTo(x, y) {
        this.ctx.lineTo(x, y)
    }

    arcTo(x1, y1, x2, y2, radius) {
        this.ctx.arcTo(x1, y1, x2, y2, radius)
    }

    arc(x, y, radius, startAngle, endAngle, anticlockwise) {
        this.ctx.arc(x, y, radius, startAngle, endAngle, anticlockwise)
    }

    circle(x, y, radius, fill, stroke) {
        this.ctx.beginPath()
        this.ctx.arc(x, y, radius, 0, Math.PI * 2, false)
        this.ctx.closePath()
        if (fill) this.ctx.fill()
        if (stroke) this.ctx.stroke()
    }

    rect(x, y, width, height, r, fill, stroke) {
        this.ctx.beginPath()
        this.ctx.moveTo(x, y + r)
        this.ctx.arc(x + r, y + r, r, -Math.PI, -Math.PI / 2)
        this.ctx.lineTo(x + width - r, y)
        this.ctx.arc(x + width - r, y + r, r, -Math.PI / 2, 0)
        this.ctx.lineTo(x + width, y + height - r)
        this.ctx.arc(x + width - r, y + height - r, r, 0, Math.PI / 2)
        this.ctx.lineTo(x + r, y + height)
        this.ctx.arc(x + r, y + height - r, r, Math.PI / 2, Math.PI)
        this.ctx.closePath()
        if (fill) this.ctx.fill()
        if (stroke) this.ctx.stroke()
    }

    image(imageInfo, x, y, width, height) {
        try {
            this.ctx.drawImage(imageInfo.image, x, y, width, height)
        } catch (e) {
            console.error(e)
        }
    }

    imageInCircle(imageInfo, cx, cy, radius) {
        const ratio = imageInfo.width / imageInfo.height
        const {
            width,
            height
        } =
        (imageInfo.width > imageInfo.height) ? {
            width: 2 * radius * ratio,
            height: 2 * radius
        } : {
            width: 2 * radius,
            height: 2 * radius / ratio
        }
        this.ctx.save()
        try {
            this.ctx.beginPath();
            this.ctx.arc(cx, cy, radius, 0, Math.PI * 2)
            this.ctx.clip()
            this.ctx.drawImage(imageInfo.image, cx - width / 2, cy - height / 2, width, height)
        } catch (e) {
            console.error(e)
        } finally {
            this.ctx.restore()
        }
    }

    polyLine(points) {
        this.ctx.beginPath()
        if (points.length > 0) {
            const startPoint = points[0]
            this.ctx.moveTo(startPoint.x, startPoint.y)
        }
        for (let i = 1; i < points.length; i++) {
            const point = points[i]
            this.ctx.lineTo(point.x, point.y)
        }
        this.ctx.stroke()
    }

    polygon(points, fill, stroke) {
        this.ctx.beginPath()
        if (points.length > 0) {
            const startPoint = points[0]
            this.ctx.moveTo(startPoint.x, startPoint.y)
        }
        for (let i = 1; i < points.length; i++) {
            const point = points[i]
            this.ctx.lineTo(point.x, point.y)
        }
        this.ctx.closePath()
        if (fill) this.ctx.fill()
        if (stroke) this.ctx.stroke()
    }

    stroke() {
        this.ctx.stroke()
    }

    fill() {
        this.ctx.fill()
    }

    fillText(text, x, y) {
        this.ctx.fillText(text, x, y)
    }

    measureText(text) {
        return this.ctx.measureText(text)
    }

    setLineDash(dash) {
        this.ctx.setLineDash(dash)
    }

    set fillStyle(color) {
        this.ctx.fillStyle = color
    }

    set font(style) {
        this.ctx.font = `${style.fontWeight} ${style.fontSize}px ${style.fontFamily}`
    }

    set textBaseline(value) {
        this.ctx.textBaseline = value
    }

    set textAlign(value) {
        this.ctx.textAlign = value
    }

    set lineWidth(value) {
        this.ctx.lineWidth = value
    }

    set lineJoin(value) {
        this.ctx.lineJoin = value
    }

    set lineCap(value) {
        this.ctx.lineCap = value
    }

    set strokeStyle(value) {
        this.ctx.strokeStyle = value
    }
}

const layerManager = (() => {
    let layers = []
    return {
        register: (name, drawFunction) => layers.push({
            name,
            draw: drawFunction
        }),
        clear: () => {
            layers = []
        },
        renderAll: (ctx, displayOptions) => {
            layers.forEach(layer => layer.draw(ctx, displayOptions))
        }
    }
})()

class RenderCanvas {
    constructor(domString, visualsData, options) {
        this.canvas = document.getElementById(domString)

        this.options = {
            width: '100%',
            height: '100%'
        }

        merge(this.options, options)

        this.fitCanvasSize(this.canvas, this.options)

        this.renderVisuals({
            visualsData,
            options
        })
    }

    fitCanvasSize(canvas, {
        width, height
    }) {
        canvas.width = width
        canvas.height = height
        canvas.style.width = width + 'px'
        canvas.style.height = height + 'px'

        const context = canvas.getContext('2d');

        const devicePixelRatio = window.devicePixelRatio || 1;
        const backingStoreRatio = context.webkitBackingStorePixelRatio ||
            context.mozBackingStorePixelRatio ||
            context.msBackingStorePixelRatio ||
            context.oBackingStorePixelRatio ||
            context.backingStorePixelRatio || 1
        const ratio = devicePixelRatio / backingStoreRatio

        if (devicePixelRatio !== backingStoreRatio) {
            canvas.width = width * ratio
            canvas.height = height * ratio

            canvas.style.width = width + 'px'
            canvas.style.height = height + 'px'

            // now scale the context to counter
            // the fact that we've manually scaled
            // our canvas element
            context.scale(ratio, ratio)
        }

        return ratio
    }

    renderVisuals = ({
        displayOptions
    }) => {
    
        const ctx = this.canvas.getContext('2d');
        ctx.clearRect(0, 0, displayOptions.width, displayOptions.height);
    
        const visualGestures = new Gestures(visualGraph, gestures)
        const visualGuides = new VisualGuides(visualGraph, guides)
    
        layerManager.clear()

        layerManager.register('GUIDES ACTUAL POSITION', visualGuides.drawActualPosition.bind(visualGuides))
        layerManager.register('GESTURES', visualGestures.draw.bind(visualGestures))
        layerManager.register('GRAPH', visualGraph.draw.bind(visualGraph))
    
        layerManager.renderAll(new CanvasAdaptor(ctx), displayOptions)
    }
}

window.RenderCanvas = RenderCanvas