import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import Peer from 'peerjs';
import { WebrtcSignalService } from 'app/core/services/webrtc-signal.service';
import { SignalRService } from 'app/core/services/signal-r.service';
import { environment } from '@env';

@Component({
  selector: 'app-meeting',
  templateUrl: './meeting.component.html',
  styleUrls: ['./meeting.component.sass']
})
export class MeetingComponent implements OnInit, AfterViewInit {
  public peer: any;
  @ViewChild('video') video: ElementRef;
  @ViewChild('currentVideo') currentVideo: ElementRef;
  public peerId: string;

  isShowChat = false;

  //users = ['user 1', 'user 2', 'user 3', 'user 4', 'user 5', 'user 6', 'user 7', 'user 8'];

  constructor(private hubService: SignalRService) { }
  ngAfterViewInit(): void {
    let video = this.video;
    let currentVideo = this.currentVideo;

    this.peer.on('call', function (call) {
      console.log("get call");

      var getUserMedia = navigator.getUserMedia;
      getUserMedia({ video: true, audio: true }, function (stream) {
        // answer call
        call.answer(stream);
        
        // show current user from camera
        currentVideo.nativeElement.srcObject = stream;

        // show participant
        call.on('stream', function (answerStream) {
          video.nativeElement.srcObject = answerStream;
        });
      }, err => {
        console.log('error', err);
      });
    });
  }

  ngOnInit(): void {
    // create new peer
    this.peer = new Peer({
      config: {
        iceServers: [
          { urls: 'stun:stun1.l.google.com:19302' },
          { urls: 'stun:stun2.l.google.com:19302' },
          {
            urls: 'turn:192.158.29.39:3478?transport=udp',
            credential: 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
            username: '28224511:1379330808'
          },
          {
            urls: 'turn:192.158.29.39:3478?transport=tcp',
            credential: 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
            username: '28224511:1379330808'
          }
        ]
      }
    });

    // connect to signalR and on method "connect" write connectId into variable
    let signalHub = this.hubService.registerHub(environment.meetingApiUrl, 'webrtcSignalHub');
    signalHub.on("connect", (connectId) => {
      if (connectId == this.peer.id) return;
      console.log("connectId: " + connectId);
      this.peerId = connectId;
    });

    // when peer opened send my peer id everyone
    this.peer.on('open', function (id) {
      console.log('My peer ID is: ' + id);
      signalHub.invoke("connect", id);
    });
  }

  showChat(): void {
    this.isShowChat = !this.isShowChat;
  }

  connect() {
    console.log("connect with: " + this.peerId);

    var conn = this.peer.connect(this.peerId);

    let peer = this.peer;
    let peerId = this.peerId;
    let video = this.video;
    let currentVideo = this.currentVideo;

    var getUserMedia = navigator.getUserMedia;
    getUserMedia({ video: true, audio: true }, function (stream) {
      // call
      var call = peer.call(peerId, stream);

      // when get answer show stream
      call.on('stream', function (answerStream) {
        video.nativeElement.srcObject = answerStream;
      });

      // show stream from camera of current user
      currentVideo.nativeElement.srcObject = stream;
    }, err => {
      console.log('Failed to get local stream', err);
    });
  }

  leave() {

  }
}
