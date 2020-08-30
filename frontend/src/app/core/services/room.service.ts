import { Injectable, EventEmitter } from '@angular/core';
import { MeetingSignalrService, SignalMethods } from '.';
import { ToastrService } from 'ngx-toastr';
import {
  Participant,
  RoomDTO,
  ParticipantRole,
  RoomCreate,
} from '@shared/models';

@Injectable({
  providedIn: 'root',
})
export class RoomService {
  public roomsIds: string[] = [];
  public participantsInRooms = new Map<string, Array<Participant>>();
  public previouslyDividedParticipants: Array<Array<Participant>> = [];
  public isUserHost = false;
  public participants: Array<Participant> = [];
  public isDividedIntoRooms = false;
  public originalMeetingUrl: string;
  public originalMeetingId: string;
  public isInRoom = false;

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
      this.participants.filter((p) => participantsIds.some((pp) => p.id === pp))
    );
  }

  public getRoomsOfMeeting(meetingId: string): void {
    this.meetingSignalrService.signalHub
      .invoke(
        SignalMethods[SignalMethods.GetCreatedRooms],
        this.isInRoom ? this.originalMeetingId : meetingId
      )
      .then((rooms: RoomDTO[]) => {
        this.participantsInRooms = new Map();
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

  public deleteParticipant(participantId: string): void {
    this.participants = this.participants.filter((p) => p.id != participantId);
    const keys = Array.from(this.participantsInRooms.keys());
    for (const key of keys) {
      const participants = this.participantsInRooms
        .get(key)
        .filter((p) => p.id != participantId);
      this.participantsInRooms.set(key, participants);
    }
  }

  public randomlyDivide(numberOfRooms: number): void {
    const participants = this.participants.filter(
      (p) => p.role != ParticipantRole.Host
    );

    this.previouslyDividedParticipants = this.randChunkSplit(
      participants,
      Math.round(this.participants.length / numberOfRooms)
    );
  }

  public createRooms(
    meetingId: string,
    meetingLink: string,
    duration: number
  ): void {
    this.participantsInRooms = new Map();
    this.previouslyDividedParticipants.forEach((participants) => {
      this.meetingSignalrService.invoke(SignalMethods.CreateRoom, {
        meetingId: meetingId,
        meetingLink: meetingLink,
        duration: duration,
        participantsIds: participants.map((p) => p.id),
      } as RoomCreate);
    });
    this.isDividedIntoRooms = true;
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
