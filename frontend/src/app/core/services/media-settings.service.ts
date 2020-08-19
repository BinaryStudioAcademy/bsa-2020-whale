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

  public changeVideoDevice(diviceId: string): void {
    this._settings.VideoDeviceId = diviceId;
    this.saveSettingsInLocalStorage();
  }

  public changeInputDevice(deviceId: string): void {
    this._settings.InputDeviceId = deviceId;
    this.saveSettingsInLocalStorage();
  }

  public changeOutputDevice(deviceId: string): void {
    this._settings.OutputDeviceId = deviceId;
    this.saveSettingsInLocalStorage();
  }

  private saveSettingsInLocalStorage(): void {
    window.localStorage.setItem(
      'media-settings',
      JSON.stringify(this._settings)
    );
  }

  public attachSinkId(element: any, sinkId: string): void {
    if (navigator.userAgent.search(/Firefox/) <= 0) {
      element
        .setSinkId(sinkId)
        .then(() => {
          console.log(`Success, audio output device attached: ${sinkId}`);
        })
        .catch((error) => {
          let errorMessage = error;
          if (error.name === 'SecurityError') {
            errorMessage = `You need to use HTTPS for selecting audio output device: ${error}`;
          }
          console.error(errorMessage);
        });
    }
  }

  public async getMediaConstraints(): Promise<MediaStreamConstraints> {
    return {
      video: {
        deviceId: this._settings.VideoDeviceId,
      },
      audio: {
        deviceId: this._settings.InputDeviceId,
      },
    };
  }
}
