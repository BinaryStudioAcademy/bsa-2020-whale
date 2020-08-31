import {
  Component,
  Input,
  OnInit,
  ViewChild,
  ElementRef,
  AfterViewInit,
} from '@angular/core';
import {
  MeetingService,
  MeetingSignalrService,
  SignalMethods,
  MeetingSettingsService,
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
export class SettingMeetingComponent implements OnInit, AfterViewInit {
  @Input() meeting: Meeting;
  public isWhiteboard: boolean;
  public isPoll: boolean;
  public isAudioDisabled: boolean;
  public isVideoDisabled: boolean;
  private unsubscribe$ = new Subject<void>();

  @ViewChild('audio') private checkboxIsAudioDisabled: ElementRef;
  @ViewChild('video') private checkboxIsVideoDisabled: ElementRef;
  @ViewChild('whiteboard') private checkboxWhiteboard: ElementRef;
  @ViewChild('poll') private checkboxPoll: ElementRef;

  constructor(
    private meetingSettingsService: MeetingSettingsService,
    private meetingSignalrService: MeetingSignalrService,
    private meetingService: MeetingService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.isWhiteboard = this.meetingSettingsService.settings.isWhiteboard;
    this.isPoll = this.meetingSettingsService.settings.isPoll;
    this.isAudioDisabled = this.meetingSettingsService.settings.isAudioDisabled;
    this.isVideoDisabled = this.meetingSettingsService.settings.isVideoDisabled;
  }

  ngAfterViewInit(): void {
    this.checkboxIsAudioDisabled.nativeElement.checked = this.isAudioDisabled;
    this.checkboxIsVideoDisabled.nativeElement.checked = this.isVideoDisabled;
    this.checkboxWhiteboard.nativeElement.checked = this.isWhiteboard;
    this.checkboxPoll.nativeElement.checked = this.isPoll;
  }

  public changeWhiteboard(event: any): void {
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

  public changePoll(event: any): void {
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

  public changeAudioPermission(event: any): void {
    this.isAudioDisabled = event.target.checked;

    if (this.meeting) {
      this.meeting.isAudioAllowed = !this.isAudioDisabled;
      this.switchOtherParticipantsMediaAsHost(false);
      return;
    }

    this.meetingSettingsService.changeIsAudioDisabled(this.isAudioDisabled);
  }

  public changeVideoPermission(event: any): void {
    this.isVideoDisabled = event.target.checked;

    if (this.meeting) {
      this.meeting.isVideoAllowed = !this.isVideoDisabled;
      this.switchOtherParticipantsMediaAsHost(true);
      return;
    }

    this.meetingSettingsService.changeIsVideoDisabled(this.isVideoDisabled);
  }

  public switchOtherParticipantsMediaAsHost(isVideo: boolean): void {
    this.meetingSignalrService.invoke(SignalMethods.OnMediaPermissionsChanged, {
      changedParticipantConnectionId: null,
      isVideoAllowed: isVideo
        ? this.meeting.isVideoAllowed
        : this.meeting.isVideoAllowed,
      isAudioAllowed: isVideo
        ? this.meeting.isAudioAllowed
        : this.meeting.isAudioAllowed,
    });

    isVideo
      ? (this.meeting.isVideoAllowed = !this.meeting.isVideoAllowed)
      : (this.meeting.isAudioAllowed = !this.meeting.isAudioAllowed);

    this.updateMeetingSettings();
  }

  public switchMeetingSettingAsHost(meeting: Meeting): void {
    this.meetingSignalrService.invoke(
      SignalMethods.OnHostChangeMeetingSetting,
      {
        isWhiteboard: meeting.isWhiteboard,
        isPoll: meeting.isPoll,
      }
    );

    this.updateMeetingSettings();
  }

  private updateMeetingSettings(): void {
    this.meetingService
      .updateMeetingSettings({
        meetingId: this.meeting.id,
        isWhiteboard: this.meeting.isWhiteboard,
        isPoll: this.meeting.isPoll,
        isAudioDisabled: this.isAudioDisabled,
        isVideoDisabled: this.isVideoDisabled,
      })
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(
        () => {},
        () => this.toastr.error("Meeting settings wasn't saved")
      );
  }
}
