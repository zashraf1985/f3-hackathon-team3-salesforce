import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { AgentState, SecureStorage } from 'agentdock-core';
import { Agent, AgentMetadata } from '@/lib/store/helpers';

export async function POST(req: Request) {
  try {
    const storage = SecureStorage.getInstance('agentdock');
    const data = await req.json();
    
    // Generate new agent with required fields
    const now = Date.now();
    const agent: Agent = {
      id: uuidv4(),
      name: data.name,
      description: data.description || '',
      storagePath: data.storagePath,
      isActive: false,
      state: AgentState.CREATED,
      metadata: {
        state: AgentState.CREATED,
        createdAt: now,
        lastStateChange: now,
        systemPrompt: data.systemPrompt
      },
      maxConcurrency: data.maxConcurrency,
      nodes: [],
      createdAt: now,
      updatedAt: now
    };
    
    // Get existing agents
    const agents = (await storage.get('agents') || []) as Agent[];
    
    // Add new agent
    agents.push(agent);
    
    // Save updated list
    await storage.set('agents', agents);
    await storage.set(`agent:${agent.id}`, agent);
    
    return NextResponse.json(agent);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const storage = SecureStorage.getInstance('agentdock');
    const agents = (await storage.get('agents') || []) as Agent[];
    return NextResponse.json(agents);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 