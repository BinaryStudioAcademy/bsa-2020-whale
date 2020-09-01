import { UnreadMessageId } from '../message/unread-message-id';

export interface UnreadMessageOptions {
  unreadMessageIds: UnreadMessageId[];
  contactId: string;
  senderName: string;
}
