# Core Error Handling Architecture

This document describes the error handling and loading state strategy for AgentDock Core (the open-source framework). AgentDock Pro builds upon these foundations and may have additional, Pro-specific error handling mechanisms.

## Error Boundaries

The application uses React Error Boundaries to gracefully handle runtime errors in components. Error boundaries are implemented at strategic points in the component tree:

1.  **Component Level**
    *   `AgentCard`: Catches errors in individual agent card rendering
    *   `SettingsSheet`: Handles errors in agent settings management
    *   `SettingsPage`: Manages errors in global settings

2.  **Features**
    *   Fallback UI with descriptive error messages
    *   Error reporting to console with component stack traces
    *   Automatic retry mechanism with prop changes
    *   Development mode component stack traces
    *   User-friendly error messages for known error types

3.  **Error Types**
    *   `SecurityError`: Permissions and authentication issues (Note: Within the Core framework, this primarily relates to issues with provided API keys, not user authentication, which is handled by the consuming application).
    *   `NetworkError`: API and connectivity problems
    *   `ValidationError`: Input validation failures
    *   `StorageError`: Local storage access issues

4.  **Recovery Mechanisms**
    *   Retry button for temporary errors
    *   Navigation options for critical failures
    *   Automatic reset on prop changes
    *   Clear error state on component unmount

## Loading States

1.  **Initial Loading**
    *   Skeleton screens for data-dependent components
    *   Loading indicators for async operations
    *   Progress feedback for long-running tasks

2.  **Operation Loading**
    *   Button loading states
    *   Form submission indicators
    *   Save operation feedback

3.  **Components with Loading States**
    *   `AgentCard`: Shows skeleton while loading agent data
    *   `SettingsSheet`: Displays loading state during settings operations
    *   `SettingsPage`: Indicates loading during global settings management

## Best Practices

1.  **Error Handling**
    *   Use error boundaries for component-level error management.
    *   Provide meaningful error messages.
    *   Include recovery options where possible.
    *   Log errors for debugging.
    *   Handle both expected and unexpected errors.

2.  **Loading States**
    *   Show loading feedback for operations > 300ms.
    *   Use skeleton screens for initial content loading.
    *   Maintain layout stability during loading.
    *   Disable interactions while loading.
    *   Show progress for long operations.

3.  **User Experience**
    *   Clear error messages
    *   Actionable recovery options
    *   Consistent loading indicators
    *   Smooth transitions
    *   Helpful feedback