function getVisualNode(node, graph, selection, cachedImages) {
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
    const visualNodes = graph.nodes.reduce((nodeMap, node) => {
        nodeMap[node.id] = getVisualNode(node, graph, selection, cachedImages)
        return nodeMap
    }, {})

    const relationshipAttachments = computeRelationshipAttachments(graph, visualNodes)

    const resolvedRelationships = graph.relationships.map(relationship =>
        new ResolvedRelationship(
            relationship,
            visualNodes[relationship.fromId],
            visualNodes[relationship.toId],
            relationshipAttachments.start[relationship.id],
            relationshipAttachments.end[relationship.id],
            relationshipSelected(selection, relationship.id),
            graph)
    )
    const relationshipBundles = bundle(resolvedRelationships).map(bundle => {
        return new RoutedRelationshipBundle(bundle, graph, selection, measureTextContext, cachedImages);
    })

    return new VisualGraph(graph, visualNodes, relationshipBundles, measureTextContext)
}