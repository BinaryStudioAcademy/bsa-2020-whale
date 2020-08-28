import { Participant } from '../participant';

export interface MeetingInviteModalData {
  meetingId: string;
  senderId: string;
  inviteLink: string;
  participants: Participant[];
}
