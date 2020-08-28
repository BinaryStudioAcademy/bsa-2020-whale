import { Component, OnInit } from '@angular/core';
import { MeetingSettingsService } from '../../../core/services/meeting-settings.service';

@Component({
  selector: 'app-setting-meeting',
  templateUrl: './setting-meeting.component.html',
  styleUrls: ['./setting-meeting.component.sass'],
})
export class SettingMeetingComponent implements OnInit {
  public isWhiteboard;
  public isPoll;
  public checkboxWhiteboard;
  public checkboxPoll;

  constructor(private meetingSettingsService: MeetingSettingsService) {}

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
    this.meetingSettingsService.changeWhiteboard(this.isWhiteboard);
  }

  public changePoll(event): void {
    if (event.target.checked) {
      this.isPoll = true;
    } else {
      this.isPoll = false;
    }
    this.meetingSettingsService.changePoll(this.isPoll);
  }
}
