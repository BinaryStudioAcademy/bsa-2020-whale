import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { ActivatedRoute, Router, Params } from '@angular/router';
import { MeetingLink } from '@shared/models/meeting/meeting-link';
import { MeetingService } from 'app/core/services/meeting.service';
import { takeUntil } from 'rxjs/operators';
import { Meeting } from '@shared/models/meeting/meeting';
import { SignalRService } from 'app/core/services/signal-r.service';
import { environment } from 'environments/environment';
import { BlobService } from './../../../../core/services/blob.service';
import { PollDto } from '@shared/models/poll/poll-dto';

@Component({
  selector: 'app-meeting',
  templateUrl: './meeting.component.html',
  styleUrls: ['./meeting.component.sass']
})
export class MeetingComponent implements OnInit, OnDestroy {
  meeting: Meeting;
  poll: PollDto;
  isShowChat = false;
  isShowParticipants = false;
  isPollCreating = false;
  isShowPoll = false;

  users = ['user 1ssssssssssssssss', 'user 2', 'user 3', 'user 4', 'user 5', 'user 6', 'user 7', 'user 8', 'user 1ssssssssssssssss', 'user 2', 'user 3', 'user 4', 'user 5', 'user 6', 'user 7', 'user 8', 'user 1ssssssssssssssss', 'user 2', 'user 3', 'user 4', 'user 5', 'user 6', 'user 7', 'user 8', 'user 1ssssssssssssssss', 'user 2', 'user 3', 'user 4', 'user 5', 'user 6', 'user 7', 'user 8'];

  private unsubscribe$ = new Subject<void>();
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private meetingService: MeetingService,
    private signalRService: SignalRService,
    private blobService: BlobService
  ) { }
  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  ngOnInit(): void {
    this.route.params
      .subscribe(
        (params: Params) => {
          const link: string = params[`link`];
          this.getMeeting(link);
        }
      );
  }

  getMeeting(link: string): void{
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

          this.signalRService.registerHub(environment.meetingApiUrl, 'pollHub')
            .then((hub) => {
              hub.on('JoinedGroup', (contextId: string) => console.log(contextId + ' joined meeting'));
              hub.invoke('JoinGroup', this.meeting.id)
                 .catch(err => console.log(err.message));
              hub.on('Poll', (poll: PollDto) => {
                this.poll = poll;
                this.isShowPoll = true;
              });
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

  startRecording(): void {
    this.blobService.startRecording();
  }

  stopRecording(): void {
    this.blobService.stopRecording();
  }
}
