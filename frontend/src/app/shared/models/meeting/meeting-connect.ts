import { Participant } from '../participant/participant';

export interface MeetingConnectionData {
  userEmail: string;
  peerId: string;
  streamId: string;
  meetingId: string;
  meetingPwd: string;
  participant: Participant;
  isRoom: boolean;
}
