import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, AfterContentInit, EventEmitter } from '@angular/core';
import Peer from 'peerjs';
import { SignalRService } from 'app/core/services/signal-r.service';
import { environment } from '@env';
import { Subject } from 'rxjs';
import { ActivatedRoute, Router, Params } from '@angular/router';
import { MeetingService } from 'app/core/services/meeting.service';
import { takeUntil } from 'rxjs/operators';
import { Meeting } from '@shared/models/meeting/meeting';
import { WebrtcSignalService, SignalMethods } from 'app/core/services/webrtc-signal.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-meeting',
  templateUrl: './meeting.component.html',
  styleUrls: ['./meeting.component.sass']
})
export class MeetingComponent implements OnInit, AfterContentInit {
  @ViewChild('currentVideo') currentVideo: ElementRef;

  private webrtcSignalService: WebrtcSignalService;

  public peer: Peer;
  public connectedStreams: string[] = [];
  public connectedPeers = new Map<string, MediaStream>();
  public meeting: Meeting;
  public isShowChat = false;

  private unsubscribe$ = new Subject<void>();
  private currentUserStream: MediaStream;
  private currentStreamLoaded = new EventEmitter<void>();

  //users = ['user 1', 'user 2', 'user 3', 'user 4', 'user 5', 'user 6', 'user 7', 'user 8'];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private meetingService: MeetingService,
    private signalRService: SignalRService,
    private toastr: ToastrService
  ) {
    this.webrtcSignalService = new WebrtcSignalService(signalRService);
  }

  ngAfterContentInit() {
    this.currentStreamLoaded.subscribe(() => this.currentVideo.nativeElement.srcObject = this.currentUserStream);
  }

  async ngOnInit() {
    this.route.params
      .subscribe(
        (params: Params) => {
          const link: string = params[`link`];
          this.getMeeting(link);
        }
      );

    this.currentUserStream /*= this.currentVideo.nativeElement.srcObject*/ = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    this.currentStreamLoaded.emit();

    // create new peer
    this.peer = new Peer(environment.peerOptions);

    // when someone connected to meeting
    this.webrtcSignalService.signalPeerConected$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(
        peerId => {
          if (peerId == this.peer.id) return;

          console.log("connectId: " + peerId);
          this.connect(peerId);
          this.toastr.success("Connected successfuly");
        },
        err => {
          console.log(err.message);
          this.toastr.error("Error occured when connected to meeting");
          this.router.navigate(['/profile-page']);
        }
      );

    // when someone disconnected from meeting
    this.webrtcSignalService.signalPeerDisconected$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(
        (peerId) => {
          if (this.connectedPeers.has(peerId))
            this.connectedPeers.delete(peerId);
        }
      );

    // when peer opened send my peer id everyone
    this.peer.on('open', (id) => this.onPeerOpen(id));


    // when get call answer to it
    this.peer.on('call', call => {
      console.log("get call");

      // show caller
      call.on('stream', stream => {
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

    this.currentUserStream.getTracks().forEach(track => track.stop());
    console.log("destroyed", this.currentUserStream);
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

  // call to peer
  private connect(recieverPeerId: string) {
    let call = this.peer.call(recieverPeerId, this.currentUserStream);

    // get answer and show other user
    call.on('stream', stream => {
      this.showMediaStream(stream);
      this.connectedPeers.set(call.peer, stream);
    });
  }

  public leave() {
    this.ngOnDestroy();
    this.router.navigate(['/home']);
  }

  private destroyPeer() {
    this.webrtcSignalService.invoke(SignalMethods.onPeerDisconnect, this.peer.id);

    this.peer.disconnect();
    this.peer.destroy();
  }

  // send message to all subscribers that added new user
  private onPeerOpen(id: string) {
    console.log('My peer ID is: ' + id);
    this.webrtcSignalService.invoke(SignalMethods.onPeerConnect, id);
    this.webrtcSignalService
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
