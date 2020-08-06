import { Component, OnInit, OnDestroy } from '@angular/core';
import { MeetingService } from '../../../../core/services/meeting.service';
import { MeetingCreate } from '@shared/models/meeting/meeting-create';
import { MeetingLink } from '@shared/models/meeting/meeting-link';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile-page',
  templateUrl: './profile-page.component.html',
  styleUrls: ['./profile-page.component.sass']
})
export class ProfilePageComponent implements OnInit, OnDestroy {

  settingsMenuVisible = false;
  newMeeting: MeetingCreate = {} as MeetingCreate;
  meetingLink: MeetingLink;

  private unsubscribe$ = new Subject<void>();
  constructor(
    private meetingService: MeetingService,
    private router: Router
  ) { }
  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  ngOnInit(): void {
  }

  createMeeting(): void{
    this.meetingService
      .createMeeting({
        settings: '',
        startTime: new Date(),
        anonymousCount: 0,
        isScheduled: false,
        isRecurrent: false
      } as MeetingCreate)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(
        (resp) => {
          this.meetingLink = resp.body;
          this.router.navigate(['/meeting-page', this.meetingLink.id, this.meetingLink.password]);
        },
        (error) => (console.log(error.message))
      );
  }
}
