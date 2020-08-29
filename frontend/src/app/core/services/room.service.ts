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
  public originalMeetingUrl: string;
  public originalMeetingId: string;
  public isInRoom: boolean = false;

  constructor(
    private meetingSignalrService: MeetingSignalrService,
    private toastr: ToastrService
  ) {
    this.meetingSignalrService.onRoomCreatedToHost$.subscribe(
      (roomData) => {
        this.roomsIds.push(roomData.roomId);
        const participants: string[] = roomData.participantsIds;
        this.configureParticipantsInRooms(roomData.roomId, participants);
      },
      (err) => {
        this.toastr.error('Error occured while trying to create room');
      }
    );

    this.meetingSignalrService.onRoomClosed$.subscribe(
      (meetingLink) => (this.isDividedIntoRooms = false)
    );
  }

  private configureParticipantsInRooms(
    roomId: string,
    participantsIds: Array<string>
  ): void {
    this.participantsInRooms.set(
      roomId,
      this.participants.filter((p) => participantsIds.some((pp) => p.id == pp))
    );
  }

  public getRoomsOfMeeting(meetingId: string): void {
    this.meetingSignalrService.signalHub
      .invoke(
        SignalMethods[SignalMethods.GetCreatedRooms],
        this.isInRoom ? this.originalMeetingId : meetingId
      )
      .then((rooms: RoomDTO[]) => {
        console.log(rooms);
        rooms.forEach((room) => {
          this.participantsInRooms.set(room.roomId, room.participants);
        });
        if (rooms.length > 0) {
          this.isDividedIntoRooms = true;
        } else {
          this.isDividedIntoRooms = false;
        }
      })
      .catch((err) => console.error(err));
  }

  public deleteParticipant(participantEmail: string): void {
    this.participants = this.participants.filter(
      (p) => p?.user?.email != participantEmail
    );
    const keys = Array.from(this.participantsInRooms.keys());
    for (const key of keys) {
      const participants = this.participantsInRooms
        .get(key)
        .filter((p) => p.user.email != participantEmail);
      this.participantsInRooms.set(key, participants);
    }
  }
}
