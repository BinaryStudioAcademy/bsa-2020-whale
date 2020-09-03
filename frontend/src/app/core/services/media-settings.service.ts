import { Injectable } from '@angular/core';
import { MediaSettings } from '../../shared/models/media/media-settings';

@Injectable({
  providedIn: 'root',
})
export class MediaSettingsService {
  private settings = {
    VideoDeviceId: null,
    InputDeviceId: null,
    OutputDeviceId: null,
    IsMirrorVideo: false,
  } as MediaSettings;

  public getSettings(): MediaSettings {
    return this.settings;
  }

  constructor() {
    const jsonString = window.localStorage.getItem('media-settings');
    if (jsonString) {
      this.settings = JSON.parse(jsonString);
    }
  }

  public changeVideoDevice(diviceId: string): void {
    this.settings.VideoDeviceId = diviceId;
    this.saveSettingsInLocalStorage();
  }

  public changeInputDevice(deviceId: string): void {
    this.settings.InputDeviceId = deviceId;
    this.saveSettingsInLocalStorage();
  }

  public changeOutputDevice(deviceId: string): void {
    this.settings.OutputDeviceId = deviceId;
    this.saveSettingsInLocalStorage();
  }

  private saveSettingsInLocalStorage(): void {
    window.localStorage.setItem(
      'media-settings',
      JSON.stringify(this.settings)
    );
  }

  public attachSinkId(element: any, sinkId: string): void {
    if (navigator.userAgent.search(/Firefox/) <= 0) {
      element
        .setSinkId(sinkId)
        .then(() => {})
        .catch((error) => {
          let errorMessage = error;
          if (error.name === 'SecurityError') {
            errorMessage = `You need to use HTTPS for selecting audio output device: ${error}`;
          }
        });
    }
  }

  public async getMediaConstraints(): Promise<MediaStreamConstraints> {
    return {
      video: {
        deviceId: this.settings.VideoDeviceId,
      },
      audio: {
        deviceId: this.settings.InputDeviceId,
      },
    };
  }

  public getVideoConstraints(): MediaStreamConstraints {
    return {
      video: {
        deviceId: this.settings.VideoDeviceId,
      },
      audio: false
    };
  }

  public getAudioConstraints(): MediaStreamConstraints {
    return {
      video: false,
      audio: {
        deviceId: this.settings.InputDeviceId,
      }
    };
  }

  public changeMirror(isMirror: boolean): void {
    this.settings.IsMirrorVideo = isMirror;
    this.saveSettingsInLocalStorage();
  }
}
