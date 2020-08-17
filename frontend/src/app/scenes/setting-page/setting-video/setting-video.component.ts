import { Component, OnInit, OnDestroy } from '@angular/core';
import { BrowserMediaDevice } from '../browser-media-device';
import { MediaSettingsService } from 'app/core/services/media-settings.service';
import { FormGroup, FormControl } from '@angular/forms';

@Component({
  selector: 'app-setting-video',
  templateUrl: './setting-video.component.html',
  styleUrls: ['./setting-video.component.sass'],
})
export class SettingVideoComponent implements OnInit {
  public browserMediaDevice = new BrowserMediaDevice();
  public videoDevices: MediaDeviceInfo[] = [null];
  public deviceId: string = '';
  constructor(public mediaSettingsService: MediaSettingsService) {}

  ngOnInit(): void {
    console.log(this.mediaSettingsService.settings);
    this.browserMediaDevice
      .getVideoInputList()
      .then((res) => {
        this.videoDevices = res;
        if (!this.mediaSettingsService.settings.VideoDeviceId) {
          this.mediaSettingsService.ChangeVideoDevice(
            this.videoDevices[0]?.deviceId
          );
        }
        this.deviceId = this.mediaSettingsService.settings.VideoDeviceId;
        this.showVideo();
      })
      .catch((error) => console.log(error));
  }

  public async showVideo() {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        deviceId: this.mediaSettingsService.settings.VideoDeviceId,
      },
      audio: false,
    });
    this.handleSuccess(stream);
  }

  async handleSuccess(stream) {
    const video = document.querySelector('video');
    video.srcObject = stream;
  }

  public async changeState(deviceId: string) {
    this.mediaSettingsService.ChangeVideoDevice(deviceId);
    this.deviceId = deviceId;
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        deviceId: deviceId,
      },
      audio: false,
    });
    this.handleSuccess(stream);
  }
}
