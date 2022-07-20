import { 
    createStore,
    applyMiddleware
} from '../library/redux.js'
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
            applyMiddleware(...middleware)
        )

        this.instance = null
    }

    getStore() {
        return this.store
    }

    // 单例模式
    static getInstance() {
        if (this.instance) {
            return this.instance
        }

        return this.instance = new StateController()
    }
}

