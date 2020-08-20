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
import Peer from 'peerjs';
import { SignalRService } from 'app/core/services/signal-r.service';
import { environment } from '@env';
import { Subject, Observable, from } from 'rxjs';
import { ActivatedRoute, Router, Params } from '@angular/router';
import { MeetingService } from 'app/core/services/meeting.service';
import { takeUntil, filter } from 'rxjs/operators';
import { Meeting } from '@shared/models/meeting/meeting';
import {
  MeetingSignalrService,
  SignalMethods,
} from 'app/core/services/meeting-signalr.service';
import { ToastrService } from 'ngx-toastr';
import { DOCUMENT } from '@angular/common';
import { BlobService } from 'app/core/services/blob.service';
import { MeetingConnectionData } from '@shared/models/meeting/meeting-connect';

import { HttpService } from 'app/core/services/http.service';
import { PollService } from 'app/core/services/poll.service';
import { MeetingMessage } from '@shared/models/meeting/message/meeting-message';
import { MeetingMessageCreate } from '@shared/models/meeting/message/meeting-message-create';
import { Participant } from '@shared/models/participant/participant';
import { ParticipantRole } from '@shared/models/participant/participant-role';
import { Statistics } from '@shared/models/statistics/statistics';
import { AuthService } from 'app/core/auth/auth.service';
import { UserMediaData } from '@shared/models/media/user-media-data';
import { EnterModalComponent } from '../enter-modal/enter-modal.component';
import { SimpleModalService } from 'ngx-simple-modal';
import {
  CanvasWhiteboardOptions,
  CanvasWhiteboardService,
  CanvasWhiteboardUpdate,
} from 'ng2-canvas-whiteboard';
import { MediaSettingsService } from 'app/core/services/media-settings.service';
import { HttpClient, HttpParams } from '@angular/common/http';
import { GetMessages } from '@shared/models/meeting/message/get-messages';

@Component({
  selector: 'app-meeting',
  templateUrl: './meeting.component.html',
  styleUrls: ['./meeting.component.sass'],
})
export class MeetingComponent implements OnInit, AfterViewInit, OnDestroy {
  public meeting: Meeting;
  public otherParticipants: Participant[] = [];
  public meetingStatistics: Statistics;
  public isShowChat = false;
  public isShowParticipants = false;
  public isShowStatistics = false;
  public isScreenRecording = false;
  public isShowCurrentParticipantCard = true;
  public canLeave = true;

  @ViewChild('currentVideo') currentVideo: ElementRef;
  @ViewChild('mainArea', { static: false }) mainArea: ElementRef<HTMLElement>;

  public peer: Peer;
  public connectedStreams: MediaStream[] = [];
  public mediaData: UserMediaData[] = [];
  public connectedPeers = new Map<string, MediaStream>();
  public receiveingDrawings: boolean = false;
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
  private savedStrokes: CanvasWhiteboardUpdate[][] = new Array<
    CanvasWhiteboardUpdate[]
  >();

  public messages: MeetingMessage[] = [];
  public msgText = '';
  public msgReceiverEmail: string = '';
  public currentParticipant: Participant;
  public connectionData: MeetingConnectionData;
  private meetingSignalrService: MeetingSignalrService;
  public pollService: PollService;
  private unsubscribe$ = new Subject<void>();
  private currentUserStream: MediaStream;
  private currentStreamLoaded = new EventEmitter<void>();
  private contectedAt = new Date();
  private elem: any;
  public isMicrophoneMuted = false;
  public isCameraMuted = false;
  public isAudioSettings = false;
  public isVideoSettings = false;
  public isWaitingForRecord = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private meetingService: MeetingService,
    private toastr: ToastrService,
    private blobService: BlobService,
    private httpService: HttpService,
    @Inject(DOCUMENT) private document: any,
    private authService: AuthService,
    private simpleModalService: SimpleModalService,
    private canvasWhiteboardService: CanvasWhiteboardService,
    private mediaSettingsService: MediaSettingsService,
    private http: HttpClient,
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
              connectData.participant.user.email
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
          const changedStream = this.connectedStreams.find(
            (s) => s.id === mediaData.streamId
          );
          if (!changedStream) {
            return;
          }

          changedStream.getTracks().forEach((t) => {
            if (t.kind === 'video') {
              t.dispatchEvent(
                new Event(mediaData.isVideoActive ? 'enabled' : 'disabled')
              );
            } else {
              t.dispatchEvent(
                new Event(mediaData.isAudioActive ? 'enabled' : 'disabled')
              );
            }
          });
        },
        () => {
          this.toastr.error(
            'Error occured during participants media state updating'
          );
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
          if (erase) this.canvasWhiteboardService.clearCanvas();
        },
        () => {
          this.toastr.error('Error occured while trying to erase drawings');
        }
      );

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

    this.connectionData.participant = this.currentParticipant;
    this.meetingSignalrService.invoke(
      SignalMethods.OnParticipantLeft,
      this.connectionData
    );

    const ended: boolean =
      this.currentParticipant.role == ParticipantRole.Host ||
      this.meeting.participants.findIndex(
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

  public showChat(): void {
    this.isShowChat = !this.isShowChat;
  }

  public leave(): void {
    this.router.navigate(['/home']);
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
  }

  toggleMicrophone(): void {
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

  toggleCamera(): void {
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

  private getShortInviteLink(): Observable<string> {
    const URL: string = this.document.location.href;
    const chanks = URL.split('/');
    const meetingLink = chanks[chanks.length - 1];

    const baseUrl: string = environment.apiUrl;

    return this.http.get(`${baseUrl}/api/meeting/shortenLink/${meetingLink}`, {
      responseType: 'text',
    });
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

    // this.simpleModalService.addModal(CopyClipboardComponent, {
    //   message: this.document.location.href,
    // });
  }

  public sendMessage(): void {
    this.meetingSignalrService.invoke(SignalMethods.OnSendMessage, {
      authorEmail: this.authService.currentUser.email,
      meetingId: this.meeting.id,
      message: this.msgText,
      receiverEmail: this.msgReceiverEmail,
    } as MeetingMessageCreate);

    this.msgText = '';
  }

  public onEnterKeyPress(event: KeyboardEvent): void {
    event.preventDefault();
    if (this.msgText.length) {
      this.sendMessage();
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

  // card actions
  public hideViewEventHandler(mediaDataId): void {
    this.mediaData = this.mediaData.filter((d) => d.id != mediaDataId);
    this.isShowCurrentParticipantCard = false;
  }

  public createParticipantCard(
    participant: Participant,
    shouldPrepend = false
  ): void {
    const stream =
      participant.streamId === this.currentParticipant.streamId
        ? this.currentUserStream
        : this.connectedStreams.find((s) => s.id === participant.streamId);

    var newMediaData = {
      id: participant.id,
      userFirstName: participant.user.firstName,
      userLastName: participant.user.secondName,
      avatarUrl: participant.user.avatarUrl,
      isCurrentUser: participant.id === this.currentParticipant.id,
      isUserHost: participant.role == ParticipantRole.Host,
      stream: stream,
      isVideoEnabled:
        stream.id === this.currentUserStream.id
          ? this.currentUserStream.getVideoTracks().some((vt) => vt.enabled)
          : false,
      isAudioEnabled:
        stream.id === this.currentUserStream.id
          ? this.currentUserStream.getAudioTracks().some((at) => at.enabled)
          : true,
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
        this.createParticipantCard(participant);
        this.connectedPeers.set(call.peer, stream);
      }
    });
  }

  private destroyPeer() {
    this.peer?.disconnect();
    this.peer?.destroy();
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

  private invokeMediaStateChanged(receiverConnectionId = '') {
    this.meetingSignalrService.invoke(SignalMethods.OnMediaStateChanged, {
      streamId: this.currentUserStream.id,
      receiverConnectionId: receiverConnectionId,
      isVideoActive: !this.isCameraMuted,
      isAudioActive: !this.isMicrophoneMuted,
    });
  }

  onCanvasDraw(event) {
    const strokes = event as CanvasWhiteboardUpdate[];
    this.savedStrokes.push(strokes);
    this.meetingSignalrService.invoke(SignalMethods.OnDrawing, {
      meetingId: this.meeting.id.toString(),
      canvasEvent: strokes,
    });
  }

  onCanvasClear() {
    this.meetingSignalrService.invoke(SignalMethods.OnErasing, {
      meetingId: this.meeting.id.toString(),
      erase: true,
    });
    this.savedStrokes = new Array<CanvasWhiteboardUpdate[]>();
  }

  async showCanvas() {
    this.canvasIsDisplayed = !this.canvasIsDisplayed;
    this.receiveingDrawings = false;

    if (this.canvasIsDisplayed) {
      await this.delay(200);
      this.savedStrokes.forEach((strokes) =>
        this.canvasWhiteboardService.drawCanvas(strokes)
      );
    }
  }

  delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  checkDrawing() {
    return !this.canvasIsDisplayed && this.receiveingDrawings;
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

  public async changeStateVideo(event: any) {
    this.mediaSettingsService.changeVideoDevice(event);
    this.currentUserStream.getVideoTracks()?.forEach((track) => track.stop());
    this.currentUserStream = await navigator.mediaDevices.getUserMedia({
      video: { deviceId: event },
      audio: false,
    });
    this.handleSuccessVideo(this.currentUserStream);
    this.isAudioSettings = false;
    this.isVideoSettings = false;
  }

  async handleSuccessVideo(stream: MediaStream): Promise<void> {
    const video = document.querySelector('video');
    video.srcObject = stream;
    const keys = Object.keys(this.peer.connections);
    const peerConnection = this.peer.connections[keys[0]];
    const videoTrack = stream.getVideoTracks()[0];
    peerConnection.forEach((pc) => {
      const sender = pc.peerConnection.getSenders().find((s) => {
        return s.track.kind === videoTrack.kind;
      });
      sender.replaceTrack(videoTrack);
    });
  }

  public async changeInputDevice(deviceId: string) {
    this.mediaSettingsService.changeInputDevice(deviceId);
    this.currentUserStream = await navigator.mediaDevices.getUserMedia({
      video: false,
      audio: { deviceId: deviceId },
    });
    this.handleSuccess(this.currentUserStream);
    this.isAudioSettings = false;
    this.isVideoSettings = false;
  }

  public async changeOutputDevice(deviceId: string) {
    const audio = document.querySelector('audio');
    this.mediaSettingsService.changeOutputDevice(deviceId);
    this.mediaSettingsService.attachSinkId(audio, deviceId);
    this.isAudioSettings = false;
    this.isVideoSettings = false;
  }

  async handleSuccess(stream): Promise<void> {
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

  public showAudioSettings(): void {
    this.isVideoSettings = false;
    this.isAudioSettings = !this.isAudioSettings;
  }

  public showVideoSettings(): void {
    this.isAudioSettings = false;
    this.isVideoSettings = !this.isVideoSettings;
  }
}
