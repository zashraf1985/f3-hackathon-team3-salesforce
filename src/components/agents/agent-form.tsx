'use client';

/**
 * @fileoverview Agent creation form component.
 */

import * as React from "react";
import { useCallback } from "react";
import { useAgentActions } from "@/lib/store/hooks";
import { SecureStorage } from "agentdock-core";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { AgentState } from "@/core/types/agent";

/**
 * Form validation schema
 */
const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional().default(""),
  maxConcurrency: z.number().min(1).max(10).default(1),
  storagePath: z.string().min(1, "Storage path is required"),
  systemPrompt: z.string().optional()
});

type FormData = z.infer<typeof formSchema>;

const defaultValues: FormData = {
  name: "",
  description: "",
  maxConcurrency: 1,
  storagePath: "agents",
  systemPrompt: "You are a helpful AI assistant."
};

/**
 * Agent creation form component
 */
export function AgentForm() {
  const { addAgent } = useAgentActions();
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  /**
   * Handle form submission
   */
  const onSubmit = useCallback(async (data: FormData) => {
    try {
      // Add new agent
      addAgent({
        name: data.name,
        description: data.description || "",
        storagePath: data.storagePath,
        maxConcurrency: data.maxConcurrency,
        systemPrompt: data.systemPrompt
      });

      // Reset form
      form.reset(defaultValues);
    } catch (error) {
      console.error("Failed to create agent:", error);
      alert("Failed to create agent. Please try again.");
    }
  }, [addAgent, form]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Agent</CardTitle>
        <CardDescription>
          Configure a new agent with storage and execution settings
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="My Agent" {...field} value={field.value || ""} />
                  </FormControl>
                  <FormDescription>
                    A unique name for your agent
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="What does this agent do?"
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormDescription>
                    A brief description of the agent's purpose
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="maxConcurrency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Max Concurrency</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      max={10}
                      {...field}
                      value={field.value || 1}
                      onChange={e => {
                        const value = e.target.value ? parseInt(e.target.value, 10) : 1;
                        field.onChange(value);
                      }}
                    />
                  </FormControl>
                  <FormDescription>
                    Maximum number of concurrent instances (1-10)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="storagePath"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Storage Prefix</FormLabel>
                  <FormControl>
                    <Input placeholder="agents" {...field} value={field.value || ""} />
                  </FormControl>
                  <FormDescription>
                    Base path for agent storage
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="systemPrompt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>System Prompt</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Instructions for the agent"
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormDescription>
                    Initial instructions for the agent
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter>
            <Button 
              type="submit" 
              className="ml-auto"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? "Creating..." : "Create Agent"}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
} 