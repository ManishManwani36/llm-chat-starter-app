import { Send } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useMessages } from "@/store/messages";
import { usePrompts } from "@/store/prompts";
import { PromptDialog } from "./prompt-dialog";

interface ChatInputProps {
  onTypingChange: (isTyping: boolean) => void;
}

export const ChatInput = ({ onTypingChange }: ChatInputProps) => {
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { messages, addMessage, updateLastMessage } = useMessages();
  const { prompts } = usePrompts();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Focus textarea when loading state changes to false
  useEffect(() => {
    if (!isLoading) {
      textareaRef.current?.focus();
    }
    onTypingChange(isLoading);
  }, [isLoading, onTypingChange]);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const resize = () => {
      textarea.style.height = "48px"; // Reset to initial height
      const lineHeight = parseInt(getComputedStyle(textarea).lineHeight);
      const maxHeight = lineHeight * 10; // 10 lines
      const newHeight = Math.min(textarea.scrollHeight, maxHeight);
      textarea.style.height = `${newHeight}px`;
    };

    resize();
    textarea.addEventListener("input", resize);
    return () => textarea.removeEventListener("input", resize);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!input.trim() || isLoading) return;

    // Add user message
    addMessage({
      role: "user",
      content: input,
    });

    // Add empty assistant message that will be streamed
    addMessage({
      role: "assistant",
      content: "",
    });

    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [...messages, { role: "user", content: input }],
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response");
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No reader available");

      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.content) {
                updateLastMessage(data.content);
              }
            } catch (e) {
              console.error("Error parsing SSE data:", e);
            }
          }
        }
      }
    } catch (error) {
      console.error("Error:", error);
      updateLastMessage("Sorry, there was an error processing your request.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="space-y-4">
      {prompts.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {prompts.map((prompt) => (
            <Button
              key={prompt.id}
              variant="outline"
              size="sm"
              onClick={() => setInput(prompt.content)}>
              {prompt.title}
            </Button>
          ))}
        </div>
      )}
      <form
        onSubmit={handleSubmit}
        className="flex w-full items-end space-x-3 bg-muted rounded-lg p-4">
        <PromptDialog />
        <Textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your message... (Shift + Enter for new line)"
          className="flex-1 px-3 py-2 text-base resize-none min-h-0 h-12 overflow-y-auto"
          disabled={isLoading}
        />
        <div className="flex space-x-2">
          <Button type="submit" className="size-12" disabled={isLoading}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  );
};
