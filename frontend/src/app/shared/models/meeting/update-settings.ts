import { MeetingSettings } from './MeetingSettings';

export interface UpdateSettings extends MeetingSettings {
  meetingId: string;
}
