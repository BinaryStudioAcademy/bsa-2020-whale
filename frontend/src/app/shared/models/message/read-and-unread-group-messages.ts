import { GroupMessage } from './group-message';

export interface ReadAndUnreadGroupMessages {
  readMessages: GroupMessage[];
  unreadMessages: GroupMessage[];
}
