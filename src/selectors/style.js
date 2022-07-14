import {
    validate
} from "../model/styling";

const graphStyleSelector = graph => graph.style || {}

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