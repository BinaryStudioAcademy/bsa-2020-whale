import { EventEmitter } from '@angular/core';
import { Meeting } from '../meeting';

export interface RoomCreateModal {
  meeting: Meeting;
  meetingId: string;
  meetingLink: string;
  onCanLeaveEvent: EventEmitter<void>;
}
