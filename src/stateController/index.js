import { 
    createStore,
    applyMiddleware
} from '../library/redux/index'
import thunkMiddleware from '../library/redux-thunk/index'
import reducer from '../reducers/index'
import { viewportMiddleware } from "../middlewares/viewportMiddleware"
import { imageCacheMiddleware } from "../middlewares/imageCacheMiddleware";
import { 
    getVisualGraph, 
    getBackgroundImage, 
    getTransformationHandles 
} from '../selectors/index'
import { computeCanvasSize } from "../model/applicationLayout";

// 执行顺讯 viewportMiddleware -> imageCacheMiddleware
const middleware = [
    viewportMiddleware,
    imageCacheMiddleware
]

export default class StateController {
    constructor() {
        this.store = createStore(
            reducer,
            {},
            applyMiddleware(thunkMiddleware, ...middleware)
        )

        this.instance = null
    }

    getStore() {
        return this.store
    }

    // observe data change
    subscribeEvent(callbackArr) {
        let currentValue;
        const self = this;
        function handleChange() {
            let previousValue = currentValue;
            currentValue = self.observerData(previousValue, self.store.getState());
            callbackArr.length && callbackArr.forEach(callback => {
                callback && callback(currentValue, previousValue);
            })
        }

        handleChange();
        const unsubscribe = self.store.subscribe(handleChange);
        return unsubscribe
    }

    observerData(preState, state) {
        /* oberser gestures graph viewTransformation
            if gestures graph viewTransformation data changed 
            the view will rerender
        */
        const currentValue =  {
            visualGraph: getVisualGraph(state),
            backgroundImage: getBackgroundImage(state),
            selection: state.selection,
            gestures: state.gestures,
            guides: state.guides,
            handles: getTransformationHandles(state),
            canvasSize: computeCanvasSize(state.applicationLayout),
            viewTransformation: state.viewTransformation,
            storage: state.storage
        }

        return currentValue    
    }

    dispatchSelection(preValue, value) {
        const preSelection = preValue.selection
        const selection = value.selection

        for(let key in preSelection) {
            selection[key] = selection[key]
        }
    }

    // 单例模式
    static getInstance() {
        if (this.instance) {
            return this.instance
        }

        return this.instance = new StateController()
    }
}

