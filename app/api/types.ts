import { MessageContent, MessageType } from "@langchain/core/messages";

export interface Message {
  type: MessageType;
  content: MessageContent;
}
