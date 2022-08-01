// exort user interface event

/**
 * CREATE_NODE
 * DELETE_NODES_AND_RELATIONSHIPS
 */

import { 
    createNode, 
    deleteSelection, 
    validateGraph,
    setNodeCaption,
    setNodeConcept
} from './actions/graph'
import { windowResized } from './actions/applicationLayout'

export const USER_CREATE_NODE = createNode
export const USER_DELETE_NODES_AND_RELATIONSHIPS = deleteSelection
export const USER_VALIDATE_GRAPH = validateGraph
export const USER_WINDOW_RESIZED = windowResized

// node
export const USER_NODE_CAPTION = setNodeCaption
export const USER__NODE_CONCEPT = setNodeConcept