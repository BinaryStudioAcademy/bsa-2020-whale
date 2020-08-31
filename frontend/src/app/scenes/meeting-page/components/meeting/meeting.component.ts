import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  AfterViewInit,
  EventEmitter,
  OnDestroy,
  Inject,
  AfterViewChecked,
  ViewChildren,
  QueryList,
} from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { HttpClient, HttpParams } from '@angular/common/http';
import { ActivatedRoute, Router, Params } from '@angular/router';
import { environment } from '@env';
import {
  CanvasWhiteboardOptions,
  CanvasWhiteboardService,
  CanvasWhiteboardUpdate,
} from 'ng2-canvas-whiteboard';
import { SimpleModalService } from 'ngx-simple-modal';
import { ToastrService } from 'ngx-toastr';
import Peer from 'peerjs';
import { Subject, Observable, BehaviorSubject } from 'rxjs';
import { takeUntil, filter, first } from 'rxjs/operators';

import { AuthService } from 'app/core/auth/auth.service';
import {
  BlobService,
  HttpService,
  MediaSettingsService,
  MeetingService,
  MeetingSignalrService,
  PollService,
  SignalMethods,
  SignalRService,
  RoomService,
} from 'app/core/services';
import {
  ChangedMediaPermissions,
  CardMediaData,
  ChangedMediaState,
  GetMessages,
  Meeting,
  MeetingConnectionData,
  MeetingMessage,
  MeetingMessageCreate,
  Participant,
  ParticipantDynamicData,
  ParticipantRole,
  Statistics,
  MediaData,
  ReactionsEnum,
  Reaction,
} from '@shared/models';
import { EnterModalComponent } from '../enter-modal/enter-modal.component';
import { DivisionByRoomsModalComponent } from '../division-by-rooms-modal/division-by-rooms-modal.component';
import { MeetingInviteComponent } from '@shared/components/meeting-invite/meeting-invite.component';
import { RecordModalComponent } from '../record-modal/record-modal.component';
import * as DecibelMeter from 'decibel-meter';
import { BrowserMediaDevice } from '@shared/browser-media-device';
import { MeetingSettingsService } from '../../../../core/services/meeting-settings.service';

@Component({
  selector: 'app-meeting',
  templateUrl: './meeting.component.html',
  styleUrls: ['./meeting.component.sass'],
})
export class MeetingComponent
  implements OnInit, AfterViewInit, OnDestroy, AfterViewChecked {
  //#region fields
  public canvasIsDisplayed = false;
  public canvasOptions: CanvasWhiteboardOptions = {
    clearButtonEnabled: true,
    clearButtonText: 'Erase',
    undoButtonText: 'Undo',
    undoButtonEnabled: false,
    colorPickerEnabled: true,
    saveDataButtonEnabled: true,
    saveDataButtonText: 'Save',
    lineWidth: 5,
    strokeColor: 'rgb(0,0,0)',
    shouldDownloadDrawing: true,
    drawingEnabled: true,
    showShapeSelector: false,
    shapeSelectorEnabled: true,
    showFillColorPicker: false,
    batchUpdateTimeoutDuration: 250,
    drawButtonEnabled: false,
  };
  public canvasOptionsDisable: CanvasWhiteboardOptions = {
    clearButtonEnabled: false,
    clearButtonText: 'Erase',
    undoButtonText: 'Undo',
    undoButtonEnabled: false,
    colorPickerEnabled: false,
    saveDataButtonEnabled: true,
    saveDataButtonText: 'Save',
    lineWidth: 5,
    strokeColor: 'rgb(0,0,0)',
    shouldDownloadDrawing: true,
    drawingEnabled: false,
    showShapeSelector: false,
    shapeSelectorEnabled: false,
    showFillColorPicker: false,
    batchUpdateTimeoutDuration: 250,
    drawButtonEnabled: false,
  };
  public connectedPeers = new Map<string, MediaStream>();
  public connectedStreams: MediaStream[] = [];
  public connectionData: MeetingConnectionData;
  public currentParticipant: Participant;
  public isAudioSettings = false;
  public isCameraMuted = false;
  public isMicrophoneMuted = false;
  public isNewMsg = false;
  public isScreenRecording = false;
  public isShowChat = false;
  public isShowCurrentParticipantCard = true;
  public isShowParticipants = false;
  public isShowStatistics = false;
  public isVideoSettings = false;
  public isShowMeetingSettings = false;
  public isWaitingForRecord = false;
  public isAddParticipantDisabled = false;
  public isShowReactions = false;
  public mediaData: MediaData[] = [];
  public meeting: Meeting;
  public meetingStatistics: Statistics;
  public msgText = '';
  public msgReceiverEmail = '';
  public whiteboardDisable = '';
  public messages: MeetingMessage[] = [];
  public selectedMessages: MeetingMessage[] = [];
  public newMsgFrom: string[] = [];
  public otherParticipants: Participant[] = [];
  public pattern = new RegExp(/^\S+.*/);
  public peer: Peer;
  public pollService: PollService;
  public receiveingDrawings = false;
  public isHost = false;
  public isRoom = false;
  public isMoveToRoom = false;
  public isMoveToMeeting = false;
  public onCanMoveIntoRoomEvent = new EventEmitter<void>();
  public isSharing = false;
  private sdpVideoBandwidth = 125;
  public meter = new DecibelMeter('meter');
  public browserMediaDevice = new BrowserMediaDevice();
  public lastTrack: MediaStreamTrack;
  public isWhiteboardFullScreen = false;
  private isDrawingEnabled = false;
  public IsWhiteboard = false;
  public IsPoll = false;

  @ViewChild('whiteboard') private whiteboard: ElementRef;
  @ViewChild('board') private canvasWhiteboard: ElementRef;
  @ViewChild('currentVideo') private currentVideo: ElementRef;
  @ViewChild('mainArea', { static: false }) private mainArea: ElementRef<
    HTMLElement
  >;
  @ViewChildren('meetingChat') private chatBlock: QueryList<
    ElementRef<HTMLElement>
  >;

  private chatElement: any;
  private currentStreamLoaded = new EventEmitter<void>();
  private contectedAt = new Date();
  private elem: any;
  private savedStrokes: CanvasWhiteboardUpdate[][] = new Array<
    CanvasWhiteboardUpdate[]
  >();
  private unsubscribe$ = new Subject<void>();
  private userStream: MediaStream;
  //#endregion fields

  constructor(
    @Inject(DOCUMENT) private document: any,
    private authService: AuthService,
    private blobService: BlobService,
    private canvasWhiteboardService: CanvasWhiteboardService,
    private http: HttpClient,
    private httpService: HttpService,
    private mediaSettingsService: MediaSettingsService,
    private meetingSettingsService: MeetingSettingsService,
    private meetingService: MeetingService,
    private route: ActivatedRoute,
    private router: Router,
    private simpleModalService: SimpleModalService,
    private toastr: ToastrService,
    private meetingSignalrService: MeetingSignalrService,
    public roomService: RoomService
  ) {
    this.pollService = new PollService(
      this.meetingSignalrService,
      this.httpService,
      this.toastr,
      this.unsubscribe$
    );
  }

  //#region accessors
  private set currentUserStream(value: MediaStream) {
    if (this.userStream) {
      this.meetingSignalrService.invoke(
        SignalMethods.OnParticipantStreamChanged,
        {
          oldStreamId: this.userStream?.id,
          newStreamId: value.id,
          isAudioAllowed: this.meeting.isAudioAllowed,
          isVideoAllowed: this.meeting.isVideoAllowed,
          isAudioActive: value.getAudioTracks().some((at) => at.enabled),
          isVideoActive: value.getVideoTracks().some((vt) => vt.enabled),
        }
      );
    }

    this.userStream = value;
  }

  private get currentUserStream(): MediaStream {
    return this.userStream;
  }
  //#endregion accessors

  //#region hooks
  public async ngOnInit(): Promise<void> {
    this.isRoom = window.location.pathname.includes('room');
    this.roomService.isInRoom = this.isRoom;
    if (this.isRoom) {
      this.router.routeReuseStrategy.shouldReuseRoute = () => false;
    }

    this.currentUserStream = await navigator.mediaDevices
      .getUserMedia(await this.mediaSettingsService.getMediaConstraints())
      .catch(() => {
        return null;
      });
    if (!this.currentUserStream || !this.currentUserStream?.active) {
      this.toastr.error('Cannot access the camera and microphone');
      this.leaveUnConnected();
      return;
    }

    const settings = this.currentUserStream.getVideoTracks()[0].getSettings();
    settings.frameRate = 20;
    settings.height = 480;
    settings.width = 640;
    settings.resizeMode = 'crop-and-scale';
    await this.currentUserStream.getVideoTracks()[0].applyConstraints(settings);

    this.connectedStreams.push(this.currentUserStream);

    // when someone connected to meeting
    this.meetingSignalrService.signalUserConected$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(
        (connectData) => {
          if (connectData.peerId === this.peer.id) {
            this.pollService.getPollsAndResults(
              this.meeting.id,
              connectData.participant.user.id
            );
            return;
          }

          const index = this.meeting.participants.findIndex(
            (p) => p.id === connectData.participant.id
          );
          if (index >= 0) {
            this.meeting.participants[index] = connectData.participant;
            this.roomService.updateParticipant(connectData.participant);
          } else {
            this.addParticipantToMeeting(connectData.participant);
          }

          this.connect(connectData.peerId);

          this.toastr.success(`${connectData.participant.user.firstName}
          ${connectData.participant.user.secondName} connected`);
        },
        (err) => {
          this.toastr.error(err.Message);
          this.leave();
        }
      );

    this.meetingSignalrService.participantConected$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(
        (participants) => {
          this.meeting.participants = participants;
          this.roomService.participants = Array.from(participants);
          this.currentParticipant = participants.find(
            (p) => p.user.email === this.authService.currentUser.email
          );
          this.isHost = this.currentParticipant.role === ParticipantRole.Host;
          this.roomService.isUserHost = this.isHost;
          this.meeting.isWhiteboard && !this.isHost
            ? (this.whiteboardDisable = '(drawing is disabled by Host)')
            : (this.whiteboardDisable = '');
          this.otherParticipants = participants.filter(
            (p) => p.id !== this.currentParticipant.id
          );
          this.createParticipantCard(this.currentParticipant);

          if (this.isHost) {
            this.roomService.getRoomsOfMeeting(this.meeting.id);
          }
        },
        (err) => {
          this.toastr.error(err.Message);
        }
      );

    // when someone left meeting
    this.meetingSignalrService.signalParticipantLeft$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((connectionData) => {
        this.removeParticipantFromMeeting(connectionData.participant);
        if (this.connectedPeers.has(connectionData.peerId)) {
          this.connectedPeers.delete(connectionData.peerId);
        }

        this.deleteParticipantMediaData(
          connectionData.streamId,
          connectionData.participant.user.firstName,
          connectionData.participant.user.secondName,
          'has left'
        );
      });

    this.meetingSignalrService.signalParticipantDisconnected$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((participant) => {
        this.removeParticipantFromMeeting(participant);

        this.connectedPeers = new Map(
          [...this.connectedPeers].filter(
            ([_, v]) => v.id !== participant.streamId
          )
        );

        this.deleteParticipantMediaData(
          participant.streamId,
          participant.user.firstName,
          participant.user.secondName,
          'disconnected'
        );
      });

    this.meetingSignalrService.mediaStateRequested$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((senderConnectionId) => {
        this.invokeMediaStateChanged(senderConnectionId);
      });

    this.meetingSignalrService.participantMediaStateChanged$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(
        (mediaData) => {
          this.updateCardDynamicData(
            mediaData.streamId,
            mediaData.isAudioAllowed,
            mediaData.isVideoAllowed,
            mediaData.isAudioActive,
            mediaData.isVideoActive
          );
        },
        () => {
          this.toastr.error(
            'Error occured during participants media state updating'
          );
        }
      );

    this.meetingSignalrService.onDrawingChangePermissions$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(
        (enabled) => {
          this.isDrawingEnabled = enabled;

          if (this.isHost) {
            this.canvasWhiteboard.nativeElement.style.pointerEvents = 'all';
          } else {
            if (!this.isDrawingEnabled) {
              this.canvasWhiteboard.nativeElement.style.pointerEvents = 'none';
              this.toastr.info('Host disabled drawing');
            } else {
              this.canvasWhiteboard.nativeElement.style.pointerEvents = 'all';
              this.toastr.info('Host enabled drawing for everyone');
            }
          }
        },
        () => {
          this.toastr.error('Error occured during drawing change permissions');
        }
      );

    this.meetingSignalrService.participantStreamChanged$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(
        (streamChangedData) => {
          const changedMediaData = this.mediaData.find(
            (md) => md.currentStreamId === streamChangedData.oldStreamId
          );
          if (changedMediaData) {
            const changedParticipant = this.meeting.participants.find(
              (p) => p.streamId === streamChangedData.oldStreamId
            );
            if (changedParticipant) {
              changedParticipant.streamId = streamChangedData.newStreamId;
            }
            changedMediaData.currentStreamId = streamChangedData.newStreamId;
            this.updateCardDynamicData(
              streamChangedData.newStreamId,
              streamChangedData.isAudioAllowed,
              streamChangedData.isVideoAllowed,
              streamChangedData.isAudioActive,
              streamChangedData.isVideoActive
            );
          }
        },
        () => {
          this.toastr.error(
            'Error occured during participants media stream changing'
          );
        }
      );

    this.meetingSignalrService.mediaPermissionsChanged$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(
        (data) => {
          if (!data.changedParticipantConnectionId) {
            if (
              this.meeting.isAudioAllowed !== data.isAudioAllowed &&
              this.currentParticipant.role !== ParticipantRole.Host
            ) {
              this.toastr.info(
                `Participants' audio ${
                  data.isAudioAllowed ? 'enabled' : 'disabled'
                } by the host`
              );
            } else if (
              this.meeting.isVideoAllowed !== data.isVideoAllowed &&
              this.currentParticipant.role !== ParticipantRole.Host
            ) {
              this.toastr.info(
                `Participants' video ${
                  data.isVideoAllowed ? 'enabled' : 'disabled'
                } by the host`
              );
            }

            this.meeting.isAudioAllowed = data.isAudioAllowed;
            this.meeting.isVideoAllowed = data.isVideoAllowed;
            this.meetingSignalrService.invoke<ChangedMediaState>(
              SignalMethods.OnMediaStateChanged,
              {
                streamId: this.currentParticipant.streamId,
                isAudioAllowed: this.meeting.isAudioAllowed,
                isVideoAllowed: this.meeting.isVideoAllowed,
                isAudioActive: !this.isMicrophoneMuted,
                isVideoActive: !this.isCameraMuted,
              }
            );
          } else if (
            data.changedParticipantConnectionId ===
            this.currentParticipant.activeConnectionId
          ) {
            if (
              this.meeting.isAudioAllowed !== data.isAudioAllowed &&
              this.currentParticipant.role !== ParticipantRole.Host
            ) {
              this.toastr.info(
                `Your audio ${
                  data.isAudioAllowed ? 'enabled' : 'disabled'
                } by the host`
              );
            } else if (
              this.meeting.isVideoAllowed !== data.isVideoAllowed &&
              this.currentParticipant.role !== ParticipantRole.Host
            ) {
              this.toastr.info(
                `Your video ${
                  data.isVideoAllowed ? 'enabled' : 'disabled'
                } by the host`
              );
            }

            this.meeting.isAudioAllowed = data.isAudioAllowed;
            this.meeting.isVideoAllowed = data.isVideoAllowed;
            this.updateCardDynamicData(
              this.meeting.participants.find(
                (p) =>
                  p.activeConnectionId === data.changedParticipantConnectionId
              )?.streamId,
              data.isAudioAllowed,
              data.isVideoAllowed,
              !this.isCameraMuted,
              !this.isMicrophoneMuted
            );

            if (!this.isMicrophoneMuted && !data.isAudioAllowed) {
              this.toggleMicrophone();
            }

            if (!this.isCameraMuted && !data.isVideoAllowed) {
              this.toggleCamera();
            }
          } else {
            this.updateCardDynamicData(
              this.meeting.participants.find(
                (p) =>
                  p.activeConnectionId === data.changedParticipantConnectionId
              )?.streamId,
              data.isAudioAllowed,
              data.isVideoAllowed,
              data.isAudioActive,
              data.isVideoActive
            );
          }
        },
        (err) => {
          this.toastr.error(err.message);
        }
      );

    this.meetingSignalrService.meetingSettingsChanged$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(
        (setting) => {
          this.meeting.isWhiteboard = setting.isWhiteboard;
          this.meeting.isPoll = setting.isPoll;
          this.meeting.isWhiteboard && !this.isHost
            ? (this.whiteboardDisable = '(drawing is disabled by Host)')
            : (this.whiteboardDisable = '');
          this.savedStrokes.forEach((strokes) =>
            this.meetingSignalrService.invoke(SignalMethods.OnDrawing, {
              meetingId: this.meeting.id.toString(),
              canvasEvent: strokes,
            })
          );
        },
        () => {
          this.toastr.error(
            'Error occurred during participants setting updating'
          );
        }
      );

    this.meetingSignalrService.meetingEnded$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(
        () => {
          this.toastr.info('Meeting ended');
          this.leave();
        },
        () => {
          this.toastr.error('Error occured when ending meeting');
        }
      );

    this.meetingSignalrService.getMessages$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(
        (messages) => {
          this.messages = messages;
          this.updateSelectedMessages();
          this.messages.forEach((m) => this.notifyNewMsg(m));
        },
        () => {
          this.toastr.error('Error occured when getting messages');
        }
      );

    this.meetingSignalrService.sendMessage$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(
        (message) => {
          this.messages.push(message);
          this.updateSelectedMessages();
          this.notifyNewMsg(message);
          if (this.isShowChat) {
            this.chatBlock.changes.pipe(first()).subscribe(() => {
              this.scrollDown();
            });
          }
        },
        () => {
          this.toastr.error('Error occured when sending message');
        }
      );

    this.meetingSignalrService.canvasDraw$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(
        (strokes) => {
          this.canvasWhiteboardService.drawCanvas(strokes);
          this.receiveingDrawings = true;
          this.savedStrokes.push(strokes);
        },
        () => {
          this.toastr.error('Error occured while trying to get drawings');
        }
      );

    this.meetingSignalrService.canvasErase$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(
        (erase) => {
          if (erase) {
            this.canvasWhiteboardService.clearCanvas();
            this.savedStrokes = new Array<CanvasWhiteboardUpdate[]>();
            this.receiveingDrawings = false;
          }
        },
        () => {
          this.toastr.error('Error occured while trying to erase drawings');
        }
      );
    this.meetingSignalrService.shareScreen$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(
        (streamId) => {
          const stream = this.connectedStreams.find((x) => x.id === streamId);
          this.fullPage(streamId);
          this.toastr.success('Start sharing screen');
        },
        () => {
          this.toastr.error('Error while trying to share screen');
        }
      );
    this.meetingSignalrService.shareScreenStop$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(() => {
        this.stopShare();
      });

    this.meetingSignalrService.onRoomCreated$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(
        (roomId) => {
          if (!this.isHost) {
            this.isMoveToRoom = true;
            this.router.navigate([`/room/${roomId}`]);
          }
        },
        (err) => {
          this.toastr.error('Error occured while trying to create room');
        }
      );

    this.meetingSignalrService.onRoomClosed$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((link) => {
        if (this.isRoom) {
          this.isMoveToMeeting = true;
          this.router.navigate([`/meeting-page/${link}`]);
        }
      });

    this.meetingSignalrService.onParticipentMoveIntoRoom$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((connectionData) => {
        if (this.connectedPeers.has(connectionData.peerId)) {
          this.connectedPeers.delete(connectionData.peerId);
        }

        this.deleteParticipantMediaData(
          connectionData.streamId,
          connectionData.participant.user.firstName,
          connectionData.participant.user.secondName,
          'moved into room'
        );
      });

    this.meetingSignalrService.reactionRecived$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(
        (reaction) => {
          this.mediaData
            .find((m) => m.id === reaction.userId)
            .reactions.next(reaction.reaction);
        },
        (error) => {
          this.toastr.error(error);
        }
      );

    // create new peer
    this.peer = new Peer(environment.peerOptions);

    // when peer opened send my peer id everyone
    this.peer.on('open', (id) => this.onPeerOpen(id));

    // when get call answer to it
    this.peer.on('call', (call) => {
      // show caller
      call.on('stream', (stream) => {
        if (!this.connectedStreams.includes(stream)) {
          this.connectedStreams.push(stream);

          const participant = this.meeting.participants.find(
            (p) => p.streamId === stream.id
          );

          this.createParticipantCard(participant);
        }
        this.connectedPeers.set(call.peer, stream);
      });

      // send mediaStream to caller
      call.answer(this.currentUserStream, {
        sdpTransform: (sdp) =>
          this.setMediaBitrate(sdp, 'video', this.sdpVideoBandwidth),
      });
    });

    if (this.mediaSettingsService.settings.IsMirrorVideo) {
      this.currentVideo.nativeElement.style.transform = 'scale(-1,1)';
    }
    // show a warning dialog if close current tab or window
    window.onbeforeunload = (ev: BeforeUnloadEvent) => {
      ev.preventDefault();
      ev = ev || window.event;
      ev.returnValue = '';
      return '';
    };
  }

  public ngAfterViewInit(): void {
    this.elem = this.mainArea.nativeElement;
    this.currentStreamLoaded.subscribe(() => {
      this.currentVideo.nativeElement.srcObject = this.currentUserStream;
      if (this.mediaSettingsService.settings.IsMirrorVideo) {
        this.currentVideo.nativeElement.style.transform = 'scale(-1,1)';
        document.querySelector('video').style.transform = 'scale(-1,1)';
      }
      this.setOutputDevice();
    });
  }

  ngAfterViewChecked(): void {
    if (this.canvasWhiteboard !== undefined && this.isHost) {
      this.canvasWhiteboard.nativeElement.style.pointerEvents = 'all';
    }

    if (this.isShowChat) {
      this.chatElement = this.chatBlock.first?.nativeElement;
    }
  }

  public ngOnDestroy(): void {
    this.destroyPeer();
    this.currentUserStream?.getTracks().forEach((track) => track.stop());

    if (this.connectionData) {
      if (this.isMoveToRoom && !this.isRoom) {
        this.meetingSignalrService.invoke(
          SignalMethods.OnMoveIntoRoom,
          this.connectionData
        );
      } else if (this.isRoom && (this.isMoveToRoom || this.isMoveToMeeting)) {
        this.meetingSignalrService.invoke(
          SignalMethods.OnLeaveRoom,
          this.connectionData
        );
      } else {
        this.connectionData.participant = this.currentParticipant;
        this.meetingSignalrService.invoke(
          SignalMethods.OnParticipantLeft,
          this.connectionData
        );
      }
    }

    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  private deleteParticipantMediaData(
    streamId: string,
    firstName: string,
    lastName: string,
    message: string
  ): void {
    const disconectedMediaDataIndex = this.mediaData.findIndex(
      (m) => m.stream.id === streamId
    );
    if (disconectedMediaDataIndex >= 0) {
      this.mediaData.splice(disconectedMediaDataIndex, 1);
      this.toastr.info(`${firstName}${lastName ? lastName : ''} ${message}`);
    }
  }
  //#endregion hooks

  //#region options
  public toggleMicrophone(isMissSignaling: boolean = false): void {
    if (
      !this.meeting.isAudioAllowed &&
      this.currentParticipant?.role !== ParticipantRole.Host
    ) {
      this.switchTrack(false, false);
      this.isMicrophoneMuted = true;
      return;
    }

    this.isMicrophoneMuted
      ? this.switchTrack(true, false)
      : this.switchTrack(false, false);

    this.isMicrophoneMuted = !this.isMicrophoneMuted;
    if (!isMissSignaling) {
      this.invokeMediaStateChanged();
    }
  }

  public toggleCamera(isMissSignaling: boolean = false): void {
    if (
      !this.meeting.isVideoAllowed &&
      this.currentParticipant?.role !== ParticipantRole.Host
    ) {
      this.switchTrack(false, true);
      this.isCameraMuted = true;
      return;
    }

    this.isCameraMuted
      ? this.switchTrack(true, true)
      : this.switchTrack(false, true);

    this.isCameraMuted = !this.isCameraMuted;
    if (!isMissSignaling) {
      this.invokeMediaStateChanged();
    }
  }

  private switchTrack(enable: boolean, isVideo: boolean): void {
    const tracks = isVideo
      ? this.currentUserStream.getVideoTracks()
      : this.currentUserStream.getAudioTracks();

    tracks.forEach((track) => {
      track.enabled = enable;
    });
  }

  public startRecording(): void {
    this.isScreenRecording = true;

    this.blobService.startRecording().subscribe({
      complete: () => (this.isWaitingForRecord = false),
      next: (permited) => {
        if (permited) {
          this.meetingSignalrService.invoke(
            SignalMethods.OnConferenceStartRecording,
            'Conference start recording'
          );
          this.toastr.info('Start recording a conference');
          this.blobService.recordReady$
            .pipe(takeUntil(this.unsubscribe$))
            .pipe(first())
            .subscribe(
              (resp) => {
                this.simpleModalService.addModal(RecordModalComponent, {
                  link: resp,
                });
              },
              (err) => {
                console.error(err.message);
              }
            );
        } else {
          this.isScreenRecording = false;
        }
      },
    });
  }

  public stopRecording(): void {
    this.isWaitingForRecord = true;

    this.isScreenRecording = false;

    this.blobService.stopRecording();

    this.meetingSignalrService.invoke(
      SignalMethods.OnConferenceStopRecording,
      'Conference stop recording'
    );
    this.toastr.info('Stop recording a conference');
  }

  public onPollIconClick(): void {
    this.isShowStatistics = false;
    this.isShowMeetingSettings = false;
    this.isShowReactions = false;
    this.pollService.onPollIconClick();
  }
  public onMeetingSettingClick(): void {
    this.isShowStatistics = false;
    this.pollService.isShowPoll = false;
    this.isShowMeetingSettings = !this.isShowMeetingSettings;
  }

  public onStatisticsIconClick(): void {
    this.isShowReactions = false;
    this.pollService.isShowPoll = false;
    this.isShowMeetingSettings = false;
    this.pollService.isPollCreating = false;
    this.pollService.isShowPollResults = false;

    if (!this.meetingStatistics) {
      if (!this.meeting) {
        this.toastr.warning('Something went wrong. Try again later.');
        this.route.params.subscribe((params: Params) => {
          this.getMeeting(params[`link`]);
        });
      }
      this.meetingStatistics = {
        startTime: this.meeting.startTime,
        userJoinTime: this.contectedAt,
      };
    }
    this.isShowStatistics = !this.isShowStatistics;
  }
  public onReactionsIconClick(): void {
    this.pollService.isShowPoll = false;
    this.pollService.isPollCreating = false;
    this.pollService.isShowPollResults = false;
    this.isShowStatistics = false;
    this.isShowReactions = !this.isShowReactions;
  }

  public onCopyIconClick(): void {
    const URL: string = this.document.location.href;
    const chanks = URL.split('/');

    if (this.isRoom) {
      this.createTextareaAndCopy(URL);
    }

    this.getShortInviteLink().subscribe((short) => {
      chanks[chanks.length - 1] = short;
      chanks[chanks.length - 2] = 'redirection';

      this.createTextareaAndCopy(chanks.join('/'));
    });
  }

  private createTextareaAndCopy(value: string): void {
    const copyBox = document.createElement('textarea');
    copyBox.style.position = 'fixed';
    copyBox.style.left = '0';
    copyBox.style.top = '0';
    copyBox.style.opacity = '0';
    copyBox.value = value;
    document.body.appendChild(copyBox);
    copyBox.focus();
    copyBox.select();
    document.execCommand('copy');
    document.body.removeChild(copyBox);
    this.toastr.success('Copied');
  }

  scrollDown(): void {
    const chatHtml = this.chatBlock.first.nativeElement as HTMLElement;
    const isScrolledToBottom =
      chatHtml.scrollHeight - chatHtml.clientHeight > chatHtml.scrollTop;

    if (isScrolledToBottom) {
      chatHtml.scrollTop = chatHtml.scrollHeight - chatHtml.clientHeight;
    }
  }

  public goFullscreen(): void {
    if (this.elem.requestFullscreen) {
      this.elem.requestFullscreen();
    } else if (this.elem.mozRequestFullScreen) {
      this.elem.mozRequestFullScreen();
    } else if (this.elem.webkitRequestFullscreen) {
      this.elem.webkitRequestFullscreen();
    } else if (this.elem.msRequestFullscreen) {
      this.elem.msRequestFullscreen();
    }
  }

  public closeFullscreen(): void {
    if (this.document.exitFullscreen) {
      this.document.exitFullscreen();
    } else if (this.document.mozCancelFullScreen) {
      this.document.mozCancelFullScreen();
    } else if (this.document.webkitExitFullscreen) {
      this.document.webkitExitFullscreen();
    } else if (this.document.msExitFullscreen) {
      this.document.msExitFullscreen();
    }
  }

  public leave(): void {
    // this is made to remove eventListener for other routes
    window.onbeforeunload = () => {};
    this.meter.stopListening();
    this.meter.disconnect();
    this.router.navigate(['/home']);
  }

  private getShortInviteLink(): Observable<string> {
    const URL: string = this.document.location.href;
    const chanks = URL.split('/');
    const meetingLink = chanks[chanks.length - 1];

    const baseUrl: string = environment.apiUrl;

    return this.http.get(`${baseUrl}/api/meeting/shortenLink/${meetingLink}`, {
      responseType: 'text',
    });
  }

  private addParticipantToMeeting(participant: Participant): void {
    if (!this.meeting.participants.some((p) => p.id === participant.id)) {
      this.meeting.participants.push(participant);
      this.otherParticipants.push(participant);
      this.roomService.addParticipant(participant);
    }
  }

  private removeParticipantFromMeeting(participant: Participant): void {
    this.meeting.participants = this.meeting.participants.filter(
      (p) => p.id !== participant.id
    );
    this.roomService.deleteParticipant(participant.id);
    this.otherParticipants = this.otherParticipants.filter(
      (p) => p.id !== participant.id
    );
    this.newMsgFrom = this.newMsgFrom.filter(
      (e) => e !== participant.user.email
    );
  }

  // call to peer
  private connect(recieverPeerId: string): void {
    const call = this.peer.call(recieverPeerId, this.currentUserStream, {
      sdpTransform: (sdp: string) =>
        this.setMediaBitrate(sdp, 'video', this.sdpVideoBandwidth),
    });

    // get answer and show other user
    call?.on('stream', (stream) => {
      this.connectedStreams.push(stream);
      const connectedPeer = this.connectedPeers.get(call.peer);
      if (!connectedPeer || connectedPeer.id !== stream.id) {
        const participant = this.meeting.participants.find(
          (p) => p.streamId === stream.id
        );
        this.createParticipantCard(participant);
        this.connectedPeers.set(call.peer, stream);
      }
    });
  }

  private getMeeting(link: string): void {
    if (this.isRoom) {
      this.meeting = {
        id: this.route.snapshot.params.link,
        settings: '',
        startTime: new Date(),
        isScheduled: false,
        isRecurrent: false,
        isAudioAllowed: true,
        isVideoAllowed: true,
        isWhiteboard: false,
        isPoll: false,
        anonymousCount: 0,
        pollResults: [],
        participants: [],
      };

      this.connectionData.meetingId = this.route.snapshot.params.link;
      this.connectionData.meetingPwd = '';
      this.connectionData.isRoom = true;

      this.createEnterModal().then(() => {
        this.currentStreamLoaded.emit();

        this.meetingSignalrService
          .invoke(SignalMethods.OnUserConnect, this.connectionData)
          .subscribe(
            () => {},
            (err) => {
              this.toastr.error('Unable to connect to meeting');
              this.router.navigate(['/home']);
            }
          );
        this.meetingSignalrService.invoke(SignalMethods.OnGetMessages, {
          meetingId: this.meeting.id,
          email: this.authService.currentUser.email,
        } as GetMessages);
      });

      return;
    }

    this.meetingService
      .connectMeeting(link)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(
        (resp) => {
          this.meeting = resp.body;
          this.createEnterModal().then(() => {
            this.currentStreamLoaded.emit();
            this.connectionData.meetingId = this.meeting.id;
            this.meetingSignalrService.invoke(
              SignalMethods.OnUserConnect,
              this.connectionData
            );
            this.meetingSignalrService.invoke(SignalMethods.OnGetMessages, {
              meetingId: this.meeting.id,
              email: this.authService.currentUser.email,
            } as GetMessages);
          });
        },
        (error) => {
          console.error(error.message);
          this.leaveUnConnected();
        }
      );
  }

  private leaveUnConnected(): void {
    this.currentUserStream?.getTracks()?.forEach((track) => track.stop());
    this.destroyPeer();
    this.meter.stopListening();
    this.meter.disconnect();
    this.router.navigate(['/home']);
  }

  private invokeMediaStateChanged(receiverConnectionId = ''): void {
    this.meetingSignalrService.invoke(SignalMethods.OnMediaStateChanged, {
      streamId: this.currentUserStream.id,
      receiverConnectionId,
      isAudioAllowed: this.meeting.isAudioAllowed,
      isVideoAllowed: this.meeting.isVideoAllowed,
      isAudioActive: !this.isMicrophoneMuted,
      isVideoActive: !this.isCameraMuted,
    });
  }

  private async createEnterModal(): Promise<void> {
    const isCurrentParticipantHost = this.meeting.participants.some(
      (p) =>
        p.user.email === this.authService.currentUser.email &&
        p.role === ParticipantRole.Host
    );

    const modalResult = await this.simpleModalService
      .addModal(EnterModalComponent, {
        isCurrentParticipantHost,
        isAllowedAudioOnStart: this.meeting.isAudioAllowed,
        isAllowedVideoOnStart: this.meeting.isVideoAllowed,
      })
      .toPromise();

    if (modalResult.leave) {
      this.leaveUnConnected();
      return;
    }

    if (modalResult.cameraOff) {
      this.toggleCamera(true);
    }

    if (modalResult.microOff) {
      this.toggleMicrophone(true);
    }

    this.meeting.isAudioAllowed = modalResult.isAllowedAudioOnStart;
    this.meeting.isVideoAllowed = modalResult.isAllowedVideoOnStart;

    if (
      isCurrentParticipantHost &&
      (this.meeting.isVideoAllowed !== modalResult.isAllowedVideoOnStart ||
        this.meeting.isAudioAllowed !== modalResult.isAllowedAudioOnStart)
    ) {
      this.meetingService
        .updateMediaOnStart({
          meetingId: this.meeting.id,
          isAudioAllowed: modalResult.isAllowedAudioOnStart,
          isVideoAllowed: modalResult.isAllowedVideoOnStart,
        })
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe(() => {
          this.meetingSignalrService.invoke(
            SignalMethods.OnMediaPermissionsChanged,
            {
              isAudioAllowed: modalResult.isAllowedAudioOnStart,
              isVideoAllowed: modalResult.isAllowedVideoOnStart,
            }
          );
        });
    }
  }

  //#endregion options

  //#region peers
  // send message to all subscribers that added new user
  private onPeerOpen(id: string): void {
    this.route.params.subscribe((params: Params) => {
      const link: string = params[`link`];
      const urlParams = new URLSearchParams(link);
      const groupId = urlParams.get('id');
      const groupPwd = urlParams.get('pwd');

      this.connectionData = {
        peerId: id,
        userEmail: this.authService.currentUser.email,
        meetingId: groupId,
        meetingPwd: groupPwd,
        streamId: this.currentUserStream.id,
        participant: this.currentParticipant, // this.currentParticipant is undefined here
        isRoom: false,
      };

      this.getMeeting(link);
    });
  }

  private destroyPeer(): void {
    this.peer?.disconnect();
    this.peer?.destroy();
  }
  //#endregion peers

  //#region participant cards
  public createParticipantCard(
    participant: Participant,
    shouldPrepend = false
  ): void {
    const stream =
      participant.streamId === this.currentParticipant.streamId
        ? this.currentUserStream
        : this.connectedStreams.find((s) => s.id === participant.streamId);

    const newMediaData = {
      id: participant.id,
      isCurrentUser: participant.id === this.currentParticipant.id,
      currentStreamId: stream.id,
      stream,
      dynamicData: new BehaviorSubject<ParticipantDynamicData>({
        isUserHost: participant.role === ParticipantRole.Host,
        userFirstName: participant.user.firstName,
        userSecondName: participant.user.secondName,
        avatarUrl: participant.user.avatarUrl,
        isVideoAllowed:
          stream.id === this.currentUserStream.id
            ? this.meeting.isVideoAllowed
            : false,
        isAudioAllowed:
          stream.id === this.currentUserStream.id
            ? this.meeting.isAudioAllowed
            : false,
        isVideoActive:
          stream.id === this.currentUserStream.id
            ? this.currentUserStream.getVideoTracks().some((vt) => vt.enabled)
            : false,
        isAudioActive:
          stream.id === this.currentUserStream.id
            ? this.currentUserStream.getAudioTracks().some((at) => at.enabled)
            : true,
      }),
      reactions: new Subject<ReactionsEnum>(),
      volume: 0,
    } as MediaData;

    if (participant.id !== this.currentParticipant.id) {
      const audioContext = new AudioContext();
      const mediaStreamSource = audioContext.createMediaStreamSource(stream);
      const processor = audioContext.createScriptProcessor(256, 1, 1);
      mediaStreamSource.connect(processor);
      processor.connect(audioContext.destination);
      processor.onaudioprocess = (e) => {
        const inputData = e.inputBuffer.getChannelData(0);
        const inputDataLength = inputData.length;
        let total = 0;
        for (let i = 0; i < inputDataLength; i++) {
          total += Math.abs(inputData[i++]);
        }
        newMediaData.volume = Math.sqrt(total / inputDataLength) * 100;
      };
    } else {
      this.browserMediaDevice.getAudioInputList().then((res) => {
        const device = res.find(
          (d) =>
            d.deviceId === stream.getAudioTracks()[0].getSettings().deviceId
        ) as MediaDeviceInfo;
        this.meter.connect(device);
        this.meter.on(
          'sample',
          (dB, percent, value) => (newMediaData.volume = dB + 100)
        );
        this.meter.listen();
      });
    }

    shouldPrepend
      ? this.mediaData.unshift(newMediaData)
      : this.mediaData.push(newMediaData);

    if (stream.id !== this.currentUserStream.id) {
      this.meetingSignalrService.invoke(
        SignalMethods.OnMediaStateRequested,
        this.meeting.participants.find((p) => p.streamId === stream.id)
          ?.activeConnectionId
      );
    }

    this.setOutputDevice();
  }

  public switchParticipantMediaAsHost(data: CardMediaData): void {
    const participantConnectionId = this.meeting.participants.find(
      (p) => p.streamId === data.cardStreamId
    )?.activeConnectionId;
    this.meetingSignalrService.invoke<ChangedMediaPermissions>(
      SignalMethods.OnMediaPermissionsChanged,
      {
        changedParticipantConnectionId: participantConnectionId,
        isAudioAllowed: data.isAudioAllowed,
        isVideoAllowed: data.isVideoAllowed,
        isAudioActive: data.isAudioActive,
        isVideoActive: data.isVideoActive,
      }
    );
  }

  public hideViewEventHandler(mediaDataId: string): void {
    this.mediaData = this.mediaData.filter((d) => d.id !== mediaDataId);
    this.isShowCurrentParticipantCard = false;
  }

  private updateCardDynamicData(
    streamId: string,
    isAudioAllowed: boolean,
    isVideoAllowed: boolean,
    isAudioActive?: boolean,
    isVideoActive?: boolean
  ): void {
    const participant =
      this.currentParticipant.streamId === streamId
        ? this.currentParticipant
        : this.meeting.participants.find((p) => p.streamId === streamId);
    const changedMediaData = this.mediaData.find(
      (s) => s.currentStreamId === streamId
    );

    if (!changedMediaData || !participant) {
      return;
    }

    changedMediaData.dynamicData.next({
      isUserHost: participant.role === ParticipantRole.Host,
      userFirstName: participant.user.firstName,
      userSecondName: participant.user.secondName,
      avatarUrl: participant.user.avatarUrl,
      isAudioAllowed,
      isVideoAllowed,
      isAudioActive,
      isVideoActive,
    });
  }
  //#endregion participant cards

  //#region chat
  public showChat(): void {
    this.isShowChat = !this.isShowChat;
    if (this.isShowChat) {
      this.receiverChanged();
      this.chatBlock.changes.pipe(first()).subscribe(() => {
        this.chatBlock.first.nativeElement.scrollTo(
          0,
          this.chatBlock.first.nativeElement.scrollHeight
        );
      });
    }
    this.isNewMsg = !this.isShowChat && this.newMsgFrom.length > 0;
  }

  public sendMessage(): void {
    if (this.msgText.trim().length !== 0) {
      this.meetingSignalrService.invoke(SignalMethods.OnSendMessage, {
        authorEmail: this.authService.currentUser.email,
        meetingId: this.meeting.id,
        message: this.msgText,
        receiverEmail: this.msgReceiverEmail,
      } as MeetingMessageCreate);

      this.msgText = '';
    }
  }

  public onEnterKeyPress(event: KeyboardEvent): void {
    event.preventDefault();
    if (this.msgText.length) {
      this.sendMessage();
    }
  }

  public splitMessage(message: string): string[] {
    return message.split(/\n/gi);
  }

  public receiverChanged(): void {
    this.updateSelectedMessages();
    this.newMsgFrom = this.newMsgFrom.filter(
      (e) => e !== this.msgReceiverEmail
    );
  }

  public updateSelectedMessages(): void {
    if (this.msgReceiverEmail === '') {
      this.selectedMessages = this.messages.filter((m) => m.receiver == null);
    } else {
      this.selectedMessages = this.messages.filter(
        (m) =>
          m.receiver != null &&
          (m?.receiver?.email === this.msgReceiverEmail ||
            m?.author?.email === this.msgReceiverEmail)
      );
    }
  }

  public notifyNewMsg(msg: MeetingMessage): void {
    if (msg.author.email !== this.authService.currentUser.email) {
      this.isNewMsg = !this.isShowChat;
      if (msg.receiver == null && this.msgReceiverEmail !== '') {
        this.newMsgFrom.push('');
      }
      if (
        msg.receiver != null &&
        this.msgReceiverEmail !== msg.author.email &&
        this.otherParticipants.findIndex(
          (p) => p.user.email === msg.author.email
        ) >= 0
      ) {
        this.newMsgFrom.push(msg.author.email);
      }
    }
  }
  //#endregion chat

  //#region whiteboard
  public onCanvasDraw(event): void {
    const strokes = event as CanvasWhiteboardUpdate[];
    this.savedStrokes.push(strokes);
    this.meetingSignalrService.invoke(SignalMethods.OnDrawing, {
      meetingId: this.meeting.id.toString(),
      canvasEvent: strokes,
    });
  }

  public onDrawingChangePermissions(event): void {
    const enabled = event.target.checked;

    this.meetingSignalrService.invoke(
      SignalMethods.OnDrawingChangePermissions,
      enabled
    );
  }

  public onCanvasClear(): void {
    this.meetingSignalrService.invoke(SignalMethods.OnErasing, {
      meetingId: this.meeting.id.toString(),
      erase: true,
    });
    this.savedStrokes = new Array<CanvasWhiteboardUpdate[]>();
  }

  public whiteboardFullscreen(): void {
    this.isWhiteboardFullScreen = !this.isWhiteboardFullScreen;

    if (this.isWhiteboardFullScreen) {
      if (this.whiteboard.nativeElement.requestFullscreen) {
        this.whiteboard.nativeElement.requestFullscreen();
      } else if (this.whiteboard.nativeElement.mozRequestFullScreen) {
        this.whiteboard.nativeElement.mozRequestFullScreen();
      } else if (this.whiteboard.nativeElement.webkitRequestFullscreen) {
        this.whiteboard.nativeElement.webkitRequestFullscreen();
      } else if (this.whiteboard.nativeElement.msRequestFullscreen) {
        this.whiteboard.nativeElement.msRequestFullscreen();
      }
    } else {
      this.closeFullscreen();
    }
  }

  public async showCanvas(): Promise<void> {
    this.canvasIsDisplayed = !this.canvasIsDisplayed;
    this.receiveingDrawings = false;

    if (this.canvasIsDisplayed) {
      await this.delay(200);
      this.savedStrokes.forEach((strokes) =>
        this.canvasWhiteboardService.drawCanvas(strokes)
      );
    }
  }

  public checkDrawing(): boolean {
    return !this.canvasIsDisplayed && this.receiveingDrawings;
  }

  private delay(ms: number): Promise<NodeJS.Timeout> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
  //#endregion whiteboard

  //#region media settings
  public async changeStateVideo(event: any): Promise<void> {
    this.mediaSettingsService.changeVideoDevice(event);
    this.currentUserStream.getVideoTracks()?.forEach((track) => track.stop());
    this.currentUserStream = await navigator.mediaDevices.getUserMedia(
      await this.mediaSettingsService.getMediaConstraints()
    );
    this.handleSuccessVideo(this.currentUserStream);
    document.querySelector('video').srcObject = this.currentUserStream;
    this.isAudioSettings = false;
    this.isVideoSettings = false;
  }

  public handleSuccessVideo(stream: MediaStream): void {
    const video = document.querySelector('video') as HTMLVideoElement;
    // video.srcObject = stream;
    const keys = Object.keys(this.peer.connections);
    const peerConnection = this.peer.connections[keys[0]];
    const videoTrack = stream.getVideoTracks()[0];
    peerConnection.forEach((pc) => {
      const sender = pc.peerConnection.getSenders().find((s) => {
        return s.track.kind === videoTrack.kind;
      });
      sender.replaceTrack(videoTrack);
    });
    this.currentUserStream.getVideoTracks().forEach((vt) => {
      this.currentUserStream.removeTrack(vt);
    });
    this.currentUserStream.addTrack(videoTrack);
  }

  public async changeInputDevice(deviceId: string): Promise<void> {
    this.mediaSettingsService.changeInputDevice(deviceId);
    this.currentUserStream = await navigator.mediaDevices.getUserMedia(
      await this.mediaSettingsService.getMediaConstraints()
    );
    this.handleSuccessAudio(this.currentUserStream);
    this.isAudioSettings = false;
    this.isVideoSettings = false;
  }

  private async handleSuccessAudio(stream): Promise<void> {
    const audio = document.querySelector('audio');
    audio.srcObject = stream;
    const keys = Object.keys(this.peer.connections);
    const peerConnection = this.peer.connections[keys[0]];
    const audioTrack = stream.getAudioTracks()[0];
    peerConnection.forEach((pc) => {
      const sender = pc.peerConnection.getSenders().find((s) => {
        return s.track.kind === audioTrack.kind;
      });
      sender.replaceTrack(audioTrack);
    });
  }

  public async changeOutputDevice(deviceId: string): Promise<void> {
    const audio = document.querySelector('audio');
    this.mediaSettingsService.changeOutputDevice(deviceId);
    this.mediaSettingsService.attachSinkId(audio, deviceId);
    this.isAudioSettings = false;
    this.isVideoSettings = false;
  }

  public showAudioSettings(): void {
    this.isAudioSettings = !this.isAudioSettings;
    this.isVideoSettings = false;
  }

  public showVideoSettings(): void {
    this.isAudioSettings = false;
    this.isVideoSettings = !this.isVideoSettings;
  }

  private setOutputDevice(): void {
    const videoElements = document.querySelectorAll('video');
    videoElements.forEach((elem) => {
      this.mediaSettingsService.attachSinkId(
        elem,
        this.mediaSettingsService.settings.OutputDeviceId
      );
    });
  }
  //#endregion media settings

  //#region Rooms
  public async openRoomsModal(): Promise<void> {
    const link = this.route.snapshot.params.link;

    this.roomService.getRoomsOfMeeting(this.meeting.id);

    this.simpleModalService
      .addModal(DivisionByRoomsModalComponent, {
        meetingId: this.meeting.id,
        meetingLink: link,
        onCanMoveIntoRoomEvent: this.onCanMoveIntoRoomEvent,
      })
      .toPromise()
      .then((isMove) => {
        this.isMoveToRoom = isMove;
        if (this.isMoveToRoom) {
          this.onCanMoveIntoRoomEvent.emit();
        }
      });
  }
  //#endregion Rooms

  //#region InviteUserModal
  public async openInviteUsersModal(): Promise<void> {
    this.isAddParticipantDisabled = true;
    this.getShortInviteLink().subscribe(
      async (shortId) => {
        const shortLink = this.buildShortLink(shortId);
        this.simpleModalService
          .addModal(MeetingInviteComponent, {
            inviteLink: shortLink,
            meetingId: this.meeting.id,
            senderId: this.currentParticipant.user.id,
            participants: this.meeting.participants,
          })
          .toPromise()
          .then((isShowParticipants) => {
            this.isShowParticipants = isShowParticipants;
          });
        this.isAddParticipantDisabled = false;
      },
      (error) => {
        console.error(error);
        this.isAddParticipantDisabled = false;
      }
    );
  }

  private buildShortLink(shortId: string): string {
    const URL: string = this.document.location.href;
    const chanks = URL.split('/');
    chanks.splice(3, chanks.length - 3);
    chanks.push('redirection');
    chanks.push(shortId);

    return chanks.join('/');
  }
  //#endregion

  //#region ShareScreen
  async shareScreen(): Promise<void> {
    this.lastTrack = this.currentUserStream.getVideoTracks()[0];
    const mediaDevices = (await navigator.mediaDevices) as any;
    const stream = await mediaDevices.getDisplayMedia();
    await this.handleSuccessVideo(stream);
    this.meetingSignalrService.invoke(SignalMethods.OnStartShareScreen, {
      streamId: this.currentUserStream.id,
      meetingId: this.meeting.id,
    });
    this.isSharing = true;
  }
  public fullPage(streamId): void {
    const stream = this.connectedStreams.find((x) => x.id === streamId);
    const fullVideo = this.createPage();
    fullVideo.srcObject = stream;
    fullVideo.play();
  }
  public createPage(): HTMLVideoElement {
    const parrent = document.getElementsByClassName('main-content')[0];
    const fullVideo = document.createElement('video');
    parrent.appendChild(fullVideo);
    fullVideo.className += 'fullVideo';
    fullVideo.style.width = '100vw';
    fullVideo.style.height = '100vh';
    fullVideo.style.objectFit = 'cover';
    fullVideo.style.position = 'fixed';
    return fullVideo;
  }
  async removeSharingVideo(): Promise<void> {
    const keys = Object.keys(this.peer.connections);
    const peerConnection = this.peer.connections[keys[0]];
    peerConnection.forEach((pc) => {
      const sender = pc.peerConnection.getSenders().find((s) => {
        return s.track.kind === this.lastTrack.kind;
      });
      sender.replaceTrack(this.lastTrack);
    });
    this.currentUserStream.getVideoTracks().forEach((vt) => {
      this.currentUserStream.removeTrack(vt);
    });
    this.currentUserStream.addTrack(this.lastTrack);
    this.meetingSignalrService.invoke(
      SignalMethods.OnStopShareScreen,
      this.meeting.id
    );
  }
  async stopShare(): Promise<void> {
    const fullVideo = document.querySelector('.fullVideo') as HTMLElement;
    fullVideo.remove();
    this.isSharing = false;
    this.toastr.info('Stop sharing screen');
  }
  //#endregion ShareScreen

  setMediaBitrate(sdp: string, media: string, bitrate: number): string {
    const lines = sdp.split('\n');
    let line = -1;
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].indexOf('m=' + media) === 0) {
        line = i;
        break;
      }
    }
    if (line === -1) {
      return sdp;
    }
    line++;
    while (lines[line].indexOf('i=') === 0 || lines[line].indexOf('c=') === 0) {
      line++;
    }
    if (lines[line].indexOf('b') === 0) {
      lines[line] = 'b=AS:' + bitrate;
      return lines.join('\n');
    }
    let newLines = lines.slice(0, line);
    newLines.push('b=AS:' + bitrate);
    newLines = newLines.concat(lines.slice(line, lines.length));
    return newLines.join('\n');
  }

  onReaction(event: ReactionsEnum): void {
    this.isShowReactions = false;
    this.meetingSignalrService.invoke(SignalMethods.OnReaction, {
      meetingId: this.meeting.id,
      userId: this.currentParticipant.id,
      reaction: event,
    } as Reaction);
  }
}
