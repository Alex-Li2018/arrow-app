import {
    combineReducers
} from 'redux'
import dragToCreate from "./dragToCreate";
import selectionMarquee from "./selectionMarquee";

// 手势
const gestures = combineReducers({
    dragToCreate,
    selectionMarquee
})

export default gestures