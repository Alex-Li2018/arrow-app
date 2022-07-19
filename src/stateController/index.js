import { 
    createStore
} from 'redux'
import reducer from '../reducers/index'

export default class StateController {
    constructor() {
        this.store = createStore(
            reducer,
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

