import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { BrowserMediaDevice } from '../browser-media-device';

@Component({
  selector: 'app-setting-video',
  templateUrl: './setting-video.component.html',
  styleUrls: ['./setting-video.component.sass'],
})
export class SettingVideoComponent implements OnInit, OnDestroy {
  public browserMediaDevice = new BrowserMediaDevice();
  public videoDevices: MediaDeviceInfo[];
  public videoStream: MediaStream;
  public deviceId: string;
  constructor() {}

  ngOnInit(): void {
    console.log('ngOnInitVideo');
    this.browserMediaDevice
      .getVideoInputList()
      .then((res) => {
        this.videoDevices = res;
        this.deviceId = this.videoDevices[0].deviceId;
        this.showVideo();
      })
      .catch((error) => console.log(error));
  }

  ngOnDestroy(): void {
    console.log('ngOnDestroy');
    this.videoStream?.getTracks().forEach((track) => track.stop());
  }

  // tslint:disable-next-line: typedef
  public async showVideo() {
    /*this.videoStream = */ await navigator.mediaDevices
      .getUserMedia({
        video: {
          deviceId: this.videoDevices[0].deviceId,
        },
        audio: false,
      })
      .then((stream) => {
        this.videoStream = stream;
        console.log(this.videoStream);
        this.handleSuccess(this.videoStream);
      });
    //this.handleSuccess(this.videoStream);
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
