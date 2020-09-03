import { User } from '../user/user';

export interface MeetingScript {
  user: User;
  message: string;
  speechDate: Date;
}
