'use client';

import { useEffect, useState } from 'react';
import { NodeRegistry } from 'agentdock-core';
import { ErrorBoundary } from "@/components/error-boundary";
import { ErrorInfo } from "react";

function BaseCoreInitializer() {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (!isInitialized) {
      try {
        // Initialize core nodes on client side
        // Core nodes are registered automatically when importing agentdock-core
        setIsInitialized(true);
      } catch (error) {
        console.error('Failed to initialize core nodes:', error);
      }
    }
  }, [isInitialized]);

  return null;
}

export function CoreInitializer() {
  return (
    <ErrorBoundary
      onError={(error: Error, errorInfo: ErrorInfo) => {
        console.error("Error in CoreInitializer:", error, errorInfo);
      }}
      resetOnPropsChange
    >
      <BaseCoreInitializer />
    </ErrorBoundary>
  );
} 