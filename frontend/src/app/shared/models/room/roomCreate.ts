export interface RoomCreate {
  meetingId: string;
  meetingLink: string;
  roomName: string;
  duration: number;
  participantsIds: string[];
}
