import { Injectable, EventEmitter } from '@angular/core';
import { MeetingSignalrService, SignalMethods } from './meeting-signalr.service';
import { ToastrService } from 'ngx-toastr';
import {
  Participant,
  RoomDTO,
  ParticipantRole,
  RoomCreate,
  Meeting,
} from '@shared/models';

@Injectable({
  providedIn: 'root',
})
export class RoomService {
  public roomsIds: string[] = [];
  public participantsInRooms = new Map<string, Array<Participant>>();
  public previouslyDividedParticipants: Array<Array<Participant>> = [[]];
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
      (roomId) => {
        this.roomsIds.push(roomId);
        this.participantsInRooms.set(roomId, []);
      },
      (err) => {
        this.toastr.error('Error occured while trying to create room');
      }
    );

    this.meetingSignalrService.onRoomClosed$.subscribe(
      (meetingLink) => (this.isDividedIntoRooms = false)
    );
  }

  public getRoomsOfMeeting(meetingId: string, callback: () => void = () => { }): void {
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
          callback();
        } else {
          this.isDividedIntoRooms = false;
        }
      });
  }

  public deleteParticipant(participantId: string): void {
    this.participants = this.participants.filter((p) => p.id !== participantId);
    const keys = Array.from(this.participantsInRooms.keys());
    for (const key of keys) {
      const participants = this.participantsInRooms
        .get(key)
        .filter((p) => p.id !== participantId);
      this.participantsInRooms.set(key, participants);
    }
    this.previouslyDividedParticipants = this.previouslyDividedParticipants.map(
      (participants) => participants.filter((p) => p.id !== participantId)
    );
  }

  public addParticipant(participant: Participant): void {
    this.participants.push(participant);
    this.previouslyDividedParticipants[0].push(participant);
  }

  public updateParticipant(participant: Participant): void {
    const index = this.participants.findIndex((p) => p.id === participant.id);
    if (index >= 0) {
      this.participants[index] = participant;
      this.previouslyDividedParticipants = this.previouslyDividedParticipants.map(
        (participants) => {
          const participantIndex = participants.findIndex(
            (p) => p.id === participant.id
          );
          if (participantIndex >= 0) {
            participants[participantIndex] = participant;
          }
          return participants;
        }
      );
    }
  }

  public randomlyDivide(numberOfRooms: number): void {
    this.previouslyDividedParticipants = [];
    const participants = this.participants.filter(
      (p) => p.role !== ParticipantRole.Host
    );

    this.previouslyDividedParticipants = this.randChunkSplit(
      participants,
      Math.round(participants.length / numberOfRooms)
    );

    if (this.previouslyDividedParticipants.length < numberOfRooms) {
      this.addEmptyRooms(
        numberOfRooms - this.previouslyDividedParticipants.length
      );
    }
  }

  public createRooms(
    meetingId: string,
    meetingLink: string,
    duration: number
  ): void {
    this.participantsInRooms = new Map();
    this.previouslyDividedParticipants.forEach((participants) => {
      this.meetingSignalrService.invoke(SignalMethods.CreateRoom, {
        meetingId,
        meetingLink,
        duration,
        participantsIds: participants.map((p) => p.id),
      } as RoomCreate);
    });
    this.isDividedIntoRooms = true;
  }

  public createEmptyRooms(
    meetingId: string,
    meetingLink: string,
    duration: number,
    numberOfRooms: number
  ) {
    for (let i = 0; i < numberOfRooms; i++) {
      this.meetingSignalrService.invoke(SignalMethods.CreateRoom, {
        meetingId,
        meetingLink,
        duration,
        participantsIds: this.participants.filter(p => p.role !== ParticipantRole.Host).map(p => p.id),
      });
    }
    this.isDividedIntoRooms = true;
  }

  public changeNumberofRooms(numberOfRooms: number): void {
    if (this.previouslyDividedParticipants.length > numberOfRooms) {
      this.randomlyDivide(numberOfRooms);
      return;
    }

    this.addEmptyRooms(
      numberOfRooms - this.previouslyDividedParticipants.length
    );
  }

  public async getMeetingEntityForRoom(roomId: string): Promise<Meeting> {
    const meetingEntity = await this.meetingSignalrService.signalHub.invoke(
      SignalMethods[SignalMethods.GetMeetingEntityForRoom], roomId
    );
    if (meetingEntity) {
      return meetingEntity;
    }
    this.toastr.error('Cannot connect to room');
  }

  private addEmptyRooms(numberOfRooms: number): void {
    for (let i = 0; i < numberOfRooms; i++) {
      this.previouslyDividedParticipants.push([]);
    }
  }

  private randChunkSplit(
    arr: Array<Participant>,
    min: number = 1,
    max: number = 1
  ): Array<Array<Participant>> {
    const arrCopy = arr.slice();
    const arrs: Array<Array<Participant>> = [];
    let size = 1;
    max = max >= min ? max : min;
    while (arrCopy.length > 0) {
      size = Math.min(max, Math.floor(Math.random() * max + min));
      arrs.push(arrCopy.splice(0, size));
    }
    return arrs;
  }
}
