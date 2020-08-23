import { MeetingLink } from '../meeting/meeting-link';
import { Group } from '../group/group';

export interface GroupCall {
  meetingLink: MeetingLink;
  group: Group;
  callerEmail: string;
}
