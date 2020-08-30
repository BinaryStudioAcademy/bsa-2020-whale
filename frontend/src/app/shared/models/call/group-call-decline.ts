import { User } from '../user/user';

export interface GroupCallDecline {
  userId: string;
  callCreator: User;
  groupId: string;
  meetingId: string;
}
