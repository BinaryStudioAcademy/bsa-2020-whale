import { Participant } from '../participant';
import { EventEmitter } from '@angular/core';

export interface RoomCreateModal {
  meetingId: string;
  meetingLink: string;
  onCanMoveIntoRoomEvent: EventEmitter<void>;
}
