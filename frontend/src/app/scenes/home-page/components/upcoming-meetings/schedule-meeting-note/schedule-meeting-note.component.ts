import { Component, Input, OnInit, EventEmitter } from '@angular/core';
import { ScheduledMeeting, CancelScheduled } from '@shared/models';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { SimpleModalService } from 'ngx-simple-modal';
import {
  MeetingInviteComponent,
  ScheduleMeetingInviteModalData,
} from '@shared/components/meeting-invite/meeting-invite.component';
import { MeetingService } from 'app/core/services/meeting.service';
import { MeetingUpdateParticipants } from '@shared/models/meeting/meeting-update-participants';
import { AuthService } from 'app/core/auth/auth.service';
import { HttpService } from 'app/core/services';
import { environment } from '@env';
import { ConfirmationModalComponent } from '@shared/components/confirmation-modal/confirmation-modal.component';
import { SimpleModalService } from 'ngx-simple-modal';

@Component({
  selector: 'app-schedule-meeting-note',
  templateUrl: './schedule-meeting-note.component.html',
  styleUrls: ['./schedule-meeting-note.component.sass']
})
export class ScheduleMeetingNoteComponent implements OnInit{
  @Input() scheduled: ScheduledMeeting;
  public areParticipantsVisible = false;
  public cancelMeetingEvent = new EventEmitter<string>();
  public isCurrentUserHost = false;
  public isDisabled = true;
  public now: Date = new Date();
  public isLoading = false;

  private route = environment.apiUrl + '/scheduledMeeting';

  constructor(
    private authService: AuthService,
    private httpService: HttpService,
    private simpleModalService: SimpleModalService,
    private toastr: ToastrService,
    private router: Router,
    private simpleModalService: SimpleModalService,
    private meetingService: MeetingService,
    private authService: AuthService,
  ) {
    setInterval(() => {
      this.now = new Date();
      this.isDisabled = this.now < new Date(this.scheduled.meeting.startTime);
    }, 1000);
  }
  ngOnInit(): void {
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
            this.toastr.success('Added').onHidden.subscribe(() => location.reload());
          });
        }
      });
  }
}
