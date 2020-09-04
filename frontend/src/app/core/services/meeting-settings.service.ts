import { Injectable } from '@angular/core';
import { MeetingSettings, Meeting } from '../../shared/models';
import { MeetingSignalrService, SignalMethods } from './meeting-signalr.service';
import { AuthService } from '../auth/auth.service';
import { UpdateSettings } from '@shared/models/meeting/update-settings';
import { MeetingService } from './meeting.service';

@Injectable({
  providedIn: 'root',
})
export class MeetingSettingsService {
  private settings = {
    isWhiteboard: false,
    isPoll: false,
    isVideoDisabled: false,
    isAllowedToChooseRoom: false,
    isAudioDisabled: false,
    recognitionLanguage: '',
  } as MeetingSettings;

  public getSettings(): MeetingSettings {
    return this.settings;
  }

  constructor(
    private meetingSignalrService: MeetingSignalrService,
    private authService: AuthService,
    private meetingService: MeetingService) {
    const jsonString = window.localStorage.getItem('meeting-settings');
    if (jsonString) {
      this.settings = JSON.parse(jsonString);
    }
  }

  private saveMeetingSettingsInLocalStorage(): void {
    window.localStorage.setItem(
      'meeting-settings',
      JSON.stringify(this.settings)
    );
  }

  public changeWhiteboard(IsWhiteboard: boolean): void {
    this.settings.isWhiteboard = IsWhiteboard;
    this.saveMeetingSettingsInLocalStorage();
  }

  public changePoll(isPoll: boolean): void {
    this.settings.isPoll = isPoll;
    this.saveMeetingSettingsInLocalStorage();
  }

  public changeIsAudioDisabled(isAudioDisabled: boolean): void {
    this.settings.isAudioDisabled = isAudioDisabled;
    this.saveMeetingSettingsInLocalStorage();
  }

  public changeIsVideoDisabled(isVideoDisabled: boolean): void {
    this.settings.isVideoDisabled = isVideoDisabled;
    this.saveMeetingSettingsInLocalStorage();
  }

  public changeisAllowedToChooseRoom(isAllowedToChooseRoom: boolean): void {
    this.settings.isAllowedToChooseRoom = isAllowedToChooseRoom;
    this.saveMeetingSettingsInLocalStorage();
  }

  public switchMeetingSettingAsHost(meeting: Meeting): void {
    const updateSettingsEntity = {
      meetingId: meeting.id,
      applicantEmail: this.authService.currentUser.email,
      isWhiteboard: meeting.isWhiteboard,
      isPoll: meeting.isPoll,
      isAudioDisabled: !meeting.isAudioAllowed,
      isVideoDisabled: !meeting.isVideoAllowed,
      isAllowedToChooseRoom: meeting.isAllowedToChooseRoom,
    } as UpdateSettings;

    this.meetingSignalrService.invoke(
      SignalMethods.OnHostChangeMeetingSetting,
      updateSettingsEntity
    );

    this.meetingService
      .updateMeetingSettings(updateSettingsEntity).subscribe();
  }
}
