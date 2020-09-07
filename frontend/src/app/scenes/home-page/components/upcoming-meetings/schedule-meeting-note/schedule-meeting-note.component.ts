import { Component, OnInit, Input } from '@angular/core';
import { ScheduledMeeting, Recurrence, User } from '@shared/models';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { UpstateService, MeetingService } from 'app/core/services';
import { environment } from '@env';

@Component({
  selector: 'app-schedule-meeting-note',
  templateUrl: './schedule-meeting-note.component.html',
  styleUrls: ['./schedule-meeting-note.component.sass']
})
export class ScheduleMeetingNoteComponent implements OnInit {
  @Input() scheduled: ScheduledMeeting;
  public isDisabled = true;
  public now: Date = new Date();
  public recurrence: string;
  public currentUser: User;
  isReccurentAvailable = false;
  isReccurentStopped = false;
  public route = environment.apiUrl + '/ScheduledMeeting';

  public areParticipantsVisible = false;
  constructor(
    private toastr: ToastrService,
    private router: Router,
    private upstate: UpstateService,
    private meetingService: MeetingService,
  ) {
    setInterval(() => {
      this.now = new Date();
      this.isDisabled = this.now < new Date(this.scheduled.meeting.startTime);
    }, 1000);
  }
  ngOnInit(): void {
    switch (this.scheduled.meeting.recurrence) {
      case Recurrence.EveryDay:
        this.recurrence = 'Every day';
        break;
      case Recurrence.EveryWeek:
        this.recurrence = 'Every week';
        break;
      case Recurrence.EveryMonth:
        this.recurrence = 'Every month';
        break;
      default:
        this.recurrence = 'Never';
    }

    this.upstate.getLoggedInUser().subscribe((userFromDB: User) => {
      this.currentUser = userFromDB;
      this.isReccuringAvailable();
    });
  }

  join(): void {
    this.router.navigate([`/redirection/${this.scheduled.link}`]);
  }

  copyLink(): void {
    const URL: string = document.location.href;
    const chanks = URL.split('/');
    chanks[chanks.length - 1] = 'redirection';
    chanks[chanks.length] = this.scheduled.link;
    this.createTextareaAndCopy(chanks.join('/'));
  }


  private createTextareaAndCopy(value: string): void {
    const copyBox = document.createElement('textarea');
    copyBox.style.position = 'fixed';
    copyBox.style.left = '0';
    copyBox.style.top = '0';
    copyBox.style.opacity = '0';
    copyBox.value = value;
    document.body.appendChild(copyBox);
    copyBox.focus();
    copyBox.select();
    document.execCommand('copy');
    document.body.removeChild(copyBox);
    this.toastr.success('Copied');
  }

  private isReccuringAvailable(): void{
    this.isReccurentAvailable = this.scheduled.meeting.recurrence !== Recurrence.Never
      && this.currentUser.email === this.scheduled.creator.email;
  }

  private stopRecurringMeeting(): void{
    this.meetingService.stopMeetingRecurring(this.scheduled.id).subscribe(
      () => {
        this.isReccurentStopped = true;
        this.isReccurentAvailable = false;
      }
    );
  }
}
