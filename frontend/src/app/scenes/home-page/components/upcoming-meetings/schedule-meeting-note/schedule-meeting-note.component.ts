import { Component, OnInit, Input } from '@angular/core';
import { ScheduledMeeting } from '@shared/models';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';

@Component({
  selector: 'app-schedule-meeting-note',
  templateUrl: './schedule-meeting-note.component.html',
  styleUrls: ['./schedule-meeting-note.component.sass']
})
export class ScheduleMeetingNoteComponent implements OnInit {
  @Input() scheduled: ScheduledMeeting;
  public isDisabled = true;
  public now: Date = new Date();

  public areParticipantsVisible = false;
  constructor(
    private toastr: ToastrService,
    private router: Router,
  ) {
    setInterval(() => {
      this.now = new Date();
      this.isDisabled = this.now < new Date(this.scheduled.meeting.startTime);
    }, 1000);
  }
  ngOnInit(): void {
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
}
