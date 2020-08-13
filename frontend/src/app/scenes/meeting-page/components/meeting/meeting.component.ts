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
import { PollDto } from '@shared/models/poll/poll-dto';
import {
  MeetingSignalrService,
  SignalMethods,
} from 'app/core/services/meeting-signalr.service';
import { ToastrService } from 'ngx-toastr';
import { DOCUMENT } from '@angular/common';
import { BlobService } from 'app/core/services/blob.service';
import { MeetingConnectionData } from '@shared/models/meeting/meeting-connect';

import { PollData } from '@shared/models/poll/poll-data';
import { HttpService } from 'app/core/services/http.service';
import { PollCreateDto } from 'app/shared/models/poll/poll-create-dto';
import { PollResultsDto } from '@shared/models/poll/poll-results-dto';
import { MeetingMessage } from '@shared/models/meeting/message/meeting-message';
import { MeetingMessageCreate } from '@shared/models/meeting/message/meeting-message-create';
import { Participant } from '@shared/models/participant/participant';
import { ParticipantRole } from '@shared/models/participant/participant-role';
import { Statistics } from '@shared/models/statistics/statistics';
import { AuthService } from 'app/core/auth/auth.service';

@Component({
  selector: 'app-meeting',
  templateUrl: './meeting.component.html',
  styleUrls: ['./meeting.component.sass'],
})
export class MeetingComponent
  implements OnInit, AfterContentInit, AfterViewInit, OnDestroy {
  meeting: Meeting;
  poll: PollDto;
  pollResults: PollResultsDto;
  meetingStatistics: Statistics;
  isShowChat = false;
  isShowParticipants = false;
  isPollCreating = false;
  isShowPoll = false;
  isShowPollResults = false;
  isShowStatistics = false;

  @ViewChild('currentVideo') currentVideo: ElementRef;

  private meetingSignalrService: MeetingSignalrService;

  public peer: Peer;
  public connectedStreams: string[] = [];
  public connectedPeers = new Map<string, MediaStream>();

  public messages: MeetingMessage[] = [];
  public msgText = '';
  public currentParticipant: Participant;

  private unsubscribe$ = new Subject<void>();
  private currentUserStream: MediaStream;
  private connectionData: MeetingConnectionData;
  private currentStreamLoaded = new EventEmitter<void>();
  private contectedAt = new Date();

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
    private httpService: HttpService,
    @Inject(DOCUMENT) private document: any,
    private authService: AuthService
  ) {
    this.meetingSignalrService = new MeetingSignalrService(signalRService);
  }

  ngAfterViewInit(): void {
    this.elem = this.mainArea.nativeElement;
  }

  ngAfterContentInit() {
    this.currentStreamLoaded.subscribe(
      () => (this.currentVideo.nativeElement.srcObject = this.currentUserStream)
    );
  }

  async ngOnInit() {
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
          this.meeting.participants.push(connectData.participant);
          if (connectData.peerId == this.peer.id) {
            return;
          }
          console.log('connected with peer: ' + connectData.peerId);
          this.connect(connectData.peerId);
          this.toastr.success('Connected successfuly');
        },
        (err) => {
          console.log(err.message);
          this.toastr.error(err.Message);
          this.leave();
        }
      );

    this.meetingSignalrService.participantConected$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(
        (participant) => {
          this.currentParticipant = participant;
        },
        (err) => {
          this.toastr.error(err.Message);
        }
      );

    // when someone disconnected from meeting
    this.meetingSignalrService.signalUserDisconected$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((connectionData) => {
        this.meeting.participants = this.meeting.participants.filter(
          (p) => p.id !== connectionData.participant.id
        );
        if (this.connectedPeers.has(connectionData.peerId)) {
          this.connectedPeers.delete(connectionData.peerId);
        }
      });

    this.meetingSignalrService.meetingEnded$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(
        (connectionData) => {
          this.toastr.show('Meeting ended');
          this.leave();
        },
        (err) => {
          this.toastr.error('Error occured when ending meeting');
        }
      );

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

    this.meetingSignalrService.pollReceived$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((poll: PollDto) => {
        this.poll = poll;
        this.isShowPoll = true;
      });

    this.meetingSignalrService.pollResultsReceived$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((pollResultsDto: PollResultsDto) => {
        console.log(pollResultsDto);
        this.handlePollResults(pollResultsDto);
      });

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
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  getMeeting(link: string): void {
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
          this.meetingSignalrService.invoke(
            SignalMethods.OnGetMessages,
            this.meeting.id
          );
        },
        (error) => {
          console.log(error.message);
          this.leaveUnConnected();
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

  leaveUnConnected(): void {
    this.currentUserStream.getTracks().forEach((track) => track.stop());
    this.destroyPeer();
    this.router.navigate(['/home']);
  }

  public leave(): void {
    let canLeave = true;
    if (this.currentParticipant?.role === ParticipantRole.Host) {
      canLeave = confirm('You will end current meeting!');
    }
    if (canLeave) {
      this.currentUserStream.getTracks().forEach((track) => track.stop());
      this.destroyPeer();
      this.meetingSignalrService.invoke(
        SignalMethods.OnUserDisconnect,
        this.connectionData
      );
      this.router.navigate(['/home']);
    }
  }

  private destroyPeer() {
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
        userEmail: this.authService.currentUser.email,
        meetingId: groupId,
        meetingPwd: groupPwd,
        participant: this.currentParticipant,
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

  onPollIconClick() {
    if (this.poll) {
      this.isShowPoll = !this.isShowPoll;
    } else if (this.pollResults || this.isShowPoll) {
      this.isShowPollResults = !this.isShowPollResults;
    } else {
      this.isPollCreating = !this.isPollCreating;
    }
  }

  public onPollCreated(pollCreateDto: PollCreateDto) {
    this.httpService
      .postRequest<PollCreateDto, PollDto>(
        environment.meetingApiUrl + '/api/polls',
        pollCreateDto
      )
      .subscribe(
        (response: PollDto) => {
          const pollData: PollData = {
            userId: this.connectionData.userEmail,
            groupId: this.connectionData.meetingId,
            pollDto: response,
          };

          this.meetingSignalrService.invoke(
            SignalMethods.OnPollCreated,
            pollData
          );

          this.isPollCreating = false;
          this.toastr.success('Poll was created!', 'Success');
        },
        (error) => {
          this.toastr.error(error);
        }
      );
  }

  public handlePollResults(pollResultsDto: PollResultsDto) {
    this.pollResults = pollResultsDto;
    if (this.isShowPoll) {
      console.log('if');
      return;
    }
    this.isShowPollResults = true;
  }

  onStatisticsIconClick(): void {
    if (!this.meetingStatistics) {
      if  (!this.meeting) {
        this.toastr.warning('Something went wrong. Try again later.');
        this.route.params.subscribe((params: Params) => {
          this.getMeeting(params[`link`]);
        });
      }
      this.meetingStatistics = {
        startTime: this.meeting.startTime,
        userJoinTime: this.contectedAt
      };
    }
    this.isShowStatistics = !this.isShowStatistics;
  }

  sendMessage(): void {
    this.meetingSignalrService.invoke(SignalMethods.OnSendMessage, {
      authorEmail: this.authService.currentUser.email,
      meetingId: this.meeting.id,
      message: this.msgText,
    } as MeetingMessageCreate);

    this.msgText = '';
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
}
