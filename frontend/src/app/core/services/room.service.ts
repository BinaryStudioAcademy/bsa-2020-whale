import { Injectable, EventEmitter } from '@angular/core';
import { MeetingSignalrService, SignalMethods } from '.';
import { ToastrService } from 'ngx-toastr';
import { Participant, RoomDTO } from '@shared/models';

@Injectable({
  providedIn: 'root',
})
export class RoomService {
  public roomsIds: string[] = [];
  public participantsInRooms = new Map<string, Array<Participant>>();
  public isUserHost = false;
  public participants: Array<Participant> = [];
  public isDividedIntoRooms: boolean = false;

  constructor(
    private meetingSignalrService: MeetingSignalrService,
    private toastr: ToastrService
  ) {
    this.meetingSignalrService.onRoomCreatedToHost$.subscribe(
      (roomData) => {
        this.roomsIds.push(roomData.roomId);
        const participants: string[] = roomData.participantsIds;
        this.configureParticipantsInRooms(roomData.roomId, participants);
        this.isDividedIntoRooms = true;
      },
      (err) => {
        this.toastr.error('Error occured while trying to create room');
      }
    );

    this.meetingSignalrService.onRoomClosed$.subscribe(
      (mmetingLink) => (this.isDividedIntoRooms = false)
    );
  }

  private configureParticipantsInRooms(
    roomId: string,
    participantsIds: Array<string>
  ): void {
    if (!this.isDividedIntoRooms) {
      this.participantsInRooms.set(
        roomId,
        this.participants.filter((p) =>
          participantsIds.some((pp) => p.id == pp)
        )
      );
    }
  }

  public getRoomsOfMeeting(meetingId: string): void {
    this.meetingSignalrService.signalHub
      .invoke(SignalMethods[SignalMethods.GetCreatedRooms], meetingId)
      .then((rooms: RoomDTO[]) => {
        rooms.forEach((room) => {
          this.configureParticipantsInRooms(room.roomId, room.participantsIds);
        });
        console.log('rooms', rooms);
        console.log('participantsInRooms', this.participantsInRooms);
        console.log('participants', this.participants);
        if (this.roomsIds.length > 0) this.isDividedIntoRooms = true;
      })
      .catch((err) => this.toastr.error(err));
  }
}
