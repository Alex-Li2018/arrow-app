export const canvasPadding = 10

export const computeCanvasSize = (applicationLayout) => {
    const {
        windowSize,
    } = applicationLayout
    return {
        width: windowSize.width,
        height: windowSize.height
    }
}

export const subtractPadding = (canvasSize) => {
    return {
        width: canvasSize.width - canvasPadding * 2,
        height: canvasSize.height - canvasPadding * 2
    }
}