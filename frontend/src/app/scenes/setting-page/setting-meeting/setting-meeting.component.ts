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
  public isAllowedToChooseRoom: boolean;
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
    this.isWhiteboard = this.meetingSettingsService.getSettings().isWhiteboard;
    this.isPoll = this.meetingSettingsService.getSettings().isPoll;
    this.isAllowedToChooseRoom = this.meetingSettingsService.getSettings().isAllowedToChooseRoom;
    this.isAudioDisabled = !this.meeting.isAudioAllowed;
    this.isVideoDisabled = !this.meeting.isVideoAllowed;
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

  public switchIsAllowedToChooseRoom(event: any): void {
    this.isAllowedToChooseRoom = event.target.checked;

    if (this.meeting) {
      this.meeting.isAllowedToChooseRoom = this.isAllowedToChooseRoom;
      this.switchMeetingSettingAsHost(this.meeting);
      return;
    }

    this.meetingSettingsService.changeisAllowedToChooseRoom(
      this.isAllowedToChooseRoom
    );
  }

  public switchOtherParticipantsMediaAsHost(): void {
    this.meetingSignalrService.invoke(SignalMethods.OnMediaPermissionsChanged, {
      changedParticipantConnectionId: null,
      isVideoAllowed: this.meeting.isVideoAllowed,
      isAudioAllowed: this.meeting.isAudioAllowed,
    });
    this.updateMeetingSettings();
  }

  public switchMeetingSettingAsHost(meeting: Meeting): void {
    this.meetingSignalrService.invoke(
      SignalMethods.OnHostChangeMeetingSetting,
      {
        meetingId: this.meeting.id,
        applicantEmail: this.authService.currentUser.email,
        isWhiteboard: this.meeting.isWhiteboard,
        isPoll: this.meeting.isPoll,
        isAudioDisabled: this.isAudioDisabled,
        isVideoDisabled: this.isVideoDisabled,
        isAllowedToChooseRoom: this.isAllowedToChooseRoom,
      } as UpdateSettings
    );

    this.updateMeetingSettings();
  }

  private updateMeetingSettings(): void {
    this.meetingService
      .updateMeetingSettings({
        meetingId: this.meeting.id,
        applicantEmail: this.authService.currentUser.email,
        isWhiteboard: this.meeting.isWhiteboard,
        isPoll: this.meeting.isPoll,
        isAudioDisabled: this.isAudioDisabled,
        isVideoDisabled: this.isVideoDisabled,
        isAllowedToChooseRoom: this.isAllowedToChooseRoom,
      })
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(
        () => {},
        () => this.toastr.error('Meeting settings wasn\'t saved')
      );
  }
}
