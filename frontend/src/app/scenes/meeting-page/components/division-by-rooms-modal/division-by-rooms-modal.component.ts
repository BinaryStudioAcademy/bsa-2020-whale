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
import { DndDropEvent } from 'ngx-drag-drop';

@Component({
  selector: 'app-division-by-rooms-modal',
  templateUrl: './division-by-rooms-modal.component.html',
  styleUrls: ['./division-by-rooms-modal.component.sass'],
})
export class DivisionByRoomsModalComponent
  extends SimpleModalComponent<RoomCreateModal, boolean>
  implements RoomCreateModal, OnInit, OnDestroy {
  private unsubscribe$ = new Subject<void>();

  public meetingLink: string;
  public meetingId: string;
  public numberOfRooms = 2;
  public duration = 10;
  public onCanMoveIntoRoomEvent: EventEmitter<void>;
  public selectedParticipant: Participant;

  constructor(private router: Router, public roomService: RoomService) {
    super();
  }

  ngOnInit(): void {
    this.roomService.randomlyDivide(this.numberOfRooms);
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  public divide(): void {
    this.roomService.createRooms(
      this.meetingId,
      this.meetingLink,
      this.duration
    );
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
        this.roomService.originalMeetingId = this.meetingId;
      }
      this.router.navigate([`/room/${roomId}`]);
    });
  }

  public numberOfRoomsChanged(): void {
    this.roomService.changeNumberofRooms(this.numberOfRooms);
  }

  public onDragEnd(event: DragEvent): void {
    this.selectedParticipant = null;
  }

  public onDrop(event: DndDropEvent, participants: Participant[]): void {
    let index = event.index;
    if (typeof index === 'undefined') {
      index = participants.length;
    }
    participants.splice(index, 0, event.data);
  }

  public onDragStart(event: DragEvent, participant: Participant): void {
    this.selectedParticipant = participant;
  }

  public onDragged(item: any, participants: Participant[]): void {
    const index = participants.indexOf(item);
    participants.splice(index, 1);
  }

  public checkIfSelectedParticipantIsInCurrentList(
    participants: Participant[]
  ): boolean {
    return Boolean(
      participants.find((p) => p.id === this.selectedParticipant?.id)
    );
  }
}
