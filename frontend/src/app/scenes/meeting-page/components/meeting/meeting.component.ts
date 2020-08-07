import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import Peer from 'peerjs';
import { SignalRService } from 'app/core/services/signal-r.service';
import { environment } from '@env';
import { HubConnection } from '@aspnet/signalr';
import { Subject } from 'rxjs';
import { ActivatedRoute, Router, Params } from '@angular/router';
import { MeetingLink } from '@shared/models/meeting/meeting-link';
import { MeetingService } from 'app/core/services/meeting.service';
import { takeUntil } from 'rxjs/operators';
import { Meeting } from '@shared/models/meeting/meeting';

@Component({
  selector: 'app-meeting',
  templateUrl: './meeting.component.html',
  styleUrls: ['./meeting.component.sass']
})
export class MeetingComponent implements OnInit, AfterViewInit {
  public peer: Peer;
  @ViewChild('currentVideo') currentVideo: ElementRef;
  public connectedStreams: string[] = [];
  public recieverId: string;
  public signalHub: HubConnection;
  public meeting: Meeting;
  private unsubscribe$ = new Subject<void>();

  isShowChat = false;

  //users = ['user 1', 'user 2', 'user 3', 'user 4', 'user 5', 'user 6', 'user 7', 'user 8'];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private meetingService: MeetingService,
    private signalRService: SignalRService
  ) { }

  async ngOnInit() {
    this.route.params
      .subscribe(
        (params: Params) => {
          const link: string = params[`link`];
          this.getMeeting(link);
        }
      );

    // create new peer
    this.peer = new Peer(environment.peerOptions);

    // connect to signalR and on method "connect" write connectId into variable
    this.signalHub = await this.signalRService.registerHub(environment.meetingApiUrl, 'webrtcSignalHub');

    this.signalHub.on("onPeerConnectAsync", (connectId) => {
      if (connectId == this.peer.id) return;

      console.log("connectId: " + connectId);
      this.recieverId = connectId;
      this.connect();
    });

    // when peer opened send my peer id everyone
    this.peer.on('open', (id) => this.onPeerOpen(id));
  }

  ngAfterViewInit(): void {
    // when get call answer to it
    this.peer.on('call', call => {
      console.log("get call");

      var getUserMedia = navigator.getUserMedia;
      getUserMedia({ video: true, audio: true },
        stream => {
          // answer call
          call.answer(stream);

          // show current user from camera
          this.currentVideo.nativeElement.srcObject = stream;

          // show participant
          call.on('stream', stream => this.showMediaStream(stream));
        },
        err => console.log('error', err)
      );
    });
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  getMeeting(link: string): void {
    this.meetingService
      .connectMeeting(link)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(
        (resp) => {
          this.meeting = resp.body;
          this.signalRService.registerHub(environment.meetingApiUrl, 'chatHub')
            .then((hub) => {
              hub.on('JoinedGroup', (contextId: string) => console.log(contextId + ' joined meeting'));
              hub.invoke('JoinGroup', this.meeting.id)
                .catch(err => console.log(err.message));
            });
        },
        (error) => {
          console.log(error.message);
          this.router.navigate(['/profile-page']);
        }
      );
  }

  showChat(): void {
    this.isShowChat = !this.isShowChat;
  }

  private connect() {
    console.log("connect with: " + this.recieverId);

    var getUserMedia = navigator.getUserMedia;
    getUserMedia(
      { video: true, audio: true },
      stream => this.onCallGetMediaSuccess(stream),
      err => console.log('Failed to get local stream', err)
    );
  }

  leave() {

  }

  // send message to all subscribers that added new user
  private onPeerOpen(id: string) {
    console.log('My peer ID is: ' + id);
    this.signalHub.invoke("onPeerConnectAsync", id);
  }

  private onCallGetMediaSuccess(stream: MediaStream) {
    // show current user from camera
    this.currentVideo.nativeElement.srcObject = stream;

    let call = this.peer.call(this.recieverId, stream);

    // get answer and show other user
    call.on('stream', stream => this.showMediaStream(stream));
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
    return videoElement
  }
}
