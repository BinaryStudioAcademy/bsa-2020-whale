import { Injectable } from '@angular/core';
import { MeetingSettings } from '../../shared/models';

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
  } as MeetingSettings;

  public getSettings(): MeetingSettings {
    return this.settings;
  }

  constructor() {
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
}
