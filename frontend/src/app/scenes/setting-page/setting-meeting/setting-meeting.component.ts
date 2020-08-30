import { Component, Input, OnInit } from '@angular/core';
import { MeetingSettingsService } from '../../../core/services/meeting-settings.service';
import {
  MeetingService,
  MeetingSignalrService,
  SignalMethods,
} from '../../../core/services';
import { takeUntil } from 'rxjs/operators';
import { Meeting } from '@shared/models';
import { Subject } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-setting-meeting',
  templateUrl: './setting-meeting.component.html',
  styleUrls: ['./setting-meeting.component.sass'],
})
export class SettingMeetingComponent implements OnInit {
  @Input() meeting: Meeting;
  public isWhiteboard;
  public isPoll;
  public checkboxWhiteboard;
  public checkboxPoll;
  private unsubscribe$ = new Subject<void>();

  constructor(
    private meetingSettingsService: MeetingSettingsService,
    private meetingSignalrService: MeetingSignalrService,
    private meetingService: MeetingService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.isWhiteboard = this.meetingSettingsService.settings.IsWhiteboard;
    this.isPoll = this.meetingSettingsService.settings.IsPoll;
    this.checkboxWhiteboard = document.getElementById('whiteboard') as any;
    this.checkboxPoll = document.getElementById('poll') as any;
    this.checkboxWhiteboard.checked = this.isWhiteboard;
    this.checkboxPoll.checked = this.isPoll;
  }

  public changeWhiteboard(event): void {
    if (event.target.checked) {
      this.isWhiteboard = true;
    } else {
      this.isWhiteboard = false;
    }
    if (this.meeting) {
      this.meeting.isWhiteboard = this.isWhiteboard;
      this.switchMeetingSettingAsHost(this.meeting);
      return;
    }
    this.meetingSettingsService.changeWhiteboard(this.isWhiteboard);
  }

  public changePoll(event): void {
    if (event.target.checked) {
      this.isPoll = true;
    } else {
      this.isPoll = false;
    }
    if (this.meeting) {
      this.meeting.isPoll = this.isPoll;
      this.switchMeetingSettingAsHost(this.meeting);
      return;
    }
    this.meetingSettingsService.changePoll(this.isPoll);
  }

  public switchMeetingSettingAsHost(meeting: Meeting): void {
    this.meetingSignalrService.invoke(
      SignalMethods.OnHostChangeMeetingSetting,
      {
        isWhiteboard: meeting.isWhiteboard,
        isPoll: meeting.isPoll,
      }
    );

    this.meetingService
      .updateMeetingSettings({
        meetingId: this.meeting.id,
        IsWhiteboard: this.meeting.isWhiteboard,
        IsPoll: this.meeting.isPoll,
      })
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(
        () => {},
        () => this.toastr.error("Meeting settings wasn't saved")
      );
  }
}
