import { Participant } from '../participant';

export interface RoomCreateModal {
  participants: Participant[];
  numberOfRooms: number;
  meetingId: string;
  meetingLink: string;
  rooms: string[];
}
