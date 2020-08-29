import { MeetingLink } from '../meeting/meeting-link';
import { Group } from '../group/group';
import { User } from '../user/user';

export interface GroupCall {
  meetingLink: MeetingLink;
  group: Group;
  caller: User;
}
