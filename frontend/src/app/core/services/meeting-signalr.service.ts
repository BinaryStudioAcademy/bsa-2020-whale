import { Injectable } from '@angular/core';
import { SignalRService } from '../services/signal-r.service';
import { HubConnection } from '@aspnet/signalr';
import { environment } from '../../../environments/environment';
import { Subject, from, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { MeetingConnectionData } from '@shared/models/meeting/meeting-connect';
import { MeetingMessage } from '@shared/models/meeting/message/meeting-message';
import { Participant } from '@shared/models/participant/participant';
import { PollDto } from '@shared/models/poll/poll-dto';
import { PollResultDto } from '@shared/models/poll/poll-result-dto';
import { MediaState } from '@shared/models/media/media-state';
import { VoteDto } from '@shared/models/poll/vote-dto';
import { VoterDto } from '@shared/models/poll/voter-dto';
import { CanvasWhiteboardUpdate } from 'ng2-canvas-whiteboard';

@Injectable({
  providedIn: 'root',
})
export class MeetingSignalrService {
  public signalHub: HubConnection;
  public connectionId: string;

  private signalUserConected = new Subject<MeetingConnectionData>();
  public signalUserConected$ = this.signalUserConected.asObservable();

  private signalParticipantLeft = new Subject<MeetingConnectionData>();
  public signalParticipantLeft$ = this.signalParticipantLeft.asObservable();

  private signalParticipantDisconnected = new Subject<Participant>();
  public signalParticipantDisconnected$ = this.signalParticipantDisconnected.asObservable();

  private participantConected = new Subject<Participant[]>();
  public participantConected$ = this.participantConected.asObservable();

  private participantMediaStateChanged = new Subject<MediaState>();
  public participantMediaStateChanged$ = this.participantMediaStateChanged.asObservable();

  private mediaStateRequested = new Subject<string>();
  public mediaStateRequested$ = this.mediaStateRequested.asObservable();

  private meetingEnded = new Subject<MeetingConnectionData>();
  public meetingEnded$ = this.meetingEnded.asObservable();

  private conferenceStartRecording = new Subject<string>();
  public conferenceStartRecording$ = this.conferenceStartRecording.asObservable();

  private conferenceStopRecording = new Subject<string>();
  public conferenceStopRecording$ = this.conferenceStopRecording.asObservable();

  private sendMessage = new Subject<MeetingMessage>();
  public sendMessage$ = this.sendMessage.asObservable();

  private getMessages = new Subject<MeetingMessage[]>();
  public getMessages$ = this.getMessages.asObservable();

  private pollReceived = new Subject<PollDto>();
  public pollReceived$ = this.pollReceived.asObservable();

  private pollResultReceived = new Subject<PollResultDto>();
  public pollResultReceived$ = this.pollResultReceived.asObservable();

  private pollDeleted = new Subject<string>();
  public pollDeleted$ = this.pollDeleted.asObservable();

  private canvasDraw = new Subject<CanvasWhiteboardUpdate[]>();
  public readonly canvasDraw$ = this.canvasDraw.asObservable();

  private canvasErase = new Subject<boolean>();
  public readonly canvasErase$ = this.canvasErase.asObservable();

  constructor(private hubService: SignalRService) {
    from(hubService.registerHub(environment.signalrUrl, 'meeting'))
      .pipe(
        tap((hub) => {
          this.signalHub = hub;
        })
      )
      .subscribe(() => {
        this.signalHub.on('OnConferenceStartRecording', (message: string) => {
          this.conferenceStartRecording.next(message);
        });

        this.signalHub.on('OnConferenceStopRecording', (message: string) => {
          this.conferenceStopRecording.next(message);
        });

        this.signalHub.on(
          'OnUserConnect',
          (connectionData: MeetingConnectionData) => {
            this.signalUserConected.next(connectionData);
          }
        );

        this.signalHub.on(
          'OnParticipantConnect',
          (participants: Participant[]) => {
            this.participantConected.next(participants);
          }
        );

        this.signalHub.on(
          'OnParticipantLeft',
          (connectionData: MeetingConnectionData) => {
            this.signalParticipantLeft.next(connectionData);
          }
        );

        this.signalHub.on(
          'OnParticipantDisconnected',
          (disconnectedParticipant: Participant) => {
            this.signalParticipantDisconnected.next(disconnectedParticipant);
          }
        );

        this.signalHub.on(
          'OnMeetingEnded',
          (connectionData: MeetingConnectionData) => {
            this.meetingEnded.next(connectionData);
          }
        );

        this.signalHub.on('OnMediaStateChanged', (mediaState: MediaState) => {
          this.participantMediaStateChanged.next(mediaState);
        });

        this.signalHub.on(
          'OnMediaStateRequested',
          (senderConnectionId: string) => {
            this.mediaStateRequested.next(senderConnectionId);
          }
        );

        this.signalHub.on('OnSendMessage', (message: MeetingMessage) => {
          this.sendMessage.next(message);
        });

        this.signalHub.on('OnGetMessages', (messages: MeetingMessage[]) => {
          this.getMessages.next(messages);
        });

        this.signalHub.on('OnPoll', (poll: PollDto) => {
          this.pollReceived.next(poll);
        });

        this.signalHub.on('OnPollResults', (pollResultDto: PollResultDto) => {
          this.pollResultReceived.next(pollResultDto);
        });

        this.signalHub.on('OnPollDeleted', (pollId: string) => {
          this.pollDeleted.next(pollId);
        });

        this.signalHub.on('OnDrawing', (drawing: CanvasWhiteboardUpdate[]) => {
          this.canvasDraw.next(drawing);
        });

        this.signalHub.on('OnErasing', (erase: boolean) => {
          this.canvasErase.next(erase);
        });
      });
  }

  public invoke(method: SignalMethods, arg: any): Observable<void> {
    return from(this.signalHub.invoke(SignalMethods[method].toString(), arg));
  }
}

export interface SignalData {
  fromConnectionId: string;
  signalInfo: string;
}

export enum SignalMethods {
  OnUserConnect,
  OnParticipantLeft,
  OnMediaStateChanged,
  OnMediaStateRequested,
  OnConferenceStartRecording,
  OnConferenceStopRecording,
  OnSendMessage,
  OnGetMessages,
  OnPoll,
  OnPollCreated,
  OnDrawing,
  OnErasing,
}
