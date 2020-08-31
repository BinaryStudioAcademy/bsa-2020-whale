export interface MeetingCreate {
  settings: string;
  startTime: Date;
  anonymousCount: number;
  isScheduled: boolean;
  isRecurrent: boolean;
  creatorEmail: string;
  participantsEmails: string[];
}
