import {
    Point
} from "../model/Point";
import {
    doubleClick,
    endDrag,
    mouseDown,
    mouseMove,
    mouseUp,
    wheel
} from "../actions/mouse";
import {
    Vector
} from "../model/Vector";
import {
    isMac
} from "./Keybindings";

export default class MouseHandler {
    constructor(canvas) {
        this.canvas = canvas

        this.canvas.addEventListener('wheel', this.handleWheel.bind(this))
        this.canvas.addEventListener('dblclick', this.handleDoubleClick.bind(this))
        this.canvas.addEventListener('mousemove', this.handleMouseMove.bind(this))
        this.canvas.addEventListener('mousedown', this.handleMouseDown.bind(this))
        this.canvas.addEventListener('mouseup', this.handleMouseUp.bind(this))
        this.canvas.addEventListener('mouseleave', this.handleMouseLeave.bind(this))
    }

    setDispatch(dispatch) {
        this.dispatch = dispatch
    }

    handleWheel(evt) {
        this.dispatch(wheel(this.canvasPosition(evt), new Vector(evt.deltaX, evt.deltaY), evt.ctrlKey))
        evt.preventDefault()
    }

    handleDoubleClick(evt) {
        this.dispatch(doubleClick(this.canvasPosition(evt)))
        evt.preventDefault()
    }

    handleMouseMove(evt) {
        if (evt.button !== 0) {
            return
        }
        this.dispatch(mouseMove(this.canvasPosition(evt)))
        evt.preventDefault()
    }

    handleMouseDown(evt) {
        if (evt.button !== 0) {
            return
        }

        this.dispatch(mouseDown(this.canvasPosition(evt), isMac ? evt.metaKey : evt.ctrlKey))
        evt.preventDefault()
    }

    handleMouseUp(evt) {
        if (evt.button !== 0) {
            return
        }

        this.dispatch(mouseUp(this.canvasPosition(evt)))
        evt.preventDefault()
    }

    handleMouseLeave(evt) {
        this.dispatch(endDrag())
        evt.preventDefault()
    }

    // 计算
    canvasPosition(event) {
        // getBoundingClientRect用于获得页面中某个元素的左，上，右和下分别相对浏览器视窗的位置。
        // getBoundingClientRect是DOM元素到浏览器可视范围的距离（不包含文档卷起的部分）
        let rect = this.canvas.getBoundingClientRect()
        // TODO Origin of right / bottom ISSUE ???
        // canvas viewPort origin
        return new Point(
            event.clientX - rect.left,
            event.clientY - rect.top
        )
    }
}