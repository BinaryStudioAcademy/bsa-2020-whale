import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { BrowserMediaDevice } from '../../../shared/browser-media-device';
import { MediaSettingsService } from 'app/core/services/media-settings.service';

@Component({
  selector: 'app-setting-video',
  templateUrl: './setting-video.component.html',
  styleUrls: ['./setting-video.component.sass'],
})
export class SettingVideoComponent implements OnInit, OnDestroy {
  public browserMediaDevice = new BrowserMediaDevice();
  public videoDevices: MediaDeviceInfo[] = [null];
  public videoStream: MediaStream;
  public deviceId = '';
  public isMirror;
  public checkbox;
  constructor(public mediaSettingsService: MediaSettingsService) {}

  ngOnInit(): void {
    this.browserMediaDevice
      .getVideoInputList()
      .then((res) => {
        this.videoDevices = res;
        if (!this.mediaSettingsService.getSettings().VideoDeviceId) {
          this.mediaSettingsService.changeVideoDevice(
            this.videoDevices[0]?.deviceId
          );
        }
        this.deviceId = this.mediaSettingsService.getSettings().VideoDeviceId;
        this.isMirror = this.mediaSettingsService.getSettings().IsMirrorVideo;
        this.checkbox = document.getElementById('mirror') as any;
        this.checkbox.checked = this.isMirror;
        if (this.checkbox.checked) {
          document.querySelector('video').style.transform = 'scale(-1,1)';
        }
        this.showVideo();
      })
      .catch((error) => console.log(error));
  }

  ngOnDestroy(): void {
    this.videoStream?.getTracks().forEach((track) => track.stop());
  }

  // tslint:disable-next-line: typedef
  public async showVideo() {
    await navigator.mediaDevices
      .getUserMedia({
        video: {
          deviceId: this.mediaSettingsService.getSettings().VideoDeviceId,
        },
        audio: false,
      })
      .then((stream) => {
        this.videoStream = stream;
        this.handleSuccess(this.videoStream);
      });
  }

  async handleSuccess(stream): Promise<void> {
    const video = document.querySelector('video');
    video.srcObject = stream;
  }

  public async changeState(deviceId: string): Promise<void> {
    this.mediaSettingsService.changeVideoDevice(deviceId);
    this.ngOnDestroy();
    this.videoStream = await navigator.mediaDevices.getUserMedia({
      video: {
        deviceId,
      },
      audio: false,
    });
    this.handleSuccess(this.videoStream);
  }
  public changeMirror(event): void {
    if (event.target.checked) {
      this.isMirror = true;
      document.querySelector('video').style.transform = 'scale(-1,1)';
    } else {
      this.isMirror = false;
      document.querySelector('video').style.transform = 'scale(1,1)';
    }
    this.mediaSettingsService.changeMirror(this.isMirror);
  }
}
