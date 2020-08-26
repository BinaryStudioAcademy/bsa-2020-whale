import { Injectable, EventEmitter } from '@angular/core';
import { MeetingSignalrService, SignalMethods } from '.';
import { ToastrService } from 'ngx-toastr';
import { Participant } from '@shared/models';

@Injectable({
  providedIn: 'root',
})
export class RoomService {
  public roomsIds: string[] = [];
  public participantsInRooms = new Map<string, Array<Participant>>();
  public isUserHost = false;
  public participants: Array<Participant> = [];

  constructor(
    private meetingSignalrService: MeetingSignalrService,
    private toastr: ToastrService
  ) {
    this.meetingSignalrService.onRoomCreatedToHost$.subscribe(
      (roomData) => {
        this.roomsIds.push(roomData.roomId);
        const participants: string[] = roomData.participantsIds;
        console.log('participants', participants);
        this.participantsInRooms.set(
          roomData.roomId,
          this.participants.filter((p) => participants.some((pp) => p.id == pp))
        );
      },
      (err) => {
        this.toastr.error('Error occured while trying to create room');
      }
    );
  }

  public getRoomsOfMeeting(meetingId: string): void {
    this.meetingSignalrService.signalHub
      .invoke(SignalMethods[SignalMethods.GetCreatedRooms], meetingId)
      .then((roomsIds) => (this.roomsIds = roomsIds))
      .catch((err) => this.toastr.error(err));
  }
}
