import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  AfterViewInit,
  AfterContentInit,
  EventEmitter,
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
import { BlobService } from 'app/core/services/blob.service';
import { MeetingConnectionData } from '@shared/models/meeting/meeting-connect';
import { PollData } from '@shared/models/poll/poll-data';
import { HttpService } from 'app/core/services/http.service';
import { PollCreateDto } from 'app/shared/models/poll/poll-create-dto';

@Component({
  selector: 'app-meeting',
  templateUrl: './meeting.component.html',
  styleUrls: ['./meeting.component.sass'],
})
export class MeetingComponent implements OnInit, AfterContentInit {
  meeting: Meeting;
  poll: PollDto;
  isShowChat = false;
  isShowParticipants = false;
  isPollCreating = false;
  isShowPoll = false;

  @ViewChild('currentVideo') currentVideo: ElementRef;

  private meetingSignalrService: MeetingSignalrService;

  public peer: Peer;
  public connectedStreams: string[] = [];
  public connectedPeers = new Map<string, MediaStream>();

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

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private meetingService: MeetingService,
    private signalRService: SignalRService,
    private toastr: ToastrService,
    private blobService: BlobService,
    private httpService: HttpService
  ) {
    this.meetingSignalrService = new MeetingSignalrService(signalRService);
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
          if (connectData.peerId == this.peer.id) return;

          console.log('connected with peer: ' + connectData.peerId);
          this.connect(connectData.peerId);
          this.toastr.success('Connected successfuly');
        },
        (err) => {
          console.log(err.message);
          this.toastr.error('Error occured when connected to meeting');
          this.router.navigate(['/profile-page']);
        }
      );

    // when someone disconnected from meeting
    this.meetingSignalrService.signalUserDisconected$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((connectionData) => {
        if (this.connectedPeers.has(connectionData.peerId))
          this.connectedPeers.delete(connectionData.peerId);
      });

    this.meetingSignalrService.pollReceived$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((poll: PollDto) => {
        this.poll = poll;
        this.isShowPoll = true;
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

    this.destroyPeer();

    this.currentUserStream.getTracks().forEach((track) => track.stop());
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
          this.meetingSignalrService.invoke(
            SignalMethods.OnUserConnect,
            this.connectionData
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
    let call = this.peer.call(recieverPeerId, this.currentUserStream);

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
      this.connectionData = { peerId: id, userId: '', groupId: link };
      this.getMeeting(link);
    });
  }

  // show mediaStream
  private showMediaStream(stream: MediaStream) {
    let participants = document.getElementById('participants');

    if (!this.connectedStreams.includes(stream.id)) {
      this.connectedStreams.push(stream.id);

      let videoElement = this.createVideoElement(stream);
      participants.appendChild(videoElement);
    }
  }

  // create html element to show video
  private createVideoElement(stream: MediaStream): HTMLElement {
    let videoElement = document.createElement('video');
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

  public onPollCreated(pollCreateDto: PollCreateDto) {
    this.httpService
      .postRequest<PollCreateDto, PollDto>(
        environment.meetingApiUrl + '/api/polls',
        pollCreateDto
      )
      .subscribe(
        (response: PollDto) => {
          const pollData: PollData = {
            userId: this.connectionData.userId,
            groupId: this.connectionData.groupId,
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
}
