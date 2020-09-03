import { Participant } from '../participant';

export interface RoomDTO {
  roomId: string;
  name: string;
  participants: Array<Participant>;
}
