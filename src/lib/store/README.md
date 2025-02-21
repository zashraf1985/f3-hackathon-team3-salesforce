# AgentDock Store

This directory contains the core state management implementation for AgentDock, built with React Context and the Context API. It provides a type-safe state management solution for managing agents and their nodes.

## Features

- Type-safe state management with TypeScript
- Minimal persistence using localStorage
- Clean separation between Core and Pro features
- Efficient agent lifecycle management
- Automatic template loading from filesystem

## Structure

- `index.ts` - Main store exports and types
- `agentContext.tsx` - React Context implementation
- `types.ts` - TypeScript types and interfaces

## Usage

```tsx
import { useAgents } from '@/lib/store';

function MyComponent() {
  const { agents, initialize, isInitialized } = useAgents();
  
  useEffect(() => {
    if (!isInitialized) {
      initialize();
    }
  }, [initialize, isInitialized]);

  return (
    <div>
      {agents.map(agent => (
        <div key={agent.id}>
          {agent.name}
        </div>
      ))}
    </div>
  );
}
```

## State Structure

The store manages:
- List of agents
- Active agent ID
- Initialization state
- Agent lifecycle methods (start, pause, resume, stop)

## Agent Templates

Agent templates are loaded from the filesystem:
```
src/lib/agents/{agent-name}/template.json
```

Each template defines:
- Agent name and description
- Model configuration
- Tools and RAG settings
- Instructions for contributors 