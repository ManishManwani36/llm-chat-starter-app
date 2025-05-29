import { Plus, Trash2 } from "lucide-react";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { useChatSessions } from "@/store/chat-sessions";

export const ChatSidebar = () => {
  const {
    sessions,
    currentSessionId,
    addSession,
    setCurrentSession,
    deleteSession,
  } = useChatSessions();

  const handleNewChat = () => {
    addSession({
      name: "New Chat",
      messages: [],
    });
  };

  return (
    <div className="flex h-full w-64 flex-col border-r bg-background">
      <div className="p-4">
        <Button onClick={handleNewChat} className="w-full">
          <Plus className="mr-2 h-4 w-4" />
          New Chat
        </Button>
      </div>
      <div className="flex-1 overflow-y-scroll">
        <div className="space-y-1 p-2">
          {sessions.map((session) => (
            <div
              key={session.id}
              className={`flex items-center justify-between rounded-lg p-2 hover:bg-muted ${
                session.id === currentSessionId ? "bg-muted" : ""
              }`}>
              <button
                className="flex-1 text-left text-sm truncate"
                onClick={() => setCurrentSession(session.id)}>
                <div className="font-medium truncate">{session.name}</div>
                <div className="text-xs text-muted-foreground">
                  {format(session.updatedAt, "MMM d, h:mm a")}
                </div>
              </button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => deleteSession(session.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
