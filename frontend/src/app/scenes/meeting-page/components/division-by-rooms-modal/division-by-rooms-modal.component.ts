import { Component, OnInit, OnDestroy, EventEmitter, ViewChild, AfterViewInit, ElementRef } from '@angular/core';
import { SimpleModalComponent } from 'ngx-simple-modal';
import { Participant, RoomCreateModal, Meeting, ModalActions } from '@shared/models';
import { RoomService, MeetingSettingsService, MeetingSignalrService } from 'app/core/services';
import { Subject } from 'rxjs';
import { Router } from '@angular/router';
import { DndDropEvent } from 'ngx-drag-drop';
import { ToastrService } from 'ngx-toastr';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-division-by-rooms-modal',
  templateUrl: './division-by-rooms-modal.component.html',
  styleUrls: ['./division-by-rooms-modal.component.sass'],
})
export class DivisionByRoomsModalComponent
  extends SimpleModalComponent<RoomCreateModal, ModalActions>
  implements RoomCreateModal, OnInit, OnDestroy, AfterViewInit {
  private unsubscribe$ = new Subject<void>();

  @ViewChild('allowToChooseRoom') private checkboxPAllowToChooseRoom: ElementRef;

  public meetingLink: string;
  public meetingId: string;
  public numberOfRooms = 2;
  public duration = 10;
  public onCanLeaveEvent: EventEmitter<void>;
  public selectedParticipant: Participant;
  public meeting: Meeting;

  constructor(
    private router: Router,
    public roomService: RoomService,
    private meetingSettingsService: MeetingSettingsService,
    private toastr: ToastrService,
    private meetingSignalrService: MeetingSignalrService
    ) {
    super();
  }

  ngOnInit(): void {
    this.result = ModalActions.Close;
    this.roomService.randomlyDivide(this.numberOfRooms);

    this.meetingSignalrService.onParticipantConnectRoom$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((connectionData) => {
        this.roomService.getRoomsOfMeeting(this.meetingId);
      });
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  ngAfterViewInit(): void {
    if (this.checkboxPAllowToChooseRoom){
      this.checkboxPAllowToChooseRoom.nativeElement.checked = this.meeting.isAllowedToChooseRoom;
    }
  }

  public divide(): void {
    if (this.meeting.isAllowedToChooseRoom) {
      this.roomService.createEmptyRooms(
        this.meetingId,
        this.meetingLink,
        this.duration,
        this.numberOfRooms
      );
      return;
    }
    this.roomService.createRooms(
      this.meetingId,
      this.meetingLink,
      this.duration
    );
  }

  public leaveRoom(): void {
    this.result = ModalActions.MoveToMeeting;
    this.close();
    this.onCanLeaveEvent.subscribe(() => {
    this.router.navigate([
      `/meeting-page/${this.roomService.originalMeetingUrl}`,
    ]);
  });
  }

  public redirectIntoRoom(roomId: string): void {
    this.result = ModalActions.MoveToRoom;
    this.close();
    this.onCanLeaveEvent.subscribe(() => {
      this.router.navigate([`/room/${roomId}`]);
    });
  }

  public numberOfRoomsChanged(): void {
    this.numberOfRooms = Math.ceil(this.numberOfRooms);
    if (this.numberOfRooms <= 0) {
      this.numberOfRooms = 1;
      this.toastr.warning('You cannot create less than one room');
    }
    this.roomService.changeNumberofRooms(this.numberOfRooms);
  }

  public durationChanged(): void {
    if (this.duration < 1) {
      this.duration =  1;
      this.toastr.warning('Duration of the room can not be less than one');
    }
  }

  public changeRoomPermission(event: any): void {
    this.meeting.isAllowedToChooseRoom = event.target.checked;

    this.meetingSettingsService.switchMeetingSettingAsHost(this.meeting);
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

  public joinRandomRoom(): void {
    this.result = ModalActions.MoveToRoom;
    this.close();
    const allRoomsIds = Array.from(this.roomService.rooms.keys());
    const roomId = allRoomsIds[Math.floor(Math.random() * allRoomsIds.length)];
    this.onCanLeaveEvent.subscribe(() => {
      if (!this.roomService.originalMeetingUrl) {
        this.roomService.originalMeetingUrl = this.meetingLink;
        this.roomService.originalMeetingId = this.meetingId;
      }
      this.router.navigate([`/room/${roomId}`]);
    });
  }
}
