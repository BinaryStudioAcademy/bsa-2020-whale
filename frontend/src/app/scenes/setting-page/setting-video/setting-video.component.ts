import { Component, OnInit, OnDestroy } from '@angular/core';
import { BrowserMediaDevice } from '../browser-media-device';

@Component({
  selector: 'app-setting-video',
  templateUrl: './setting-video.component.html',
  styleUrls: ['./setting-video.component.sass'],
})
export class SettingVideoComponent implements OnInit {
  public browserMediaDevice = new BrowserMediaDevice();
  public videoDevices: MediaDeviceInfo[];
  public deviceId: string;
  constructor() {}

  ngOnInit(): void {
    this.browserMediaDevice
      .getVideoInputList()
      .then((res) => {
        this.videoDevices = res;
        this.deviceId = this.videoDevices[0].deviceId;
        this.showVideo();
      })
      .catch((error) => console.log(error));
  }

  // tslint:disable-next-line: typedef
  public async showVideo() {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        deviceId: this.videoDevices[0].deviceId,
      },
      audio: false,
    });
    this.handleSuccess(stream);
  }
  // tslint:disable-next-line: typedef
  async handleSuccess(stream) {
    const video = document.querySelector('video');
    const videoTracks = stream.getVideoTracks();
    window.MSStream = stream;
    video.srcObject = stream;
  }

  public async changeState(event: any) {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        deviceId: event,
      },
      audio: false,
    });
    this.handleSuccess(stream);
  }
}
