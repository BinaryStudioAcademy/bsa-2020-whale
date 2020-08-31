import { MeetingSettings } from './meeting-settings';

export interface UpdateSettings extends MeetingSettings {
  meetingId: string;
}
