import { merge } from './utils/util'
import { getVisualGraph } from './state/graphState'

// canvas layer manager
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

export default class RenderCanvas {
    constructor(domString, graph, options) {
        this.canvas = document.getElementById(domString)

        this.options = {
            width: '100%',
            height: '100%'
        }

        merge(this.options, options)

        this.fitCanvasSize(this.canvas, this.options)
        const visualsData = getVisualGraph(graph, '', '')

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

    // 可视化渲染
    renderVisuals = ({
        visualGraph,
        displayOptions
    }) => {
        const ctx = this.canvas.getContext('2d');
        ctx.clearRect(0, 0, displayOptions.width, displayOptions.height);
    
        // const visualGestures = new Gestures(visualGraph, gestures)
        // const visualGuides = new VisualGuides(visualGraph, guides)
    
        layerManager.clear()

        // layerManager.register('GUIDES ACTUAL POSITION', visualGuides.drawActualPosition.bind(visualGuides))
        // layerManager.register('GESTURES', visualGestures.draw.bind(visualGestures))
        layerManager.register('GRAPH', visualGraph.draw.bind(visualGraph))
    
        layerManager.renderAll(new CanvasAdaptor(ctx), displayOptions)
    }
}