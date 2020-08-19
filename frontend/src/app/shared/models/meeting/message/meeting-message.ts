import { User } from '../../user/user';

export interface MeetingMessage {
  id: string;
  author: User;
  receiver: User;
  meetingId: string;
  message: string;
  sentDate: Date;
}
