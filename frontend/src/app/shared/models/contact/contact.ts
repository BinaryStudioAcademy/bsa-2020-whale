import { User } from '../user/user';
import { DirectMessage } from '../message/message';

export interface Contact {
  Id: string;
  FirstMemberId: string;
  FirstMember?: User;
  SecondMemberId: string;
  SecondMember?: User;
  PinnedMessage: DirectMessage;
  Settings;
  ContactnerSettings;
}
