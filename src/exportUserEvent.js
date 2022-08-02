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
    setNodeConcept,
    setAllProperty
} from './actions/graph'
import { windowResized } from './actions/applicationLayout'

export const USER_CREATE_NODE = createNode
export const USER_DELETE_NODES_AND_RELATIONSHIPS = deleteSelection
export const USER_VALIDATE_GRAPH = validateGraph
export const USER_WINDOW_RESIZED = windowResized

// node
export const USER_NODE_CAPTION = setNodeCaption
export const USER_NODE_CONCEPT = setNodeConcept
export const USER_NODE_PROPERTY = setAllProperty