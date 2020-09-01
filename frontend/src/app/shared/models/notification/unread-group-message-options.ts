import { UnreadGroupMessage } from '../message/unread-group-message';

export interface UnreadGroupMessageOptions {
  unreadGroupMessages: UnreadGroupMessage[];
  groupId: string;
  groupName: string;
}
