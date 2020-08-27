import { DirectMessage } from './direct-message';

export interface ReadAndUnreadMessages {
  readMessages: DirectMessage[];
  unreadMessages: DirectMessage[];
}
