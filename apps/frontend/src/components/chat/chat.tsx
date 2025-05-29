import { useEffect, useRef, useState } from "react";

import { ChatInput } from "@/components/chat/chat-input";
import { ChatMessage } from "@/components/chat/chat-message";
import { ChatSidebar } from "@/components/chat/chat-sidebar";
import { useChatSessions } from "@/store/chat-sessions";

export const Chat = () => {
  const {
    sessions,
    currentSessionId,
    addMessageToSession,
    updateLastMessageInSession,
  } = useChatSessions();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [isTyping, setIsTyping] = useState(false);

  const currentSession = sessions.find((s) => s.id === currentSessionId);

  // Scroll to bottom when messages change or typing state changes
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [currentSession?.messages, isTyping]);

  const handleSendMessage = async (
    content: string,
    file?: { name: string; type: string; data: string }
  ) => {
    if (!currentSessionId) return;

    // Add user message
    addMessageToSession(currentSessionId, {
      role: "user",
      content,
      file,
    });

    // Add empty assistant message that will be streamed
    addMessageToSession(currentSessionId, {
      role: "assistant",
      content: "",
    });

    setIsTyping(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [
            ...(currentSession?.messages || []),
            { role: "user", content, file },
          ],
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
                updateLastMessageInSession(currentSessionId, data.content);
              }
            } catch (e) {
              console.error("Error parsing SSE data:", e);
            }
          }
        }
      }
    } catch (error) {
      console.error("Error:", error);
      updateLastMessageInSession(
        currentSessionId,
        "Sorry, there was an error processing your request."
      );
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex h-full">
      <ChatSidebar />
      <div className="flex flex-1 flex-col">
        <div className="flex-1 overflow-y-auto" ref={scrollAreaRef}>
          <div className="max-w-screen-md mx-auto py-8 px-4">
            {!currentSession ? (
              <div className="flex w-full h-full items-center justify-center">
                <p className="text-center text-muted-foreground">
                  Select a chat or start a new one.
                </p>
              </div>
            ) : currentSession.messages.length === 0 ? (
              <div className="flex w-full h-full items-center justify-center">
                <p className="text-center text-muted-foreground">
                  Start a conversation with the AI assistant.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {currentSession.messages.map((message, index) => (
                  <ChatMessage
                    key={index}
                    message={message}
                    isTyping={
                      isTyping &&
                      index === currentSession.messages.length - 1 &&
                      message.role === "assistant"
                    }
                  />
                ))}
              </div>
            )}
          </div>
        </div>
        {currentSession && (
          <div className="w-full bg-background z-20 p-4 border-t">
            <div className="max-w-screen-md mx-auto">
              <ChatInput
                onTypingChange={setIsTyping}
                onSendMessage={handleSendMessage}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
