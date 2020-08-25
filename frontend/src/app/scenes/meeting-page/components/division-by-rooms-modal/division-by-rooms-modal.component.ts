import { Component, OnInit, OnDestroy } from '@angular/core';
import { SimpleModalComponent } from 'ngx-simple-modal';
import {
  Participant,
  ParticipantRole,
  RoomCreate,
  RoomCreateModal,
} from '@shared/models';
import { MeetingSignalrService, SignalMethods } from 'app/core/services';
import { Subject } from 'rxjs';

@Component({
  selector: 'division-by-rooms-modal',
  templateUrl: './division-by-rooms-modal.component.html',
  styleUrls: ['./division-by-rooms-modal.component.sass'],
})
export class DivisionByRoomsModalComponent
  extends SimpleModalComponent<RoomCreateModal, void>
  implements RoomCreateModal, OnInit, OnDestroy {
  private unsubscribe$ = new Subject<void>();

  public meetingLink: string;
  public meetingId: string;
  public numberOfRooms: number;
  public participants: Array<Participant>;
  public devidedParticipants: Array<Array<Participant>>;
  public rooms: string[] = [];
  public duration: number = 10;

  constructor(private meetingSignalrService: MeetingSignalrService) {
    super();
  }

  ngOnInit(): void {
    this.participants = this.participants.filter(
      (p) => p.role != ParticipantRole.Host
    );
    this.devidedParticipants = this.randChunkSplit(
      this.participants,
      Math.round(this.participants.length / this.numberOfRooms)
    );
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  public divide(): void {
    this.devidedParticipants.forEach((participants) => {
      this.meetingSignalrService.invoke(SignalMethods.CreateRoom, {
        meetingId: this.meetingId,
        meetingLink: this.meetingLink,
        duration: this.duration,
        participantsIds: participants.map((p) => p.id),
      } as RoomCreate);
    });
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
