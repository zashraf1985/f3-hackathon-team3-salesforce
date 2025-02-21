'use client';

/**
 * @fileoverview Agent details view component.
 */

import * as React from "react";
import { useActiveAgent } from "@/lib/store/hooks";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertCircle, Trash } from "lucide-react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { ErrorBoundary } from "@/components/error-boundary";

interface AgentMetadata {
  createdAt?: number;
  lastStateChange: number;
  error?: {
    message: string;
  };
}

interface Agent {
  name: string;
  description: string;
  metadata: AgentMetadata;
}

function BaseAgentDetails({ agent }: { agent: Agent }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{agent.name}</CardTitle>
            <CardDescription>{agent.description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="chat" className="space-y-4">
          <TabsList>
            <TabsTrigger value="chat">Chat</TabsTrigger>
            <TabsTrigger value="config">Config</TabsTrigger>
          </TabsList>
          
          <TabsContent value="chat">
            <Card>
              <CardHeader>
                <CardTitle>Chat</CardTitle>
                <CardDescription>
                  Chat with your agent
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {/* Chat content */}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="config">
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium">Configuration</h4>
                <div className="mt-2 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Created</span>
                    <span>
                      {new Date(agent.metadata.createdAt || Date.now()).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Last Active</span>
                    <span>
                      {new Date(agent.metadata.lastStateChange).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {agent.metadata.error && (
                <div className="rounded-md bg-red-50 p-4">
                  <div className="flex">
                    <AlertCircle className="h-5 w-5 text-red-400" />
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800">
                        Error Details
                      </h3>
                      <div className="mt-2 text-sm text-red-700">
                        <p>{agent.metadata.error.message}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="justify-end">
        <Button
          size="sm"
          variant="destructive"
          onClick={() => {
            if (confirm('Are you sure you want to delete this agent?')) {
              // TODO: Implement agent deletion
            }
          }}
        >
          <Trash className="mr-2 h-4 w-4" />
          Delete Agent
        </Button>
      </CardFooter>
    </Card>
  );
}

export function AgentDetails() {
  const agent = useActiveAgent();

  if (!agent) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Agent Selected</CardTitle>
          <CardDescription>
            Select an agent from the list to view details
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <ErrorBoundary>
      <BaseAgentDetails agent={agent} />
    </ErrorBoundary>
  );
} 