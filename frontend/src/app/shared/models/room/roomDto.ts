import { Participant } from '../participant';

export interface RoomDTO {
  roomId: string;
  participants: Array<Participant>;
}
