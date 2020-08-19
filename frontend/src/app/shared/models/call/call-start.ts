import { MeetingCreate } from '../meeting/meeting-create';

export interface CallStart {
  contactId: string;
  meeting: MeetingCreate;
}
