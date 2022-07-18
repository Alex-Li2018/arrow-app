import {
    validate
} from "../model/styling";

// 获取图谱的样式
const graphStyleSelector = graph => graph.style || {}

// 如果自身有style用自身的没有就用图谱的公用样式
const specificOrGeneral = (styleKey, entity, graphStyle) => {
    if (entity.style && entity.style.hasOwnProperty(styleKey)) {
        return entity.style[styleKey]
    }
    return graphStyle[styleKey]
}

export const getStyleSelector = (entity, styleKey, graph) => {
    const styleMap = graphStyleSelector(graph)
    return validate(styleKey, specificOrGeneral(styleKey, entity, styleMap))
}