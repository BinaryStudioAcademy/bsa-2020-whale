import { ParticipantRole } from './participant-role';
import { User } from '../user/user';
import { Meeting } from '../meeting/meeting';

export interface Participant {
  id: string;
  role: ParticipantRole;
  user: User;
  streamId: string;
  activeConnectionId: string;
  meeting: Meeting;
}
