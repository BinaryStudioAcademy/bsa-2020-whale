import { Injectable } from '@angular/core';
import { MediaSettings } from '../../shared/models/media/media-settings';

@Injectable({
  providedIn: 'root',
})
export class MediaSettingsService {
  private _settings = {
    VideoDeviceId: null,
    InputDeviceId: null,
    OutputDeviceId: null,
  } as MediaSettings;

  public get settings(): MediaSettings {
    return this._settings;
  }

  constructor() {
    const jsonString = window.localStorage.getItem('media-settings');
    if (jsonString) {
      this._settings = JSON.parse(jsonString);
    }
  }

  public ChangeVideoDevice(diviceId: string): void {
    this._settings.VideoDeviceId = diviceId;
    this.SaveSettingsInLocalStorage();
  }

  public ChangeInputDevice(deviceId: string): void {
    this._settings.InputDeviceId = deviceId;
    this.SaveSettingsInLocalStorage();
  }

  public ChangeOutputDevice(deviceId: string): void {
    this._settings.OutputDeviceId = deviceId;
    this.SaveSettingsInLocalStorage();
  }

  private SaveSettingsInLocalStorage(): void {
    window.localStorage.setItem(
      'media-settings',
      JSON.stringify(this._settings)
    );
  }
}
