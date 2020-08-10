import { User } from '../../user/user';

export interface MeetingMessage {
  id: string;
  authorId: string;
  author: User;
  meetingId: string;
  message: string;
  sentDate: Date;
}
