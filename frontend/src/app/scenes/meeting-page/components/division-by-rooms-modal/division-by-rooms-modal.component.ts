import { Component, OnInit, OnDestroy, EventEmitter } from '@angular/core';
import { SimpleModalComponent } from 'ngx-simple-modal';
import {
  Participant,
  ParticipantRole,
  RoomCreate,
  RoomCreateModal,
} from '@shared/models';
import {
  MeetingSignalrService,
  SignalMethods,
  RoomService,
} from 'app/core/services';
import { Subject } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'division-by-rooms-modal',
  templateUrl: './division-by-rooms-modal.component.html',
  styleUrls: ['./division-by-rooms-modal.component.sass'],
})
export class DivisionByRoomsModalComponent
  extends SimpleModalComponent<RoomCreateModal, boolean>
  implements RoomCreateModal, OnInit, OnDestroy {
  private unsubscribe$ = new Subject<void>();

  public meetingLink: string;
  public meetingId: string;
  public numberOfRooms: number = 2;
  public participants: Array<Participant>;
  public devidedParticipants: Array<Array<Participant>>;
  public duration: number = 10;
  public onCanMoveIntoRoomEvent: EventEmitter<void>;

  constructor(
    private meetingSignalrService: MeetingSignalrService,
    private router: Router,
    public roomService: RoomService
  ) {
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
    this.roomService.isDividedIntoRooms = true;
  }

  public leaveRoom(): void {
    this.result = false;
    this.close();
    this.router.navigate([
      `/meeting-page/${this.roomService.originalMeetingUrl}`,
    ]);
  }

  public redirectIntoRoom(roomId: string): void {
    this.result = true;
    this.close();
    this.onCanMoveIntoRoomEvent.subscribe(() => {
      if (!this.roomService.originalMeetingUrl) {
        this.roomService.originalMeetingUrl = this.meetingLink;
      }
      this.router.navigate([`/room/${roomId}`]);
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
