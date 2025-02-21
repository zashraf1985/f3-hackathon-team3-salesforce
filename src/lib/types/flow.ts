/**
 * Core types for AgentDock's flow-based architecture
 * These types are designed to be framework-agnostic
 */

export type NodeHandle = {
    id: string;
    // Previously known as "port type" in the old system
    type: 'input' | 'output';
    // The data type this handle accepts/produces
    dataType: string;
    label?: string;
    // Optional validation rules
    rules?: HandleRules;
};

export type HandleRules = {
    // Maximum number of connections allowed
    maxConnections?: number;
    // Allowed data types for connection
    allowedTypes?: string[];
    // Custom validation function
    validate?: (connection: Edge) => boolean;
};

export type NodeMeta = {
    // Visual customization (previously part of UI config)
    icon?: string;
    color?: string;
    width?: number;
    height?: number;
    shape?: 'rectangle' | 'circle' | 'diamond';
    // Additional metadata for the Pro visual builder
    category?: string;
    description?: string;
    tags?: string[];
};

export type FlowNode = {
    id: string;
    // The type of node (e.g., "CoreSerpNode")
    type: string;
    // Node configuration (previously known as config)
    data: Record<string, any>;
    // Semantic version for compatibility
    version: string;
    // Optional UI/visual metadata
    meta?: NodeMeta;
    // Dynamic handles (previously known as ports)
    handles?: NodeHandle[];
};

export type Edge = {
    id: string;
    // Source node and handle IDs
    source: string;
    sourceHandle: string;
    // Target node and handle IDs
    target: string;
    targetHandle: string;
    // Optional metadata
    meta?: {
        label?: string;
        animated?: boolean;
    };
};

export type Flow = {
    // Unique identifier for the flow
    id: string;
    // Flow metadata
    name: string;
    description?: string;
    version: string;
    // The actual flow structure
    nodes: FlowNode[];
    edges: Edge[];
    // Additional metadata
    meta?: {
        created: string;
        modified: string;
        author?: string;
        tags?: string[];
    };
};

// Type guard functions
export const isFlowNode = (node: any): node is FlowNode => {
    return node && 
           typeof node.id === 'string' &&
           typeof node.type === 'string' &&
           typeof node.data === 'object';
};

export const isEdge = (edge: any): edge is Edge => {
    return edge &&
           typeof edge.id === 'string' &&
           typeof edge.source === 'string' &&
           typeof edge.target === 'string';
};

// Serialization helpers
export const serializeFlow = (flow: Flow): string => {
    return JSON.stringify(flow, null, 2);
};

export const deserializeFlow = (json: string): Flow => {
    const flow = JSON.parse(json);
    if (!flow.nodes || !flow.edges || !Array.isArray(flow.nodes) || !Array.isArray(flow.edges)) {
        throw new Error('Invalid flow format');
    }
    return flow;
}; 