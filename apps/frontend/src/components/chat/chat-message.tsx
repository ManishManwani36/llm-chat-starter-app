import { FileIcon } from "lucide-react";
import ReactMarkdown from "react-markdown";

import { TypingIndicator } from "@/components/chat/typing-indicator";
import { cn } from "@/lib/utils";
import type { Message } from "@/types/chat";

interface ChatMessageProps {
  message: Message;
  isTyping?: boolean;
}

export const ChatMessage = ({ message, isTyping }: ChatMessageProps) => {
  const isUser = message.role === "user";

  return (
    <div className={cn("flex mb-4", isUser ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "rounded-lg p-3 space-y-2",
          isUser
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-foreground"
        )}>
        {message.file && (
          <div className="flex items-center space-x-2 text-sm">
            <FileIcon className="h-4 w-4" />
            <span>{message.file.name}</span>
          </div>
        )}
        {message.content ? (
          <ReactMarkdown>{message.content}</ReactMarkdown>
        ) : isTyping ? (
          <TypingIndicator />
        ) : null}
      </div>
    </div>
  );
};
