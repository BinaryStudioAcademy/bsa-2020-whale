import { Injectable } from '@angular/core';
import { MeetingSettings } from '../../shared/models/meeting/MeetingSettings';

@Injectable({
  providedIn: 'root',
})
export class MeetingSettingsService {
  private _settings = {
    IsWhiteboard: false,
    IsPoll: false,
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
    this._settings.IsWhiteboard = IsWhiteboard;
    this.saveMeetingSettingsInLocalStorage();
  }

  public changePoll(IsPoll: boolean): void {
    this._settings.IsPoll = IsPoll;
    this.saveMeetingSettingsInLocalStorage();
  }
}
