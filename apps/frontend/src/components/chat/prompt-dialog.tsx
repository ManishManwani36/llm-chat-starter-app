import { Pencil, Plus, Save, Trash2 } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { usePrompts } from "@/store/prompts";

export const PromptDialog = () => {
  const { prompts, addPrompt, updatePrompt, deletePrompt } = usePrompts();
  const [isOpen, setIsOpen] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState<{
    id: string;
    title: string;
    content: string;
  } | null>(null);

  const handleSave = () => {
    if (!editingPrompt) return;

    if (editingPrompt.id) {
      updatePrompt(editingPrompt.id, {
        title: editingPrompt.title,
        content: editingPrompt.content,
      });
    } else {
      addPrompt({
        title: editingPrompt.title,
        content: editingPrompt.content,
      });
    }
    setEditingPrompt(null);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="h-12">
          <Plus className="h-4 w-4" />
          Prompts
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Manage Prompts</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-4">
            {prompts.map((prompt) => (
              <div
                key={prompt.id}
                className="flex items-start justify-between space-x-4 rounded-lg border p-4">
                <div className="flex-1 space-y-2">
                  <h4 className="font-medium">{prompt.title}</h4>
                  <p className="text-sm text-muted-foreground">
                    {prompt.content}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingPrompt(prompt)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deletePrompt(prompt.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
          {editingPrompt && (
            <div className="space-y-4 rounded-lg border p-4">
              <Input
                placeholder="Prompt title"
                value={editingPrompt.title}
                onChange={(e) =>
                  setEditingPrompt({ ...editingPrompt, title: e.target.value })
                }
              />
              <Textarea
                placeholder="Prompt content"
                value={editingPrompt.content}
                onChange={(e) =>
                  setEditingPrompt({
                    ...editingPrompt,
                    content: e.target.value,
                  })
                }
              />
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setEditingPrompt(null)}>
                  Cancel
                </Button>
                <Button onClick={handleSave}>Save</Button>
              </div>
            </div>
          )}
          {!editingPrompt && (
            <Button
              variant="outline"
              className="w-full"
              onClick={() =>
                setEditingPrompt({ id: "", title: "", content: "" })
              }>
              <Plus className="h-4 w-4 mr-2" />
              Add New Prompt
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
