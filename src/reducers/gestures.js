import {
    combineReducers
} from '../library/redux/index'
import dragToCreate from "./dragToCreate";
import selectionMarquee from "./selectionMarquee";

// 手势
const gestures = combineReducers({
    dragToCreate,
    selectionMarquee
})

export default gestures