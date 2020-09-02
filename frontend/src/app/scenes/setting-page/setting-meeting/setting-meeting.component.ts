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
import { Meeting, ChangedMediaPermissions } from '@shared/models';
import { Subject } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { UpdateSettings } from '@shared/models/meeting/update-settings';
import { AuthService } from 'app/core/auth/auth.service';

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
    private toastr: ToastrService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.isWhiteboard = this.meeting?.isWhiteboard || this.meetingSettingsService.getSettings().isWhiteboard;
    this.isPoll = this.meeting?.isPoll || this.meetingSettingsService.getSettings().isPoll;
    this.isAudioDisabled = !this.meeting?.isAudioAllowed || this.meetingSettingsService.getSettings().isAudioDisabled;
    this.isVideoDisabled = !this.meeting?.isVideoAllowed || this.meetingSettingsService.getSettings().isVideoDisabled;
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
      this.meetingSettingsService.switchMeetingSettingAsHost(this.meeting);
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
      this.meetingSettingsService.switchMeetingSettingAsHost(this.meeting);
      return;
    }
    this.meetingSettingsService.changePoll(this.isPoll);
  }

  public changeAudioPermission(event: any): void {
    this.isAudioDisabled = event.target.checked;

    if (this.meeting) {
      this.meeting.isAudioAllowed = !this.isAudioDisabled;
      this.switchOtherParticipantsMediaAsHost();
      return;
    }

    this.meetingSettingsService.changeIsAudioDisabled(this.isAudioDisabled);
  }

  public changeVideoPermission(event: any): void {
    this.isVideoDisabled = event.target.checked;

    if (this.meeting) {
      this.meeting.isVideoAllowed = !this.isVideoDisabled;
      this.switchOtherParticipantsMediaAsHost();
      return;
    }

    this.meetingSettingsService.changeIsVideoDisabled(this.isVideoDisabled);
  }

  public switchOtherParticipantsMediaAsHost(): void {
    this.meetingSignalrService.invoke(SignalMethods.OnMediaPermissionsChanged, {
      meetingId: this.meeting.id,
      changedParticipantConnectionId: null,
      isVideoAllowed: this.meeting.isVideoAllowed,
      isAudioAllowed: this.meeting.isAudioAllowed,
    } as ChangedMediaPermissions);
    this.meetingSettingsService.switchMeetingSettingAsHost(this.meeting);
  }
}
