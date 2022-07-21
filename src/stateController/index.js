import { 
    createStore,
    applyMiddleware
} from '../library/redux.js'
import thunkMiddleware from '../library/redux-thunk'
import reducer from '../reducers/index'
import { viewportMiddleware } from "../middlewares/viewportMiddleware"
// import {storageMiddleware} from "../middlewares/storageMiddleware";
import { windowLocationHashMiddleware } from "../middlewares/windowLocationHashMiddleware";
// import {initRecentStorage, recentStorageMiddleware} from "../middlewares/recentStorageMiddleware";
import { imageCacheMiddleware } from "../middlewares/imageCacheMiddleware";

// 执行顺讯 windowLocationHashMiddleware -> viewportMiddleware -> imageCacheMiddleware
const middleware = [
    // recentStorageMiddleware,
    // storageMiddleware,
    windowLocationHashMiddleware,
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
    observeStore(select) {
        let currentValue
        function handleChange() {
            let previousValue = currentValue
            currentValue = select(store.getState())

            if (previousValue !== currentValue) {
                console.log(
                    'Some deep nested property changed from',
                    previousValue,
                    'to',
                    currentValue
                )
            }
        }

        const unsubscribe = store.subscribe(handleChange)
        handleChange()
        return unsubscribe
    }

    // 单例模式
    static getInstance() {
        if (this.instance) {
            return this.instance
        }

        return this.instance = new StateController()
    }
}

