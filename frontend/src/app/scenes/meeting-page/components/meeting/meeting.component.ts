import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  AfterViewInit,
  EventEmitter,
  OnDestroy,
  Inject,
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
import { takeUntil, filter } from 'rxjs/operators';

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
} from 'app/core/services';
import {
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
} from '../../../../shared/models';
import { EnterModalComponent } from '../enter-modal/enter-modal.component';
import { MeetingInviteComponent } from '@shared/components/meeting-invite/meeting-invite.component';

@Component({
  selector: 'app-meeting',
  templateUrl: './meeting.component.html',
  styleUrls: ['./meeting.component.sass'],
})
export class MeetingComponent implements OnInit, AfterViewInit, OnDestroy {
  //#region fields
  public canvasIsDisplayed: boolean = false;
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
  public connectedPeers = new Map<string, MediaStream>();
  public connectedStreams: MediaStream[] = [];
  public connectionData: MeetingConnectionData;
  public currentParticipant: Participant;
  public isAudioSettings = false;
  public isCameraMuted = false;
  public isMicrophoneMuted = false;
  public isScreenRecording = false;
  public isShowChat = false;
  public isShowCurrentParticipantCard = true;
  public isShowParticipants = false;
  public isShowStatistics = false;
  public isVideoSettings = false;
  public isWaitingForRecord = false;
  public isAddParticipantDisabled = false;
  public mediaData: MediaData[] = [];
  public meeting: Meeting;
  public meetingStatistics: Statistics;
  public msgText = '';
  public msgReceiverEmail: string = '';
  public messages: MeetingMessage[] = [];
  public selectedMessages: MeetingMessage[] = [];
  public newMsgFrom: string[] = [];
  public isNewMsg = false;
  public otherParticipants: Participant[] = [];
  public pattern = new RegExp(/^\S+.*/);
  public peer: Peer;
  public pollService: PollService;
  public receiveingDrawings: boolean = false;
  public isSharing: boolean = false;
  @ViewChild('currentVideo') private currentVideo: ElementRef;
  @ViewChild('mainArea', { static: false }) private mainArea: ElementRef<
    HTMLElement
  >;
  private currentUserStream: MediaStream;
  private currentStreamLoaded = new EventEmitter<void>();
  private contectedAt = new Date();
  private elem: any;
  private meetingSignalrService: MeetingSignalrService;
  private savedStrokes: CanvasWhiteboardUpdate[][] = new Array<
    CanvasWhiteboardUpdate[]
  >();
  private unsubscribe$ = new Subject<void>();
  //#endregion fields

  constructor(
    @Inject(DOCUMENT) private document: any,
    private authService: AuthService,
    private blobService: BlobService,
    private canvasWhiteboardService: CanvasWhiteboardService,
    private http: HttpClient,
    private httpService: HttpService,
    private mediaSettingsService: MediaSettingsService,
    private meetingService: MeetingService,
    private route: ActivatedRoute,
    private router: Router,
    private simpleModalService: SimpleModalService,
    private toastr: ToastrService,
    signalRService: SignalRService
  ) {
    this.meetingSignalrService = new MeetingSignalrService(signalRService);
    this.pollService = new PollService(
      this.meetingSignalrService,
      this.httpService,
      this.toastr,
      this.unsubscribe$
    );
  }

  //#region hooks
  public async ngOnInit() {
    this.currentUserStream = await navigator.mediaDevices.getUserMedia(
      await this.mediaSettingsService.getMediaConstraints()
    );

    this.connectedStreams.push(this.currentUserStream);

    const enterModal = await this.simpleModalService
      .addModal(EnterModalComponent)
      .toPromise();
    if (enterModal.leave) {
      this.leaveUnConnected();
      return;
    }
    if (enterModal.cameraOff) {
      this.toggleCamera();
    }
    if (enterModal.microOff) {
      this.toggleMicrophone();
    }
    this.currentStreamLoaded.emit();

    // create new peer
    this.peer = new Peer(environment.peerOptions);

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
          console.log('i', index);
          if (index >= 0) {
            this.meeting.participants[index] = connectData.participant;
          } else {
            this.addParticipantToMeeting(connectData.participant);
          }

          console.log('connected with peer: ' + connectData.peerId);
          this.connect(connectData.peerId);
          this.toastr.success('Connected successfuly');
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
          this.currentParticipant = participants.find(
            (p) => p.user.email === this.authService.currentUser.email
          );
          this.otherParticipants = participants.filter(
            (p) => p.id !== this.currentParticipant.id
          );
          this.createParticipantCard(this.currentParticipant);
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

        const disconectedMediaDataIndex = this.mediaData.findIndex(
          (m) => m.stream.id == connectionData.participant.streamId
        );
        if (disconectedMediaDataIndex) {
          this.mediaData.splice(disconectedMediaDataIndex, 1);
          const secondName = ` ${
            connectionData.participant.user.secondName ?? ''
          }`;
          this.toastr.show(
            `${connectionData.participant.user.firstName}${secondName} has left`
          );
        }
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

        const disconectedMediaDataIndex = this.mediaData.findIndex(
          (m) => m.stream.id == participant.streamId
        );
        if (disconectedMediaDataIndex) {
          this.mediaData.splice(disconectedMediaDataIndex, 1);
          const secondName = ` ${participant.user.secondName ?? ''}`;
          this.toastr.show(
            `${participant.user.firstName}${secondName} disconnected`
          );
        }
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
          console.log(mediaData);
          this.updateCardDynamicData(
            mediaData.streamId,
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

    this.meetingSignalrService.switchOffMediaByHost$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(
        (isVideo) => {
          if (isVideo && !this.isCameraMuted) {
            this.toggleCamera();
            this.toastr.info('The host switchet off your camera');
          } else if (!isVideo && !this.isMicrophoneMuted) {
            this.toggleMicrophone();
            this.toastr.info('The host switchet off your microphone');
          }
        },
        (err) => {
          this.toastr.error(err.message);
        }
      );

    this.meetingSignalrService.meetingEnded$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(
        () => {
          this.toastr.show('Meeting ended');
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
          console.log(streamId);
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

    // when peer opened send my peer id everyone
    this.peer.on('open', (id) => this.onPeerOpen(id));

    // when get call answer to it
    this.peer.on('call', (call) => {
      console.log('get call');
      // show caller
      call.on('stream', (stream) => {
        if (!this.connectedStreams.includes(stream)) {
          this.connectedStreams.push(stream);
          console.log(call.peer, 'call peer');

          const participant = this.meeting.participants.find(
            (p) => p.streamId == stream.id
          );

          console.log('in peer create');
          this.createParticipantCard(participant);
        }
        this.connectedPeers.set(call.peer, stream);
      });

      // send mediaStream to caller
      call.answer(this.currentUserStream);
    });

    // show a warning dialog if close current tab or window
    window.onbeforeunload = function (ev: BeforeUnloadEvent) {
      ev.preventDefault();
      ev = ev || window.event;
      ev.returnValue = '';
      return '';
    };
  }

  public ngAfterViewInit(): void {
    this.elem = this.mainArea.nativeElement;
    console.log('elem', this.elem);
    console.log('currentVideo first', this.currentVideo);
    this.currentStreamLoaded.subscribe(() => {
      this.currentVideo.nativeElement.srcObject = this.currentUserStream;
      this.setOutputDevice();
    });
  }

  public ngOnDestroy(): void {
    this.destroyPeer();
    this.currentUserStream?.getTracks().forEach((track) => track.stop());

    if (this.connectionData) {
      this.connectionData.participant = this.currentParticipant;
      this.meetingSignalrService.invoke(
        SignalMethods.OnParticipantLeft,
        this.connectionData
      );
    }

    const ended: boolean =
      this.meeting?.participants?.findIndex(
        (p) => p.id != this.currentParticipant.id
      ) == -1;

    if (ended) {
      this.httpService
        .getRequest(
          environment.apiUrl + '/api/meeting/end',
          new HttpParams().set('meetingId', this.meeting.id)
        )
        .subscribe(
          () => {},
          (error) => console.error(error.Message)
        );

      this.pollService.savePollResults(this.meeting.id);
    }

    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  //#endregion hooks

  //#region options
  public toggleMicrophone(): void {
    this.isMicrophoneMuted
      ? this.currentUserStream.getAudioTracks().forEach((track) => {
          track.enabled = true;
        })
      : this.currentUserStream.getAudioTracks().forEach((track) => {
          track.enabled = false;
        });

    this.isMicrophoneMuted = !this.isMicrophoneMuted;
    this.invokeMediaStateChanged();
  }

  public toggleCamera(): void {
    this.isCameraMuted
      ? this.currentUserStream.getVideoTracks().forEach((track) => {
          track.enabled = true;
        })
      : this.currentUserStream.getVideoTracks().forEach((track) => {
          track.enabled = false;
        });

    this.isCameraMuted = !this.isCameraMuted;
    this.invokeMediaStateChanged();
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
    this.pollService.onPollIconClick();
  }

  public onStatisticsIconClick(): void {
    this.pollService.isShowPoll = false;
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

  public onCopyIconClick(): void {
    const URL: string = this.document.location.href;
    const chanks = URL.split('/');

    this.getShortInviteLink().subscribe((short) => {
      chanks[chanks.length - 1] = short;
      chanks[chanks.length - 2] = 'redirection';

      const copyBox = document.createElement('textarea');
      copyBox.style.position = 'fixed';
      copyBox.style.left = '0';
      copyBox.style.top = '0';
      copyBox.style.opacity = '0';
      copyBox.value = chanks.join('/');
      document.body.appendChild(copyBox);
      copyBox.focus();
      copyBox.select();
      document.execCommand('copy');
      document.body.removeChild(copyBox);
      this.toastr.success('Copied');
    });
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
    //this is made to remove eventListener for other routes
    window.onbeforeunload = function () {};

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
    }
  }

  private removeParticipantFromMeeting(participant: Participant): void {
    this.meeting.participants = this.meeting.participants.filter(
      (p) => p.id !== participant.id
    );
    this.otherParticipants = this.otherParticipants.filter(
      (p) => p.id !== participant.id
    );
    this.newMsgFrom = this.newMsgFrom.filter(
      (e) => e !== participant.user.email
    );
  }

  // call to peer
  private connect(recieverPeerId: string) {
    const call = this.peer.call(recieverPeerId, this.currentUserStream);

    // get answer and show other user
    call.on('stream', (stream) => {
      this.connectedStreams.push(stream);
      const connectedPeer = this.connectedPeers.get(call.peer);
      if (!connectedPeer || connectedPeer.id !== stream.id) {
        var participant = this.meeting.participants.find(
          (p) => p.streamId == stream.id
        );
        console.log('create on stream');
        this.createParticipantCard(participant);
        this.connectedPeers.set(call.peer, stream);
      }
    });
  }

  private getMeeting(link: string): void {
    console.log('get meeting');
    this.meetingService
      .connectMeeting(link)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(
        (resp) => {
          this.meeting = resp.body;
          console.log('meeting: ', this.meeting);
          this.connectionData.meetingId = this.meeting.id;
          this.meetingSignalrService.invoke(
            SignalMethods.OnUserConnect,
            this.connectionData
          );
          this.meetingSignalrService.invoke(SignalMethods.OnGetMessages, {
            meetingId: this.meeting.id,
            email: this.authService.currentUser.email,
          } as GetMessages);
        },
        (error) => {
          console.log(error.message);
          this.leaveUnConnected();
        }
      );
  }

  private leaveUnConnected(): void {
    this.currentUserStream.getTracks().forEach((track) => track.stop());
    this.destroyPeer();
    this.router.navigate(['/home']);
  }

  private invokeMediaStateChanged(receiverConnectionId = '') {
    this.meetingSignalrService.invoke(SignalMethods.OnMediaStateChanged, {
      streamId: this.currentUserStream.id,
      receiverConnectionId: receiverConnectionId,
      isVideoActive: !this.isCameraMuted,
      isAudioActive: !this.isMicrophoneMuted,
    });
  }
  //#endregion options

  //#region peers
  // send message to all subscribers that added new user
  private onPeerOpen(id: string) {
    console.log('My peer ID is: ' + id);
    this.route.params.subscribe((params: Params) => {
      const link: string = params[`link`];
      const urlParams = new URLSearchParams(link);
      const groupId = urlParams.get('id');
      const groupPwd = urlParams.get('pwd');

      this.authService.user$
        .pipe(filter((user) => Boolean(user)))
        .subscribe((user) => {
          this.connectionData = {
            peerId: id,
            userEmail: this.authService.currentUser.email,
            meetingId: groupId,
            meetingPwd: groupPwd,
            streamId: this.currentUserStream.id,
            participant: this.currentParticipant, // this.currentParticipant is undefined here
          };
          this.getMeeting(link);
        });
    });
  }

  private destroyPeer() {
    this.peer?.disconnect();
    this.peer?.destroy();
  }
  //#endregion peers

  //#region participant cards
  public createParticipantCard(
    participant: Participant,
    shouldPrepend = false
  ): void {
    console.log('created card', participant);
    const stream =
      participant.streamId === this.currentParticipant.streamId
        ? this.currentUserStream
        : this.connectedStreams.find((s) => s.id === participant.streamId);

    var newMediaData = {
      id: participant.id,
      isCurrentUser: participant.id === this.currentParticipant.id,
      stream: stream,
      dynamicData: new BehaviorSubject<ParticipantDynamicData>({
        isUserHost: participant.role == ParticipantRole.Host,
        userFirstName: participant.user.firstName,
        userSecondName: participant.user.secondName,
        avatarUrl: participant.user.avatarUrl,
        isVideoActive:
          stream.id === this.currentUserStream.id
            ? this.currentUserStream.getVideoTracks().some((vt) => vt.enabled)
            : false,
        isAudioActive:
          stream.id === this.currentUserStream.id
            ? this.currentUserStream.getAudioTracks().some((at) => at.enabled)
            : true,
      }),
    };

    shouldPrepend
      ? this.mediaData.unshift(newMediaData)
      : this.mediaData.push(newMediaData);

    if (stream.id !== this.currentUserStream.id) {
      this.meetingSignalrService.invoke(
        SignalMethods.OnMediaStateRequested,
        stream.id
      );
    }

    this.setOutputDevice();
  }

  public toggleOtherParticipantMediaAsHost(
    streamId: string,
    isVideo: boolean
  ): void {
    this.meetingSignalrService.invoke(SignalMethods.OnSwitchOffMediaByHost, {
      mutedStreamId: streamId,
      meetingId: this.meeting.id,
      isVideo: isVideo,
    });
  }

  public hideViewEventHandler(mediaDataId: string): void {
    this.mediaData = this.mediaData.filter((d) => d.id != mediaDataId);
    this.isShowCurrentParticipantCard = false;
  }

  private updateCardDynamicData(
    streamId: string,
    isAudioActive: boolean,
    isVideoActive: boolean
  ) {
    const participant =
      this.currentParticipant.streamId === streamId
        ? this.currentParticipant
        : this.meeting.participants.find((p) => p.streamId === streamId);
    const changedMediaData = this.mediaData.find(
      (s) => s.stream.id === streamId
    );

    if (!changedMediaData || !participant) {
      return;
    }

    changedMediaData.dynamicData.next({
      isUserHost: participant.role == ParticipantRole.Host,
      userFirstName: participant.user.firstName,
      userSecondName: participant.user.secondName,
      avatarUrl: participant.user.avatarUrl,
      isVideoActive: isVideoActive,
      isAudioActive: isAudioActive,
    });
  }
  //#endregion participant cards

  //#region chat
  public showChat(): void {
    this.isShowChat = !this.isShowChat;
    if (this.isShowChat) {
      this.receiverChanged();
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

  public splitMessage(message: string) {
    return message.split(/\n/gi);
  }
  //#endregion chat

  //#region whiteboard
  public onCanvasDraw(event) {
    const strokes = event as CanvasWhiteboardUpdate[];
    this.savedStrokes.push(strokes);
    this.meetingSignalrService.invoke(SignalMethods.OnDrawing, {
      meetingId: this.meeting.id.toString(),
      canvasEvent: strokes,
    });
  }

  public onCanvasClear() {
    this.meetingSignalrService.invoke(SignalMethods.OnErasing, {
      meetingId: this.meeting.id.toString(),
      erase: true,
    });
    this.savedStrokes = new Array<CanvasWhiteboardUpdate[]>();
  }

  public async showCanvas() {
    this.canvasIsDisplayed = !this.canvasIsDisplayed;
    this.receiveingDrawings = false;

    if (this.canvasIsDisplayed) {
      await this.delay(200);
      this.savedStrokes.forEach((strokes) =>
        this.canvasWhiteboardService.drawCanvas(strokes)
      );
    }
  }

  public checkDrawing() {
    return !this.canvasIsDisplayed && this.receiveingDrawings;
  }

  private delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
  //#endregion whiteboard

  //#region media settings
  public async changeStateVideo(event: any) {
    this.mediaSettingsService.changeVideoDevice(event);
    this.currentUserStream.getVideoTracks()?.forEach((track) => track.stop());
    this.currentUserStream = await navigator.mediaDevices.getUserMedia({
      video: { deviceId: event },
      audio: false,
    });
    this.handleSuccessVideo(this.currentUserStream);
    document.querySelector('video').srcObject = this.currentUserStream;
    this.isAudioSettings = false;
    this.isVideoSettings = false;
  }

  private async handleSuccessVideo(stream: MediaStream): Promise<void> {
    const videoTrack = stream.getVideoTracks()[0];
    const keys = Object.keys(this.peer.connections);
    const peerConnection = this.peer.connections[keys[0]];
    if (peerConnection !== undefined) {
      peerConnection.forEach((pc) => {
        const sender = pc.peerConnection.getSenders().find((s) => {
          return s.track.kind === videoTrack.kind;
        });
        sender.replaceTrack(videoTrack);
      });
    }
    this.currentUserStream.getVideoTracks().forEach((vt) => {
      this.currentUserStream.removeTrack(vt);
    });
    this.currentUserStream.addTrack(videoTrack);
  }

  public async changeInputDevice(deviceId: string) {
    this.mediaSettingsService.changeInputDevice(deviceId);
    const newAudioStream = await navigator.mediaDevices.getUserMedia({
      video: false,
      audio: { deviceId: deviceId },
    });
    this.handleSuccess(newAudioStream);
    this.isAudioSettings = false;
    this.isVideoSettings = false;
  }

  public async changeOutputDevice(deviceId: string) {
    const videos = document.querySelectorAll('video');
    console.log(videos);
    this.mediaSettingsService.changeOutputDevice(deviceId);
    videos.forEach((video) => {
      this.mediaSettingsService.attachSinkId(video, deviceId);
    });
    this.isAudioSettings = false;
    this.isVideoSettings = false;
  }

  private async handleSuccess(stream: MediaStream): Promise<void> {
    const audioTrack = stream.getAudioTracks()[0];
    const keys = Object.keys(this.peer.connections);
    const peerConnection = this.peer.connections[keys[0]];
    peerConnection.forEach((pc) => {
      const sender = pc.peerConnection.getSenders().find((s) => {
        return s.track.kind === audioTrack.kind;
      });
      sender.replaceTrack(audioTrack);
    });
    this.currentUserStream.getAudioTracks().forEach((at) => {
      this.currentUserStream.removeTrack(at);
    });
    this.currentUserStream.addTrack(audioTrack);
  }

  public showAudioSettings(): void {
    this.isVideoSettings = false;
    this.isAudioSettings = !this.isAudioSettings;
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
  public async openInviteUsersModal() {
    this.isAddParticipantDisabled = true;
    this.getShortInviteLink().subscribe(
      async (shortId) => {
        const shortLink = this.buildShortLink(shortId);
        this.simpleModalService
          .addModal(MeetingInviteComponent, {
            inviteLink: shortLink,
            meetingId: this.meeting.id,
            senderId: this.currentParticipant.user.id,
          })
          .toPromise()
          .then(() => {
            this.isShowParticipants = false;
          });
        this.isAddParticipantDisabled = false;
      },
      (error) => {
        console.error(error);
        this.isAddParticipantDisabled = false;
      }
    );
  }

  private buildShortLink(shortId: string) {
    const URL: string = this.document.location.href;
    let chanks = URL.split('/');
    chanks.splice(3, chanks.length - 3);
    chanks.push('redirection');
    chanks.push(shortId);

    return chanks.join('/');
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
  async shareScreen() {
    const mediaDevices = navigator.mediaDevices as any;
    let stream = await mediaDevices.getDisplayMedia();
    await this.handleSuccessVideo(stream);
    this.meetingSignalrService.invoke(SignalMethods.OnStartShareScreen, {
      streamId: this.currentUserStream.id,
      meetingId: this.meeting.id,
    });
    this.isSharing = true;
  }
  public fullPage(streamId) {
    const stream = this.connectedStreams.find((x) => x.id === streamId);
    console.log(stream.getVideoTracks());
    const fullVideo = document.createElement('video');
    const parrent = document.getElementsByClassName('main-content')[0];
    parrent.appendChild(fullVideo);
    fullVideo.className += 'fullVideo';
    fullVideo.style.width = '100vw';
    fullVideo.style.height = '100vh';
    fullVideo.style.objectFit = 'cover';
    fullVideo.style.position = 'fixed';
    fullVideo.srcObject = stream;
    fullVideo.play();
  }
  async removeSharingVideo() {
    this.meetingSignalrService.invoke(
      SignalMethods.OnStopShareScreen,
      this.meeting.id
    );
  }
  async stopShare() {
    let fullVideo = document.getElementsByClassName('fullVideo')[0];
    fullVideo.remove();
    this.currentUserStream = await navigator.mediaDevices.getUserMedia(
      await this.mediaSettingsService.getMediaConstraints()
    );
    this.handleSuccessVideo(this.currentUserStream);
    document.querySelector('video').srcObject = this.currentUserStream;
    this.isSharing = false;
    this.toastr.info('Stop sharing screen');
  }
}
