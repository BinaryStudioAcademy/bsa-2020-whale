import { User } from '../user/user';
import { DirectMessage } from '../message/direct-message';

export interface Contact {
  id: string;
  firstMemberId: string;
  firstMember?: User;
  secondMemberId: string;
  secondMember?: User;
  pinnedMessage: DirectMessage;
  settings;
  contactnerSettings;
}
