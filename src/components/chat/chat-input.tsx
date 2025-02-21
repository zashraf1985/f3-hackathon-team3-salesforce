"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

interface ChatInputProps {
  onSubmit: (content: string) => void
  isLoading?: boolean
  className?: string
}

export function ChatInput({ onSubmit, isLoading, className }: ChatInputProps) {
  const [content, setContent] = React.useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim()) return

    onSubmit(content)
    setContent("")
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e as unknown as React.FormEvent)
    }
  }

  return (
    <form onSubmit={handleSubmit} className={cn("flex items-end gap-2 p-4", className)}>
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type a message..."
        className="min-h-[60px] resize-none"
        disabled={isLoading}
      />
      <Button type="submit" disabled={isLoading || !content.trim()}>
        {isLoading ? "Sending..." : "Send"}
      </Button>
    </form>
  )
} 