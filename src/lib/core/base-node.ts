import { NodeHandle, NodeMeta, HandleRules, Edge } from '../types/flow';

export abstract class BaseNode<TData = any> {
    protected readonly id: string;
    protected readonly type: string;
    protected data: TData;
    protected version: string;
    protected meta?: NodeMeta;

    constructor(id: string, type: string, data: TData, version: string = '1.0.0', meta?: NodeMeta) {
        this.id = id;
        this.type = type;
        this.data = data;
        this.version = version;
        this.meta = meta;
    }

    // Public methods for handle access
    getInputHandles(data?: TData): readonly NodeHandle[] {
        try {
            return this.computeInputHandles(data || this.data);
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            throw new Error(`Failed to get input handles for node ${this.id}: ${errorMessage}`);
        }
    }

    getOutputHandles(data?: TData): readonly NodeHandle[] {
        try {
            return this.computeOutputHandles(data || this.data);
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            throw new Error(`Failed to get output handles for node ${this.id}: ${errorMessage}`);
        }
    }

    // Protected methods for handle computation
    protected abstract computeInputHandles(data: TData): readonly NodeHandle[];
    protected abstract computeOutputHandles(data: TData): readonly NodeHandle[];

    // New method for async initialization
    async initialize(): Promise<void> {
        try {
            await this.doInitialize();
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            throw new Error(`Failed to initialize node ${this.id}: ${errorMessage}`);
        }
    }

    // Protected method for actual initialization logic
    protected async doInitialize(): Promise<void> {
        // Default implementation does nothing
        return Promise.resolve();
    }

    // Validation methods
    validateConnection(edge: Edge): boolean {
        try {
            const sourceHandle = this.getOutputHandles().find(h => h.id === edge.sourceHandle);
            const targetHandle = this.getInputHandles().find(h => h.id === edge.targetHandle);

            if (!sourceHandle || !targetHandle) {
                return false;
            }

            // Check data type compatibility
            if (sourceHandle.dataType !== targetHandle.dataType) {
                return false;
            }

            // Apply handle-specific rules
            return this.validateHandleRules(sourceHandle.rules, edge) && 
                   this.validateHandleRules(targetHandle.rules, edge);
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            throw new Error(`Failed to validate connection for node ${this.id}: ${errorMessage}`);
        }
    }

    private validateHandleRules(rules?: HandleRules, edge?: Edge): boolean {
        if (!rules || !edge) return true;

        if (rules.validate && !rules.validate(edge)) {
            return false;
        }

        // Add more rule validations as needed
        return true;
    }

    // Getters
    getId(): string {
        return this.id;
    }

    getType(): string {
        return this.type;
    }

    getData(): TData {
        return this.data;
    }

    getVersion(): string {
        return this.version;
    }

    getMeta(): NodeMeta | undefined {
        return this.meta;
    }

    // Setters with validation
    setData(data: TData): void {
        try {
            this.validateData(data);
            this.data = data;
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            throw new Error(`Failed to set data for node ${this.id}: ${errorMessage}`);
        }
    }

    protected validateData(data: TData): void {
        // Default implementation does no validation
        // Subclasses can override to add specific validation
    }

    setMeta(meta: NodeMeta): void {
        this.meta = meta;
    }

    // Serialization
    toJSON() {
        return {
            id: this.id,
            type: this.type,
            data: this.data,
            version: this.version,
            meta: this.meta,
            handles: [
                ...this.getInputHandles(),
                ...this.getOutputHandles()
            ]
        };
    }
} 