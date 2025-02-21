import { BaseNode } from './base-node';
import { NodeHandle, NodeMeta, Flow } from '../types/flow';

interface GroupNodeData {
    name: string;
    description?: string;
    // The internal flow structure
    flow: Flow;
    // Mapping of external handles to internal nodes/handles
    handleMapping: {
        [externalHandleId: string]: {
            nodeId: string;
            handleId: string;
        };
    };
}

export class GroupNode extends BaseNode<GroupNodeData> {
    static readonly TYPE = 'group';

    constructor(
        id: string,
        data: GroupNodeData,
        version: string = '1.0.0',
        meta?: NodeMeta
    ) {
        super(id, GroupNode.TYPE, data, version, meta);
    }

    protected computeInputHandles(data: GroupNodeData = this.data): readonly NodeHandle[] {
        // Convert internal input handles to group handles
        const handles: NodeHandle[] = [];
        
        for (const [externalId, mapping] of Object.entries(data.handleMapping)) {
            const node = data.flow.nodes.find(n => n.id === mapping.nodeId);
            if (!node) continue;

            const internalHandle = node.handles?.find(h => h.id === mapping.handleId && h.type === 'input');
            if (!internalHandle) continue;

            handles.push({
                id: externalId,
                type: 'input',
                dataType: internalHandle.dataType,
                label: internalHandle.label || `Input ${handles.length + 1}`,
                rules: internalHandle.rules
            });
        }

        return handles;
    }

    protected computeOutputHandles(data: GroupNodeData = this.data): readonly NodeHandle[] {
        // Convert internal output handles to group handles
        const handles: NodeHandle[] = [];
        
        for (const [externalId, mapping] of Object.entries(data.handleMapping)) {
            const node = data.flow.nodes.find(n => n.id === mapping.nodeId);
            if (!node) continue;

            const internalHandle = node.handles?.find(h => h.id === mapping.handleId && h.type === 'output');
            if (!internalHandle) continue;

            handles.push({
                id: externalId,
                type: 'output',
                dataType: internalHandle.dataType,
                label: internalHandle.label || `Output ${handles.length + 1}`,
                rules: internalHandle.rules
            });
        }

        return handles;
    }

    // Methods for managing the internal flow
    getFlow(): Flow {
        return this.data.flow;
    }

    setFlow(flow: Flow): void {
        this.data.flow = flow;
        // Validate handle mappings after flow update
        this.validateHandleMappings();
    }

    // Handle mapping management
    addHandleMapping(externalId: string, nodeId: string, handleId: string): void {
        this.data.handleMapping[externalId] = { nodeId, handleId };
        this.validateHandleMappings();
    }

    removeHandleMapping(externalId: string): void {
        delete this.data.handleMapping[externalId];
    }

    private validateHandleMappings(): void {
        for (const [externalId, mapping] of Object.entries(this.data.handleMapping)) {
            const node = this.data.flow.nodes.find(n => n.id === mapping.nodeId);
            if (!node) {
                throw new Error(`Invalid handle mapping: Node ${mapping.nodeId} not found`);
            }

            const handle = node.handles?.find(h => h.id === mapping.handleId);
            if (!handle) {
                throw new Error(`Invalid handle mapping: Handle ${mapping.handleId} not found on node ${mapping.nodeId}`);
            }
        }
    }

    // Override toJSON to include group-specific data
    toJSON() {
        return {
            ...super.toJSON(),
            flow: this.data.flow,
            handleMapping: this.data.handleMapping
        };
    }
} 