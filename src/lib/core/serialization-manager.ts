import { Flow, FlowNode, Edge, isFlowNode, isEdge } from '../types/flow';
import { NodeRegistry } from './node-registry';
import { BaseNode } from './base-node';

export class SerializationManager {
    private static instance: SerializationManager;
    private registry: NodeRegistry;

    private constructor() {
        this.registry = NodeRegistry.getInstance();
    }

    static getInstance(): SerializationManager {
        if (!SerializationManager.instance) {
            SerializationManager.instance = new SerializationManager();
        }
        return SerializationManager.instance;
    }

    // Serialize a collection of nodes and edges into a flow
    serializeFlow(
        nodes: BaseNode[],
        edges: Edge[],
        name: string,
        description?: string
    ): Flow {
        const flowNodes: FlowNode[] = nodes.map(node => {
            const nodeJson = node.toJSON();
            return {
                id: nodeJson.id,
                type: nodeJson.type,
                data: nodeJson.data,
                version: nodeJson.version,
                meta: nodeJson.meta,
                position: { x: 0, y: 0 }, // Position should be provided by the visual builder
                handles: nodeJson.handles
            };
        });

        return {
            id: crypto.randomUUID(),
            name,
            description,
            version: '1.0.0',
            nodes: flowNodes,
            edges,
            meta: {
                created: new Date().toISOString(),
                modified: new Date().toISOString()
            }
        };
    }

    // Deserialize a flow into a collection of nodes and edges
    deserializeFlow(flow: Flow): { nodes: BaseNode[], edges: Edge[] } {
        this.validateFlow(flow);

        const nodes = flow.nodes.map(node => {
            try {
                return this.registry.create(
                    node.type,
                    node.id,
                    node.data,
                    node.version,
                    node.meta
                );
            } catch (error: unknown) {
                const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                throw new Error(`Failed to create node ${node.id} of type ${node.type}: ${errorMessage}`);
            }
        });

        return {
            nodes,
            edges: flow.edges
        };
    }

    // Save a flow to JSON string
    saveToJson(flow: Flow): string {
        return JSON.stringify(flow, null, 2);
    }

    // Load a flow from JSON string
    loadFromJson(json: string): Flow {
        try {
            const flow = JSON.parse(json);
            this.validateFlow(flow);
            return flow;
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            throw new Error(`Failed to parse flow JSON: ${errorMessage}`);
        }
    }

    // Validate flow structure
    private validateFlow(flow: Flow): void {
        if (!flow.nodes || !Array.isArray(flow.nodes)) {
            throw new Error('Flow must have an array of nodes');
        }

        if (!flow.edges || !Array.isArray(flow.edges)) {
            throw new Error('Flow must have an array of edges');
        }

        // Validate each node
        flow.nodes.forEach(node => {
            if (!isFlowNode(node)) {
                throw new Error(`Invalid node structure: ${JSON.stringify(node)}`);
            }

            if (!this.registry.has(node.type)) {
                throw new Error(`Unknown node type: ${node.type}`);
            }
        });

        // Validate each edge
        flow.edges.forEach(edge => {
            if (!isEdge(edge)) {
                throw new Error(`Invalid edge structure: ${JSON.stringify(edge)}`);
            }

            // Check if source and target nodes exist
            const sourceNode = flow.nodes.find(n => n.id === edge.source);
            const targetNode = flow.nodes.find(n => n.id === edge.target);

            if (!sourceNode) {
                throw new Error(`Edge source node not found: ${edge.source}`);
            }

            if (!targetNode) {
                throw new Error(`Edge target node not found: ${edge.target}`);
            }

            // Check if handles exist on nodes
            const sourceHandles = sourceNode.handles?.filter(h => h.type === 'output') || [];
            const targetHandles = targetNode.handles?.filter(h => h.type === 'input') || [];

            if (!sourceHandles.some(h => h.id === edge.sourceHandle)) {
                throw new Error(`Source handle not found: ${edge.sourceHandle}`);
            }

            if (!targetHandles.some(h => h.id === edge.targetHandle)) {
                throw new Error(`Target handle not found: ${edge.targetHandle}`);
            }
        });
    }
} 