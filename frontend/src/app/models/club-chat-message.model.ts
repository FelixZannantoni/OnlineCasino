export interface ClubChatMessage {
  id: number;
  clubId: number;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: string;
}