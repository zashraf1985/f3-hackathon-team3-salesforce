/**
 * @fileoverview Node registry system for managing core and custom nodes.
 * Provides a central registry for node types and their metadata.
 */

import { BaseNode, NodeMetadata, BaseNodeConstructor } from '../types/node';

/**
 * Metadata for the node registry, including both core and custom nodes.
 */
export interface NodeRegistryMetadata {
  /** Core nodes registered in the system */
  nodes: Array<{
    type: string;
    metadata: NodeMetadata;
  }>;
  /** Custom nodes registered in the system */
  customNodes: Array<{
    type: string;
    metadata: NodeMetadata;
  }>;
}

/**
 * Central registry for managing node types in the system.
 * Handles both core and custom nodes with proper validation.
 */
export class NodeRegistry {
  /** Map of registered core nodes */
  private static nodes: Map<string, BaseNodeConstructor> = new Map();
  
  /** Map of registered custom nodes */
  private static customNodes: Map<string, BaseNodeConstructor> = new Map();

  /**
   * Register a core node type.
   * @throws Error if the node's category is not 'core'
   */
  static register(nodeType: string, nodeClass: BaseNodeConstructor): void {
    const metadata = nodeClass.getNodeMetadata();
    if (metadata.category !== 'core') {
      throw new Error('Only core nodes can be registered with register()');
    }
    this.nodes.set(nodeType, nodeClass);
  }

  /**
   * Register a custom node type.
   * @throws Error if the node's category is not 'custom'
   */
  static registerCustomNode(nodeType: string, nodeClass: BaseNodeConstructor): void {
    const metadata = nodeClass.getNodeMetadata();
    if (metadata.category !== 'custom') {
      throw new Error('Only custom nodes can be registered with registerCustomNode()');
    }
    this.customNodes.set(nodeType, nodeClass);
  }

  /**
   * Get a node class by its type.
   * Searches both core and custom nodes.
   */
  static get(nodeType: string): BaseNodeConstructor | undefined {
    return this.nodes.get(nodeType) || this.customNodes.get(nodeType);
  }

  /**
   * Get all registered core nodes.
   */
  static getAll(): BaseNodeConstructor[] {
    return Array.from(this.nodes.values());
  }

  /**
   * Get all registered custom nodes.
   */
  static getCustomNodes(): BaseNodeConstructor[] {
    return Array.from(this.customNodes.values());
  }

  /**
   * Get nodes by category (core or custom).
   */
  static getNodesByCategory(category: 'core' | 'custom'): BaseNodeConstructor[] {
    return category === 'core' ? this.getAll() : this.getCustomNodes();
  }

  /**
   * Get metadata for all registered nodes.
   */
  static getNodeMetadata(): NodeRegistryMetadata {
    return {
      nodes: Array.from(this.nodes.entries()).map(([type, NodeClass]) => ({
        type,
        metadata: NodeClass.getNodeMetadata()
      })),
      customNodes: Array.from(this.customNodes.entries()).map(([type, NodeClass]) => ({
        type,
        metadata: NodeClass.getNodeMetadata()
      }))
    };
  }
} 