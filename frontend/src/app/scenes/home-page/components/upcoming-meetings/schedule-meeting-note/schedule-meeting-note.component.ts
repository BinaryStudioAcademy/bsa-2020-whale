
import { Component, Input, OnInit, EventEmitter, OnDestroy } from '@angular/core';
import { ScheduledMeeting, CancelScheduled, Recurrence, User } from '@shared/models';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { UpstateService, MeetingService } from 'app/core/services';
import { SimpleModalService } from 'ngx-simple-modal';
import {
  MeetingInviteComponent,
  ScheduleMeetingInviteModalData,
} from '@shared/components/meeting-invite/meeting-invite.component';
import { MeetingUpdateParticipants } from '@shared/models/meeting/meeting-update-participants';
import { AuthService } from 'app/core/auth/auth.service';
import { HttpService } from 'app/core/services';
import { environment } from '@env';
import { ConfirmationModalComponent } from '@shared/components/confirmation-modal/confirmation-modal.component';

@Component({
  selector: 'app-schedule-meeting-note',
  templateUrl: './schedule-meeting-note.component.html',
  styleUrls: ['./schedule-meeting-note.component.sass']
})
export class ScheduleMeetingNoteComponent implements OnInit, OnDestroy {
  @Input() scheduled: ScheduledMeeting;
  public areParticipantsVisible = false;
  public cancelMeetingEvent = new EventEmitter<string>();
  public isCurrentUserHost = false;
  public isDisabled = true;
  public now: Date = new Date();
  public recurrence: string;
  public currentUser: User;
  isReccurentAvailable = false;
  isReccurentStopped = false;
  public route = environment.apiUrl + '/ScheduledMeeting';
  public isLoading = false;
  nowFuncId: any;

  constructor(
    public authService: AuthService,
    private httpService: HttpService,
    private simpleModalService: SimpleModalService,
    private toastr: ToastrService,
    private router: Router,
    private upstate: UpstateService,
    private meetingService: MeetingService,
  ) {
    this.nowFuncId = setInterval(() => {
      this.now = new Date();
      this.isDisabled = this.now < new Date(this.scheduled.meeting.startTime);
    }, 1000);
  }
  ngOnDestroy(): void {
    clearInterval(this.nowFuncId);
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
    this.isCurrentUserHost = this.authService.currentUser.email === this.scheduled.creator.email;
  }

  public cancelMeeting(): void {
    this.simpleModalService
    .addModal(ConfirmationModalComponent, {
      message: 'Are you sure you want to cancel the meeting?',
    })
    .subscribe((isConfirm) => {
      if (isConfirm) {
        this.isLoading = true;
        this.scheduled.canceled = true;
        this.httpService.putFullRequest<CancelScheduled, void>(`${this.route}/cancel`,
        { scheduledMeetingId: this.scheduled.id }).subscribe(
          () => this.isLoading = false,
          () => {
            this.toastr.error('Error during a meeting cancelation');
            this.scheduled.canceled = false;
            this.isLoading = false;
          }
        );
      }
    });

    return;
  }

  public join(): void {
    this.router.navigate([`/redirection/${this.scheduled.link}`]);
  }

  public copyLink(): void {
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
    if (this.scheduled.meeting.recurrence === Recurrence.Never){
      this.isReccurentStopped = false;
      this.isReccurentAvailable = false;
    }
    else if (this.currentUser.email !== this.scheduled.creator.email){
        this.isReccurentAvailable = false;
        this.isReccurentStopped = !(this.scheduled.meeting.isRecurrent);
      }
      else{
          this.isReccurentAvailable = this.scheduled.meeting.isRecurrent;
          this.isReccurentStopped = !( this.isReccurentAvailable);
      }
  }

  public stopRecurringMeeting(): void{
    this.meetingService.stopMeetingRecurring(this.scheduled.meeting.id).subscribe(
      () => {
        this.isReccurentStopped = true;
        this.isReccurentAvailable = false;
      }
    );
  }

  public addParticipants(): void {
    const alreadyInvited = this.scheduled.participants.map(p => p.email);

    this.simpleModalService
      .addModal(MeetingInviteComponent, {
        participantEmails: alreadyInvited,
        isScheduled: true,
      } as ScheduleMeetingInviteModalData)
      .subscribe((participantEmails) => {
        if ((participantEmails as string[]).length > 0) {
          this.meetingService
          .addParticipants({
            id: this.scheduled.id,
            participantsEmails: participantEmails,
            creatorEmail: this.scheduled.creator.email,
            startTime: this.scheduled.meeting.startTime
          } as MeetingUpdateParticipants)
          .subscribe(() => {
            this.httpService.getRequest<User[]>(`${this.route}/participants/${this.scheduled.id}`)
              .subscribe((resp) => {
                this.scheduled.participants = resp;
                this.toastr.success('Added');
              });
          });
        }
      });
  }
}
