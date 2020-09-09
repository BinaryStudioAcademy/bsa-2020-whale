import { Injectable, EventEmitter } from '@angular/core';
import { MeetingSignalrService, SignalMethods } from './meeting-signalr.service';
import { ToastrService } from 'ngx-toastr';
import {
  Participant,
  RoomDTO,
  ParticipantRole,
  RoomCreate,
  Meeting,
  RoomClose,
} from '@shared/models';

@Injectable({
  providedIn: 'root',
})
export class RoomService {
  public roomsIds: string[] = [];
  public rooms = new Map<string, RoomDTO>();
  public previoslyDividedRooms: Array<RoomDTO> = [];
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
      (room) => {
        this.roomsIds.push(room.roomId);
        this.rooms.set(room.roomId, room);
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
        this.rooms = new Map();
        rooms.forEach((room) => {
          this.rooms.set(room.roomId, room);
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
    const keys = Array.from(this.rooms.keys());
    for (const key of keys) {
      const room = this.rooms.get(key);
      room.participants = room.participants.filter((p) => p.id !== participantId);
      this.rooms.set(key, room);
    }
    this.previoslyDividedRooms = this.previoslyDividedRooms.map(
      (room) => {
        room.participants = room.participants.filter((p) => p.id !== participantId);
        return room;
      }
    );
  }

  public addParticipant(participant: Participant): void {
    this.participants.push(participant);
    this.previoslyDividedRooms[0]?.participants.push(participant);
  }

  public updateParticipant(participant: Participant): void {
    const index = this.participants.findIndex((p) => p.id === participant.id);
    if (index >= 0) {
      this.participants[index] = participant;
      this.previoslyDividedRooms = this.previoslyDividedRooms.map(
        (room) => {
          const participantIndex = room.participants.findIndex(
            (p) => p.id === participant.id
          );
          if (participantIndex >= 0) {
            room.participants[participantIndex] = participant;
          }
          return room;
        }
      );
    }
  }

  public randomlyDivide(numberOfRooms: number): void {
    this.previoslyDividedRooms = [];
    const participants = this.participants.filter(
      (p) => p.role !== ParticipantRole.Host
    );

    const previouslyDividedParticipants = this.randChunkSplit(
      participants,
      Math.ceil(participants.length / numberOfRooms)
    );

    previouslyDividedParticipants.forEach((roomParticipants) => {
      this.addRoom(roomParticipants);
    });

    if (this.previoslyDividedRooms.length < numberOfRooms) {
      this.addEmptyRooms(
        numberOfRooms - this.previoslyDividedRooms.length
      );
    }
  }

  public createRooms(
    meetingId: string,
    meetingLink: string,
    duration: number
  ): void {
    this.rooms = new Map();
    this.previoslyDividedRooms.forEach((room) => {
      this.meetingSignalrService.invoke(SignalMethods.CreateRoom, {
        meetingId,
        meetingLink,
        roomName: room.name,
        duration,
        participantsIds: room.participants.map((p) => p.id),
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
    this.previoslyDividedRooms.forEach((room) => {
      this.meetingSignalrService.invoke(SignalMethods.CreateRoom, {
        meetingId,
        meetingLink,
        roomName: room.name,
        duration,
        participantsIds: this.participants.filter(p => p.role !== ParticipantRole.Host).map(p => p.id),
      } as RoomCreate);
    });
    this.isDividedIntoRooms = true;
  }

  public changeNumberofRooms(numberOfRooms: number): void {
    const participants = this.participants.filter(
      (p) => p.role !== ParticipantRole.Host
    );

    const previouslyDividedParticipants = this.randChunkSplit(
      participants,
      Math.ceil(participants.length / numberOfRooms)
    );

    if (this.previoslyDividedRooms.length > numberOfRooms) {
      for (let i = 0; i < previouslyDividedParticipants.length; i++){
        this.previoslyDividedRooms[i].participants = previouslyDividedParticipants[i];
      }

      const emptyRooms = this.previoslyDividedRooms.length - numberOfRooms;
      this.previoslyDividedRooms.splice(numberOfRooms, emptyRooms);

      return;
    }

    if (previouslyDividedParticipants.length > this.previoslyDividedRooms.length){
      for (let i = 0; i < previouslyDividedParticipants.length; i++){
        if (i < this.previoslyDividedRooms.length) {
          this.previoslyDividedRooms[i].participants = previouslyDividedParticipants[i];
        } else {
          this.addRoom(previouslyDividedParticipants[i]);
        }
      }
    } else {
      for (let i = 0; i < this.previoslyDividedRooms.length; i++){
        if (i < previouslyDividedParticipants.length){
          this.previoslyDividedRooms[i].participants = previouslyDividedParticipants[i];
        } else {
          this.previoslyDividedRooms[i].participants = [];
        }
      }
    }

    if (this.previoslyDividedRooms.length < numberOfRooms) {
      this.addEmptyRooms(
        numberOfRooms - this.previoslyDividedRooms.length
      );
    }
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
      this.addRoom([]);
    }
  }

  private addRoom(participants: Array<Participant>): void {
    this.previoslyDividedRooms.push({
      roomId: '',
      name: 'Room ' + (this.previoslyDividedRooms.length + 1),
      participants
    } as RoomDTO);
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

  public closeRoomsPrematurely() {
    const roomClose: RoomClose = {
      roomIds: this.roomsIds,
      meetingId: this.originalMeetingId,
      meetingLink: this.originalMeetingUrl
    };

    this.meetingSignalrService.invoke(SignalMethods.OnCloseRoomsPrematurely, roomClose);
  }
}
