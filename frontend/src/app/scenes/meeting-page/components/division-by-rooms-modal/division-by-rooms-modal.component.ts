import { Component, OnInit } from '@angular/core';
import { SimpleModalComponent } from 'ngx-simple-modal';
import { Participant, ParticipantRole, User, Meeting } from '@shared/models';

export interface RoomsParticipants {
  participants: Participant[];
  numberOfRooms: number;
}

@Component({
  selector: 'division-by-rooms-modal',
  templateUrl: './division-by-rooms-modal.component.html',
  styleUrls: ['./division-by-rooms-modal.component.sass'],
})
export class DivisionByRoomsModalComponent
  extends SimpleModalComponent<RoomsParticipants, void>
  implements RoomsParticipants {
  constructor() {
    super();
  }
  public numberOfRooms: number;
  public participants: Array<Participant>;
  public devidedParticipants: Array<Array<Participant>>;

  ngOnInit(): void {
    this.devidedParticipants = this.randChunkSplit(
      this.participants,
      Math.round(this.participants.length / this.numberOfRooms)
    );
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
