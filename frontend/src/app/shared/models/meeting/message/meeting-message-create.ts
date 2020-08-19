export interface MeetingMessageCreate {
  authorEmail: string;
  receiverEmail: string;
  meetingId: string;
  message: string;
}
