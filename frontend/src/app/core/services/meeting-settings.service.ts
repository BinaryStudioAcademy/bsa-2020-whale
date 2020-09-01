import { Injectable } from '@angular/core';
import { MeetingSettings } from '../../shared/models';

@Injectable({
  providedIn: 'root',
})
export class MeetingSettingsService {
  private _settings = {
    isWhiteboard: false,
    isPoll: false,
    isVideoDisabled: false,
    isAudioDisabled: false,
  } as MeetingSettings;

  public get settings(): MeetingSettings {
    return this._settings;
  }

  constructor() {
    const jsonString = window.localStorage.getItem('meeting-settings');
    if (jsonString) {
      this._settings = JSON.parse(jsonString);
    }
  }

  private saveMeetingSettingsInLocalStorage(): void {
    window.localStorage.setItem(
      'meeting-settings',
      JSON.stringify(this._settings)
    );
  }

  public changeWhiteboard(IsWhiteboard: boolean): void {
    this._settings.isWhiteboard = IsWhiteboard;
    this.saveMeetingSettingsInLocalStorage();
  }

  public changePoll(isPoll: boolean): void {
    this._settings.isPoll = isPoll;
    this.saveMeetingSettingsInLocalStorage();
  }

  public changeIsAudioDisabled(isAudioDisabled: boolean): void {
    this._settings.isAudioDisabled = isAudioDisabled;
    this.saveMeetingSettingsInLocalStorage();
  }

  public changeIsVideoDisabled(isVideoDisabled: boolean): void {
    this._settings.isVideoDisabled = isVideoDisabled;
    this.saveMeetingSettingsInLocalStorage();
  }
}
