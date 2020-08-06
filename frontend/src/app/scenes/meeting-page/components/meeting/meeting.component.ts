import { Component, OnInit, OnDestroy } from '@angular/core';
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
export class MeetingComponent implements OnInit, OnDestroy {
  meeting: Meeting;
  isShowChat = false;

  users = ['user 1', 'user 2', 'user 3', 'user 4', 'user 5', 'user 6', 'user 7', 'user 8'];

  private unsubscribe$ = new Subject<void>();
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private meetingService: MeetingService
  ) { }
  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  ngOnInit(): void {
    this.route.params
      .subscribe(
        (params: Params) => {
          const id: string = params[`id`];
          const password: string = params[`pwd`];
          const link = {id, password} as MeetingLink;
          this.getMeeting(link);
        }
      );
  }

  getMeeting(link: MeetingLink): void{
    this.meetingService
      .connectMeeting(link)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(
        (resp) => {
          this.meeting = resp.body;
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
}
