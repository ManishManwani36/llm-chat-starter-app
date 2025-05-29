export interface Message {
  role: "user" | "assistant";
  content: string;
  file?: {
    name: string;
    type: string;
    data: string; // base64 encoded file data
  };
}
