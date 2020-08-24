import { Component, OnInit } from '@angular/core';
import { SimpleModalComponent } from 'ngx-simple-modal';
import { Participant, ParticipantRole, User, Meeting } from '@shared/models';
import { MeetingSignalrService, SignalMethods } from 'app/core/services';

export interface RoomsParticipants {
  participants: Participant[];
  numberOfRooms: number;
  meetingId: string;
}

@Component({
  selector: 'division-by-rooms-modal',
  templateUrl: './division-by-rooms-modal.component.html',
  styleUrls: ['./division-by-rooms-modal.component.sass'],
})
export class DivisionByRoomsModalComponent
  extends SimpleModalComponent<RoomsParticipants, void>
  implements RoomsParticipants {
  constructor(private meetingSignalrService: MeetingSignalrService) {
    super();
  }
  public meetingId: string;
  public numberOfRooms: number;
  public participants: Array<Participant>;
  public devidedParticipants: Array<Array<Participant>>;

  ngOnInit(): void {
    this.devidedParticipants = this.randChunkSplit(
      this.participants,
      Math.round(this.participants.length / this.numberOfRooms)
    );
  }

  public divide(): void {
    this.meetingSignalrService.invoke(SignalMethods.CreateRoom, this.meetingId);
    this.close();
  }

  private randChunkSplit(
    arr: Array<Participant>,
    min: number = 1,
    max: number = 1
  ): Array<Array<Participant>> {
    const arrCopy = arr.slice();
    let arrs: Array<Array<Participant>> = [];
    let size = 1;
    max = max >= min ? max : min;
    while (arrCopy.length > 0) {
      size = Math.min(max, Math.floor(Math.random() * max + min));
      arrs.push(arrCopy.splice(0, size));
    }
    return arrs;
  }
}
