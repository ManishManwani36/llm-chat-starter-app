import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Message } from "@/types/chat";

export interface ChatSession {
  id: string;
  name: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
}

interface ChatSessionsState {
  sessions: ChatSession[];
  currentSessionId: string | null;
  addSession: (
    session: Omit<ChatSession, "id" | "createdAt" | "updatedAt">
  ) => void;
  updateSession: (
    id: string,
    session: Partial<Omit<ChatSession, "id" | "createdAt" | "updatedAt">>
  ) => void;
  deleteSession: (id: string) => void;
  setCurrentSession: (id: string | null) => void;
  addMessageToSession: (sessionId: string, message: Message) => void;
  updateLastMessageInSession: (sessionId: string, content: string) => void;
  clearSessionMessages: (sessionId: string) => void;
}

export const useChatSessions = create<ChatSessionsState>()(
  persist(
    (set) => ({
      sessions: [],
      currentSessionId: null,
      addSession: (session) =>
        set((state) => {
          const newSession = {
            ...session,
            id: crypto.randomUUID(),
            createdAt: Date.now(),
            updatedAt: Date.now(),
          };
          return {
            sessions: [...state.sessions, newSession],
            currentSessionId: newSession.id,
          };
        }),
      updateSession: (id, session) =>
        set((state) => ({
          sessions: state.sessions.map((s) =>
            s.id === id ? { ...s, ...session, updatedAt: Date.now() } : s
          ),
        })),
      deleteSession: (id) =>
        set((state) => ({
          sessions: state.sessions.filter((s) => s.id !== id),
          currentSessionId:
            state.currentSessionId === id ? null : state.currentSessionId,
        })),
      setCurrentSession: (id) => set({ currentSessionId: id }),
      addMessageToSession: (sessionId, message) =>
        set((state) => ({
          sessions: state.sessions.map((s) =>
            s.id === sessionId
              ? {
                  ...s,
                  messages: [...s.messages, message],
                  updatedAt: Date.now(),
                  // Update name based on first user message if not set
                  name:
                    s.name === "New Chat" && message.role === "user"
                      ? message.content.slice(0, 30) +
                        (message.content.length > 30 ? "..." : "")
                      : s.name,
                }
              : s
          ),
        })),
      updateLastMessageInSession: (sessionId, content) =>
        set((state) => ({
          sessions: state.sessions.map((s) =>
            s.id === sessionId
              ? {
                  ...s,
                  messages: s.messages.map((msg, idx) =>
                    idx === s.messages.length - 1
                      ? { ...msg, content: msg.content + content }
                      : msg
                  ),
                  updatedAt: Date.now(),
                }
              : s
          ),
        })),
      clearSessionMessages: (sessionId) =>
        set((state) => ({
          sessions: state.sessions.map((s) =>
            s.id === sessionId
              ? { ...s, messages: [], updatedAt: Date.now() }
              : s
          ),
        })),
    }),
    {
      name: "chat-sessions-storage",
    }
  )
);
