import VisualNode from '../graphics/VisualNode'
import {
    computeRelationshipAttachments
} from "../graphics/relationshipAttachment";
import {
    RoutedRelationshipBundle
} from "../graphics/RoutedRelationshipBundle";
import ResolvedRelationship from "../graphics/ResolvedRelationship";
import VisualGraph from "../graphics/VisualGraph";
import {
    bundle
} from "../model/graph/relationshipBundling";
import {
    nodeEditing,
    nodeSelected,
    relationshipSelected,
} from "../model/selection";
import CanvasAdaptor from "../graphics/utils/CanvasAdaptor";

export const measureTextContext = (() => {
    const canvas = window.document.createElement('canvas')
    return new CanvasAdaptor(canvas.getContext('2d'))
})()

export function getVisualNode(node, graph, selection, cachedImages) {
    return new VisualNode(
        node,
        graph,
        nodeSelected(selection, node.id),
        nodeEditing(selection, node.id),
        measureTextContext,
        cachedImages
    )
}

export function getVisualGraph(graph, selection, cachedImages) {
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

    const relationshipBundles = bundle(resolvedRelationships).map(bundle => {
        return new RoutedRelationshipBundle(bundle, graph, selection, measureTextContext, cachedImages);
    })

    return new VisualGraph(graph, visualNodes, relationshipBundles, measureTextContext)
}