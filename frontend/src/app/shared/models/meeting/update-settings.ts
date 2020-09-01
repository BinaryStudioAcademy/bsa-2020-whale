import { MeetingSettings } from './meeting-settings';

export interface UpdateSettings extends MeetingSettings {
  applicantEmail: string;
  meetingId: string;
}
