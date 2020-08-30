import { UnreadMessageId } from '../message/unread-message-id';

export interface UnreadMessageOptions {
  unreadMessageId: UnreadMessageId;
  contactId: string;
  senderName: string;
}
