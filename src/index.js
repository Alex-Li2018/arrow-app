import CanvasAdaptor from "./graphics/utils/CanvasAdaptor";
import StateController from './stateController/index';
import { initGraph } from './actions/graph'
import { windowResized } from "./actions/applicationLayout";
import MouseHandler from "./interactions/MouseHandler"
import Gestures from "./graphics/Gestures";
import * as userEvent from './exportUserEvent'

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
        this.canvas = document.getElementById(domString);
        this.options = {
            width: '100%',
            height: '100%',
            // 数据变化
            dataChange(p, c) {
                // console.log('dataChange', p, c)
            },
        };

        // merge options
        merge(this.options, options);

        // userEvent
        this.userEvent = userEvent

        // redux store
        this.stateController = StateController.getInstance();
        this.stateStore = this.stateController.store;

        // dispatch initGraph event
        this.stateStore.dispatch(initGraph(graph));
        // dispatch windowResized
        this.stateStore.dispatch(windowResized(this.options.width, this.options.height));

        // event listener
        this.mouseHandler = new MouseHandler(this.canvas);
        this.mouseHandler.setDispatch(this.stateStore.dispatch);
        
        // listen render
        const callback = []
        callback.push(this.canvasChangeaHandler.bind(this))
        callback.push(this.renderVisuals.bind(this))
        callback.push(this.options.dataChange)

        this.stateController.subscribeEvent(callback);

        // 外部句柄 触发事件
        this.dispatch = this.stateStore.dispatch
    }

    fitCanvasSize({
        width, height
    }) {
        this.canvas.width = width;
        this.canvas.height = height;
        this.canvas.style.width = width + 'px';
        this.canvas.style.height = height + 'px';

        const context = this.canvas.getContext('2d');

        const devicePixelRatio = window.devicePixelRatio || 1;
        const backingStoreRatio = context.webkitBackingStorePixelRatio ||
            context.mozBackingStorePixelRatio ||
            context.msBackingStorePixelRatio ||
            context.oBackingStorePixelRatio ||
            context.backingStorePixelRatio || 1;
        const ratio = devicePixelRatio / backingStoreRatio;

        if (devicePixelRatio !== backingStoreRatio) {
            this.canvas.width = width * ratio;
            this.canvas.height = height * ratio;

            this.canvas.style.width = width + 'px';
            this.canvas.style.height = height + 'px';

            // now scale the context to counter
            // the fact that we've manually scaled
            // our canvas element
            context.scale(ratio, ratio);
        }

        return ratio
    }

    canvasChangeaHandler(newVal, oldVal) {
        oldVal = oldVal || {}
        newVal = newVal || {}

        const {
            canvasSize: oldSize
        } = oldVal

        const {
            canvasSize
        } = newVal

        const flag = oldSize ? (oldSize.width !== canvasSize.width) || (oldSize.height !== canvasSize.height) 
            : true

        if (
            !canvasSize
            || flag
        ) {
            this.fitCanvasSize(canvasSize)
        }
    }

    // 可视化渲染
    renderVisuals(state) {
        const { 
            visualGraph,
            gestures, 
            viewTransformation, 
            canvasSize 
        } = state;

        const ctx = this.canvas.getContext('2d');
        ctx.clearRect(0, 0, canvasSize.width, canvasSize.height);
    
        const visualGestures = new Gestures(visualGraph, gestures);
        // const visualGuides = new VisualGuides(visualGraph, guides)
    
        layerManager.clear();

        // layerManager.register('GUIDES ACTUAL POSITION', visualGuides.drawActualPosition.bind(visualGuides))
        layerManager.register('GESTURES', visualGestures.draw.bind(visualGestures));
        layerManager.register('GRAPH', visualGraph.draw.bind(visualGraph));
    
        layerManager.renderAll(new CanvasAdaptor(ctx), {
            canvasSize,
            viewTransformation
        });
    }
}