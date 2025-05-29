import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Prompt {
  id: string;
  title: string;
  content: string;
  createdAt: number;
  updatedAt: number;
}

interface PromptStore {
  prompts: Prompt[];
  addPrompt: (prompt: Omit<Prompt, "id" | "createdAt" | "updatedAt">) => void;
  updatePrompt: (
    id: string,
    prompt: Partial<Omit<Prompt, "id" | "createdAt" | "updatedAt">>
  ) => void;
  deletePrompt: (id: string) => void;
}

export const usePrompts = create<PromptStore>()(
  persist(
    (set) => ({
      prompts: [],
      addPrompt: (prompt) =>
        set((state) => ({
          prompts: [
            ...state.prompts,
            {
              ...prompt,
              id: crypto.randomUUID(),
              createdAt: Date.now(),
              updatedAt: Date.now(),
            },
          ],
        })),
      updatePrompt: (id, prompt) =>
        set((state) => ({
          prompts: state.prompts.map((p) =>
            p.id === id ? { ...p, ...prompt, updatedAt: Date.now() } : p
          ),
        })),
      deletePrompt: (id) =>
        set((state) => ({
          prompts: state.prompts.filter((p) => p.id !== id),
        })),
    }),
    {
      name: "prompts-storage",
    }
  )
);
