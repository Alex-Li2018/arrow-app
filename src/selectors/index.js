import VisualNode from "../graphics/VisualNode";
import ResolvedRelationship from "../graphics/ResolvedRelationship";
import VisualGraph from "../graphics/VisualGraph";
import TransformationHandles from "../graphics/TransformationHandles";
import {
    bundle
} from "../model/graph/relationshipBundling";
import {
    RoutedRelationshipBundle
} from "../graphics/RoutedRelationshipBundle";
import CanvasAdaptor from "../graphics/utils/CanvasAdaptor";
import {
    nodeEditing,
    nodeSelected,
    relationshipSelected,
    selectedNodeIds
} from "../model/selection";
import {
    computeRelationshipAttachments
} from "../graphics/relationshipAttachment";
import {
    BackgroundImage
} from "../graphics/BackgroundImage";

export const getPresentGraph = state => state.graph.present || state.graph

export const getGraph = (state) => {
    const {
        layers
    } = state.applicationLayout || {}

    if (layers && layers.length > 0) {
        return layers.reduce((resultState, layer) => {
            if (layer.selector) {
                return layer.selector({
                    graph: resultState,
                    [layer.name]: state[layer.name]
                })
            } else {
                return resultState
            }
        }, getPresentGraph(state))
    } else {
        return getPresentGraph(state)
    }
}

export const measureTextContext = (() => {
    const canvas = window.document.createElement('canvas')
    return new CanvasAdaptor(canvas.getContext('2d'))
})()

export const getVisualNode = (node, graph, selection, cachedImages) => {
    return new VisualNode(
        node,
        graph,
        nodeSelected(selection, node.id),
        nodeEditing(selection, node.id),
        measureTextContext,
        cachedImages
    )
}

export const getVisualGraph = (graph, selection, cachedImages) => {
    // node -> VisualNode
    const visualNodes = graph.nodes.reduce((nodeMap, node) => {
        nodeMap[node.id] = getVisualNode(node, graph, selection, cachedImages)
        return nodeMap
    }, {})

    // 计算边
    const relationshipAttachments = computeRelationshipAttachments(graph, visualNodes)

    // relationship -> ResolvedRelationship
    const resolvedRelationships = graph.relationships.map(relationship =>
        new ResolvedRelationship(
            relationship,
            visualNodes[relationship.fromId],
            visualNodes[relationship.toId],
            relationshipAttachments.start[relationship.id],
            relationshipAttachments.end[relationship.id],
            // 是否被选中
            relationshipSelected(selection, relationship.id),
            graph
        )
    )
    
    // 对应的边的箭头样式
    const relationshipBundles = bundle(resolvedRelationships).map(bundle => {
        return new RoutedRelationshipBundle(bundle, graph, selection, measureTextContext, cachedImages);
    })

    // 可视化图
    return new VisualGraph(graph, visualNodes, relationshipBundles, measureTextContext)
}

export const getBackgroundImage = (graph, cachedImages) => {
    return new BackgroundImage(graph.style, cachedImages)
}

export const getTransformationHandles = (visualGraph, selection, mouse, viewTransformation) => {
    return new TransformationHandles(visualGraph, selection, mouse, viewTransformation)
}

export const getPositionsOfSelectedNodes = (visualGraph, selection) => {
    const nodePositions = []
    selectedNodeIds(selection).forEach((nodeId) => {
        const visualNode = visualGraph.nodes[nodeId]
        nodePositions.push({
            nodeId: visualNode.id,
            position: visualNode.position,
            radius: visualNode.radius
        })
    })
    return nodePositions
}