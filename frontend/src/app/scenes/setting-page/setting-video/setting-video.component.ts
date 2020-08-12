import { Component, OnInit, OnDestroy } from '@angular/core';
import { BrowserMediaDevice } from '../browser-media-device';

@Component({
  selector: 'app-setting-video',
  templateUrl: './setting-video.component.html',
  styleUrls: ['./setting-video.component.sass'],
})
export class SettingVideoComponent implements OnInit, OnDestroy {
  public constraints = { video: true, audio: false };
  public browserMediaDevice = new BrowserMediaDevice();
  public videoDevices: MediaDeviceInfo[];
  public device: MediaDeviceInfo;
  constructor() {}
  ngOnDestroy(): void {
    this.constraints.video = false;
  }

  ngOnInit(): void {
    this.constraints.video = true;
    this.showVideo();
    this.browserMediaDevice
      .getVideoInputList()
      .then((res) => (this.videoDevices = res))
      .catch((error) => console.log(error));
  }

  // tslint:disable-next-line: typedef
  public async showVideo() {
    const stream = await navigator.mediaDevices.getUserMedia(this.constraints);
    this.handleSuccess(stream);
  }
  // tslint:disable-next-line: typedef
  async handleSuccess(stream) {
    const video = document.querySelector('video');
    const videoTracks = stream.getVideoTracks();
    window.MSStream = stream; // make variable available to browser console
    video.srcObject = stream;
  }
}
