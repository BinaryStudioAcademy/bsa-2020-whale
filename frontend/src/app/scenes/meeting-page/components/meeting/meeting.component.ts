import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  AfterViewInit,
  AfterContentInit,
  EventEmitter,
  OnDestroy,
  Inject,
} from '@angular/core';
import Peer from 'peerjs';
import { SignalRService } from 'app/core/services/signal-r.service';
import { environment } from '@env';
import { Subject } from 'rxjs';
import { ActivatedRoute, Router, Params } from '@angular/router';
import { MeetingService } from 'app/core/services/meeting.service';
import { takeUntil } from 'rxjs/operators';
import { Meeting } from '@shared/models/meeting/meeting';
import {
  MeetingSignalrService,
  SignalMethods,
} from 'app/core/services/meeting-signalr.service';
import { ToastrService } from 'ngx-toastr';
import { DOCUMENT } from '@angular/common';
import { BlobService } from 'app/core/services/blob.service';
import { MeetingConnectionData } from '@shared/models/meeting/meeting-connect';
import { MeetingMessage } from '@shared/models/meeting/message/meeting-message';
import { MeetingMessageCreate } from '@shared/models/meeting/message/meeting-message-create';
import { UserService } from 'app/core/services/user.service';
import {
  CanvasWhiteboardOptions,
  CanvasWhiteboardService,
  CanvasWhiteboardUpdate,
} from 'ng2-canvas-whiteboard';

@Component({
  selector: 'app-meeting',
  templateUrl: './meeting.component.html',
  styleUrls: ['./meeting.component.sass'],
})
export class MeetingComponent
  implements OnInit, AfterContentInit, AfterViewInit, OnDestroy {
  @ViewChild('currentVideo') currentVideo: ElementRef;

  private meetingSignalrService: MeetingSignalrService;

  public peer: Peer;
  public connectedStreams: string[] = [];
  public connectedPeers = new Map<string, MediaStream>();
  public meeting: Meeting;
  public isShowChat = false;
  public isShowParticipants = false;

  public canvasIsDisplayed: boolean;
  public canvasOptions: CanvasWhiteboardOptions = {
    clearButtonEnabled: true,
    clearButtonText: 'Erase',
    undoButtonText: 'Undo',
    undoButtonEnabled: false,
    colorPickerEnabled: false,
    saveDataButtonEnabled: true,
    saveDataButtonText: 'Save',
    lineWidth: 5,
    strokeColor: 'rgb(0,0,0)',
    shouldDownloadDrawing: true,
    drawingEnabled: true,
    showShapeSelector: false,
    shapeSelectorEnabled: false,
    showFillColorPicker: false,
    batchUpdateTimeoutDuration: 250,
    drawButtonEnabled: false,
  };

  public messages: MeetingMessage[] = [];
  public msgText = '';

  private unsubscribe$ = new Subject<void>();
  private currentUserStream: MediaStream;
  private connectionData: MeetingConnectionData;
  private currentStreamLoaded = new EventEmitter<void>();

  users = [
    'user 1',
    'user 2',
    'user 3',
    'user 4',
    'user 5',
    'user 6',
    'user 7',
    'user 8',
  ];

  @ViewChild('mainArea', { static: false }) mainArea: ElementRef;
  private elem: any;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private meetingService: MeetingService,
    private signalRService: SignalRService,
    private toastr: ToastrService,
    private blobService: BlobService,
    @Inject(DOCUMENT) private document: any,
    private userService: UserService,
    private canvasWhiteboardService: CanvasWhiteboardService
  ) {
    this.meetingSignalrService = new MeetingSignalrService(signalRService);
  }

  ngAfterViewInit(): void {
    this.elem = this.mainArea.nativeElement;
    this.canvasIsDisplayed = true;
  }

  ngAfterContentInit() {
    this.currentStreamLoaded.subscribe(
      () => (this.currentVideo.nativeElement.srcObject = this.currentUserStream)
    );
  }

  async ngOnInit() {
    this.canvasIsDisplayed = false;
    this.currentUserStream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
    this.currentStreamLoaded.emit();

    // create new peer
    this.peer = new Peer(environment.peerOptions);

    // when someone connected to meeting
    this.meetingSignalrService.signalUserConected$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(
        (connectData) => {
          if (connectData.peerId == this.peer.id) {
            return;
          }

          console.log('connected with peer: ' + connectData.peerId);
          this.connect(connectData.peerId);
          this.toastr.success('Connected successfuly');
        },
        (err) => {
          console.log(err.message);
          this.toastr.error('Error occured when connected to meeting');
          this.router.navigate(['/home']);
        }
      );

    // when someone disconnected from meeting
    this.meetingSignalrService.signalUserDisconected$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((connectionData) => {
        if (this.connectedPeers.has(connectionData.peerId)) {
          this.connectedPeers.delete(connectionData.peerId);
        }
      });

    this.meetingSignalrService.getMessages$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(
        (messages) => {
          this.messages = messages;
        },
        (err) => {
          this.toastr.error('Error occured when getting messages');
        }
      );

    this.meetingSignalrService.sendMessage$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(
        (message) => {
          this.messages.push(message);
        },
        (err) => {
          this.toastr.error('Error occured when sending message');
        }
      );
    // when peer opened send my peer id everyone
    this.peer.on('open', (id) => this.onPeerOpen(id));

    // when get call answer to it
    this.peer.on('call', (call) => {
      console.log('get call');

      // show caller
      call.on('stream', (stream) => {
        this.showMediaStream(stream);
        this.connectedPeers.set(call.peer, stream);
      });

      // send mediaStream to caller
      call.answer(this.currentUserStream);
    });

    this.meetingSignalrService.canvasDraw$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(
        (strokes) => {
          this.canvasWhiteboardService.drawCanvas(strokes);
        },
        (err) => {
          this.toastr.error('Error occured while trying to get drawings');
        }
      );

    this.meetingSignalrService.canvasErase$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(
        (erase) => {
          if (erase) this.canvasWhiteboardService.clearCanvas();
        },
        (err) => {
          this.toastr.error('Error occured while trying to erase drawings');
        }
      );
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();

    this.destroyPeer();

    this.currentUserStream.getTracks().forEach((track) => track.stop());
  }

  getMeeting(link: string): void {
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
          this.meetingSignalrService.invoke(
            SignalMethods.OnGetMessages,
            this.meeting.id
          );
        },
        (error) => {
          console.log(error.message);
          this.router.navigate(['/home']);
        }
      );
  }

  showChat(): void {
    this.isShowChat = !this.isShowChat;
  }

  // call to peer
  private connect(recieverPeerId: string) {
    const call = this.peer.call(recieverPeerId, this.currentUserStream);

    // get answer and show other user
    call.on('stream', (stream) => {
      this.showMediaStream(stream);
      this.connectedPeers.set(call.peer, stream);
    });
  }

  public leave() {
    this.ngOnDestroy();
    this.router.navigate(['/home']);
  }

  private destroyPeer() {
    this.meetingSignalrService.invoke(
      SignalMethods.OnUserDisconnect,
      this.connectionData
    );

    this.peer.disconnect();
    this.peer.destroy();
  }

  // send message to all subscribers that added new user
  private onPeerOpen(id: string) {
    console.log('My peer ID is: ' + id);
    this.route.params.subscribe((params: Params) => {
      const link: string = params[`link`];
      const urlParams = new URLSearchParams(link);
      const groupId = urlParams.get('id');
      const groupPwd = urlParams.get('pwd');

      this.connectionData = {
        peerId: id,
        userId: '',
        meetingId: groupId,
        meetingPwd: groupPwd,
      };
      this.getMeeting(link);
    });
  }

  // show mediaStream
  private showMediaStream(stream: MediaStream) {
    const participants = document.getElementById('participants');

    if (!this.connectedStreams.includes(stream.id)) {
      this.connectedStreams.push(stream.id);

      const videoElement = this.createVideoElement(stream);
      participants.appendChild(videoElement);
    }
  }

  // create html element to show video
  private createVideoElement(stream: MediaStream): HTMLElement {
    const videoElement = document.createElement('video');
    videoElement.srcObject = stream;
    videoElement.autoplay = true;
    return videoElement;
  }

  startRecording(): void {
    this.blobService.startRecording();

    this.meetingSignalrService.invoke(
      SignalMethods.OnConferenceStartRecording,
      'Conference start recording'
    );
  }

  stopRecording(): void {
    this.blobService.stopRecording();

    this.meetingSignalrService.invoke(
      SignalMethods.OnConferenceStopRecording,
      'Conference stop recording'
    );
  }

  sendMessage(): void {
    this.meetingSignalrService.invoke(SignalMethods.OnSendMessage, {
      authorEmail: this.userService.userEmail,
      meetingId: this.meeting.id,
      message: this.msgText,
    } as MeetingMessageCreate);
  }

  goFullscreen(): void {
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

  closeFullscreen(): void {
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

  onCanvasDraw(event) {
    this.meetingSignalrService.invoke(SignalMethods.OnDrawing, {
      meetingId: this.meeting.id,
      canvasEvent: event,
    });
  }

  onCanvasClear() {
    this.meetingSignalrService.invoke(SignalMethods.OnErasing, {
      meetingId: this.meeting.id,
      erase: true,
    });
  }

  showCanvas() {
    this.canvasIsDisplayed = this.canvasIsDisplayed ? false : true;
  }
}
