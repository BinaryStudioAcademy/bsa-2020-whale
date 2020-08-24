import { MeetingCreate } from '../meeting/meeting-create';

export interface GroupCallStart {
  groupId: string;
  meeting: MeetingCreate;
}
