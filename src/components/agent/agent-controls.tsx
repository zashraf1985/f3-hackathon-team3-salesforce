"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Settings, MessageSquare, Pause, Square, Play } from "lucide-react"
import { cn } from "@/lib/utils"

interface AgentControlsProps {
  className?: string
  onPause?: () => void
  onStop?: () => void
  onChat?: () => void
  onSettings?: () => void
  isPaused?: boolean
  isStopped?: boolean
}

export function AgentControls({
  className,
  onPause,
  onStop,
  onChat,
  onSettings,
  isPaused = false,
  isStopped = false,
}: AgentControlsProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="flex gap-1">
        <Button
          variant={isPaused ? "default" : "outline"}
          size="icon"
          onClick={onPause}
          className={cn(
            "h-9 w-9 transition-colors",
            isPaused && "bg-primary text-primary-foreground hover:bg-primary/90"
          )}
          aria-label={isPaused ? "Resume agent" : "Pause agent"}
        >
          {isPaused ? (
            <Play className="h-4 w-4" />
          ) : (
            <Pause className="h-4 w-4" />
          )}
          <span className="sr-only">{isPaused ? "Resume" : "Pause"}</span>
        </Button>

        <Button
          variant="outline"
          size="icon"
          onClick={onStop}
          className={cn(
            "h-9 w-9 transition-colors",
            isStopped && "bg-destructive text-destructive-foreground hover:bg-destructive/90"
          )}
          aria-label="Stop agent"
        >
          <Square className="h-4 w-4" />
          <span className="sr-only">Stop</span>
        </Button>
      </div>

      <Button
        variant="outline"
        size="icon"
        onClick={onChat}
        className="h-9 w-9"
        aria-label="Chat with agent"
      >
        <MessageSquare className="h-4 w-4" />
        <span className="sr-only">Chat</span>
      </Button>

      <Button
        variant="outline"
        onClick={onSettings}
        className="h-9"
        aria-label="Agent settings"
      >
        <Settings className="h-4 w-4 mr-2" />
        Settings
      </Button>
    </div>
  )
} 