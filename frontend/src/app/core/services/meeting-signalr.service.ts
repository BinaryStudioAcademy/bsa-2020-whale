import { Injectable } from '@angular/core';
import { SignalRService } from '../services/signal-r.service';
import { HubConnection } from '@aspnet/signalr';
import { environment } from '../../../environments/environment';
import { Subject, from, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import {
  ChangedMediaState,
  StreamChangedData,
  MeetingConnectionData,
  MeetingMessage,
  Participant,
  PollDto,
  PollResultDto,
  Reaction,
  ChangedMediaPermissions,
  MeetingSettings,
} from '@shared/models';
import { CanvasWhiteboardUpdate } from 'ng2-canvas-whiteboard';
import { Question } from '@shared/models/question/question';
import { QuestionStatus } from '@shared/models/question/question-status';
import { QuestionStatusUpdate } from '@shared/models/question/question-status-update';
import { QuestionDelete } from '@shared/models/question/question-delete';
import { ChangedMeetingSettings } from '@shared/models/meeting/changed-meeting-settings';
import { PointAgenda } from '@shared/models/agenda/agenda';


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

  private participantMediaStateChanged = new Subject<ChangedMediaState>();
  public participantMediaStateChanged$ = this.participantMediaStateChanged.asObservable();

  private mediaStateRequested = new Subject<string>();
  public mediaStateRequested$ = this.mediaStateRequested.asObservable();

  private participantStreamChanged = new Subject<StreamChangedData>();
  public participantStreamChanged$ = this.participantStreamChanged.asObservable();

  private mediaPermissionsChanged = new Subject<ChangedMediaPermissions>();
  public mediaPermissionsChanged$ = this.mediaPermissionsChanged.asObservable();

  private meetingSettingsChanged = new Subject<MeetingSettings>();
  public meetingSettingsChanged$ = this.meetingSettingsChanged.asObservable();

  private meetingEnded = new Subject<void>();
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

  private onRoomCreated = new Subject<string>();
  public readonly onRoomCreated$ = this.onRoomCreated.asObservable();

  private onRoomCreatedToHost = new Subject<string>();
  public readonly onRoomCreatedToHost$ = this.onRoomCreatedToHost.asObservable();

  private onRoomClosed = new Subject<string>();
  public readonly onRoomClosed$ = this.onRoomClosed.asObservable();

  private onParticipentMoveIntoRoom = new Subject<MeetingConnectionData>();
  public readonly onParticipentMoveIntoRoom$ = this.onParticipentMoveIntoRoom.asObservable();

  private shareScreen = new Subject<string>();
  public readonly shareScreen$ = this.shareScreen.asObservable();

  private onDrawingChangePermissions = new Subject<boolean>();
  public readonly onDrawingChangePermissions$ = this.onDrawingChangePermissions.asObservable();

  private shareScreenStop = new Subject<string>();
  public readonly shareScreenStop$ = this.shareScreenStop.asObservable();

  private questionCreated = new Subject<Question>();
  public readonly questionCreated$ = this.questionCreated.asObservable();

  private questionStatusUpdated = new Subject<QuestionStatusUpdate>();
  public readonly questionStatusUpdated$ = this.questionStatusUpdated.asObservable();

  private questionDeleted = new Subject<QuestionDelete>();
  public readonly questionDeleted$ = this.questionDeleted.asObservable();

  private reactionRecived = new Subject<Reaction>();
  public readonly reactionRecived$ = this.reactionRecived.asObservable();

  private onParticipantConnectRoom = new Subject<MeetingConnectionData>();
  public readonly onParticipantConnectRoom$ = this.onParticipantConnectRoom.asObservable();

  private onEndedTopic = new Subject<PointAgenda>();
  public readonly onEndedTopic$ = this.onEndedTopic.asObservable();

  private onOutTime = new Subject<PointAgenda>();
  public readonly onOutTime$ = this.onOutTime.asObservable();

  private onSnoozeTopic = new Subject<PointAgenda>();
  public readonly onSnoozeTopic$ = this.onSnoozeTopic.asObservable();
  constructor(private hubService: SignalRService) {
    from(hubService.registerHub(environment.signalrUrl, 'meeting'))
      .pipe(
        tap((hub) => {
          this.signalHub = hub;
        })
      )
      .subscribe(() => {
        this.signalHub.on('OnConferenceStartRecording', (meetingId: string) => {
          this.conferenceStartRecording.next(meetingId);
        });

        this.signalHub.on('OnConferenceStopRecording', (meetingId: string) => {
          this.conferenceStopRecording.next(meetingId);
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
            this.meetingEnded.next();
          }
        );

        this.signalHub.on(
          'OnMediaStateChanged',
          (mediaState: ChangedMediaState) => {
            this.participantMediaStateChanged.next(mediaState);
          }
        );

        this.signalHub.on(
          'OnParticipantStreamChanged',
          (streamChangedData: StreamChangedData) => {
            this.participantStreamChanged.next(streamChangedData);
          }
        );

        this.signalHub.on(
          'OnMediaStateRequested',
          (senderConnectionId: string) => {
            this.mediaStateRequested.next(senderConnectionId);
          }
        );

        this.signalHub.on(
          'OnMediaPermissionsChanged',
          (changedPermissions: ChangedMediaPermissions) => {
            this.mediaPermissionsChanged.next(changedPermissions);
          }
        );
        this.signalHub.on(
          'OnHostChangeMeetingSetting',
          (changedSetting: MeetingSettings) => {
            this.meetingSettingsChanged.next(changedSetting);
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

        this.signalHub.on('OnDrawingChangePermissions', (enabled: boolean) => {
          this.onDrawingChangePermissions.next(enabled);
        });

        this.signalHub.on('OnDrawing', (drawing: CanvasWhiteboardUpdate[]) => {
          this.canvasDraw.next(drawing);
        });

        this.signalHub.on('OnErasing', (erase: boolean) => {
          this.canvasErase.next(erase);
        });

        this.signalHub.on('OnRoomCreated', (roomId: string) => {
          this.onRoomCreated.next(roomId);
        });

        this.signalHub.on(
          'OnRoomCreatedToHost',
          (roomId: string) => {
            this.onRoomCreatedToHost.next(roomId);
          }
        );

        this.signalHub.on('OnRoomClosed', (meetingLink: string) => {
          this.onRoomClosed.next(meetingLink);
        });

        this.signalHub.on('onParticipentMoveIntoRoom', (connectionData) => {
          this.onParticipentMoveIntoRoom.next(connectionData);
        });

        this.signalHub.on('OnStartShareScreen', (streamId: string) => {
          this.shareScreen.next(streamId);
        });

        this.signalHub.on('OnStopShareScreen', () => {
          this.shareScreenStop.next();
        });

        this.signalHub.on('QuestionCreate', (question: Question) => {
          this.questionCreated.next(question);
        });

        this.signalHub.on(
          'QuestionStatusUpdate',
          (questionStatusUpdate: QuestionStatusUpdate) => {
            this.questionStatusUpdated.next(questionStatusUpdate);
          }
        );

        this.signalHub.on(
          'QuestionDelete',
          (questionDelete: QuestionDelete) => {
            this.questionDeleted.next(questionDelete);
          }
        );

        this.signalHub.on('OnReaction', (reaction: Reaction) => {
          this.reactionRecived.next(reaction);
        });

        this.signalHub.on('OnParticipantConnectRoom', (connectionData: MeetingConnectionData) => {
          this.onParticipantConnectRoom.next(connectionData);
        });
        this.signalHub.on('OnOutTime', (point: PointAgenda) => {
           this.onOutTime.next(point);
        });
        this.signalHub.on('OnSnoozeTopic', (point: PointAgenda) => {
          this.onSnoozeTopic.next(point);
        });
        this.signalHub.on('OnEndedTopic', (point: PointAgenda) => {
         this.onEndedTopic.next(point);
        });
      });
  }

  public invoke<T>(method: SignalMethods, arg: T): Observable<void> {
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
  OnMediaPermissionsChanged,
  OnMediaStateChanged,
  OnMediaStateRequested,
  OnSwitchOffMediaByHost,
  OnConferenceStartRecording,
  OnConferenceStopRecording,
  OnParticipantStreamChanged,
  OnSendMessage,
  OnGetMessages,
  OnPoll,
  OnPollCreated,
  OnDrawing,
  OnErasing,
  CreateRoom,
  OnMoveIntoRoom,
  OnStartShareScreen,
  OnStopShareScreen,
  GetCreatedRooms,
  OnReaction,
  OnLeaveRoom,
  OnDrawingChangePermissions,
  OnHostChangeRoom,
  OnHostChangeMeetingSetting,
  GetMeetingEntityForRoom,
  OnOutTime,
  OnSnoozeTopic,
  OnEndedTopic,
}
