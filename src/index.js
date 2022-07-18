import { getVisualGraph } from './state/graphState'
import { Point } from './model/Point'
import CanvasAdaptor from "./graphics/utils/CanvasAdaptor";
import { calculateViewportTranslation } from './middlewares/viewportMiddleware'

function merge(target, source) {
    Object.keys(source).forEach((property) => {
        target[property] = source[property]
    })
}

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

export default class ArrowApp {
    constructor(domString, graph, options) {
        this.canvas = document.getElementById(domString)
        this.selection = {
            editing: undefined,
            entities: []
        }

        this.options = {
            width: '100%',
            height: '100%'
        }

        merge(this.options, options)

        this.initPointClass(graph)

        this.fitCanvasSize(this.canvas, this.options)
        const visualGraph = getVisualGraph(graph, this.selection, '')
        this.options.viewTransformation = calculateViewportTranslation(visualGraph, {width: this.options.width, height: this.options.height})
        // console.log(res)

        this.renderVisuals({
            visualGraph,
            displayOptions: this.options
        })
    }

    // 给节点的每一个点装上Point类
    initPointClass(graph) {
        graph.nodes = graph.nodes.map(item => ({
            ...item,
            position: new Point(item.position.x, item.position.y)
        }));
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
    renderVisuals({
        visualGraph,
        displayOptions
    }) {
        console.log(visualGraph, displayOptions)
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