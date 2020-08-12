import { Component, OnInit, OnDestroy } from '@angular/core';
import { BrowserMediaDevice } from '../browser-media-device';
import * as DecibelMeter from 'decibel-meter';
@Component({
  selector: 'app-setting-audio',
  templateUrl: './setting-audio.component.html',
  styleUrls: ['./setting-audio.component.sass'],
})
export class SettingAudioComponent implements OnInit, OnDestroy {
  public constraints = { video: false, audio: false };
  public browserMediaDevice = new BrowserMediaDevice();
  public inputDevices: MediaDeviceInfo[];
  public outputDevices: MediaDeviceInfo[];
  public inputDevice: MediaDeviceInfo;
  public outputDevice: MediaDeviceInfo;
  public audio;
  public meter = new DecibelMeter('meter');
  public db: number;
  public volume;
  constructor() {}
  ngOnDestroy(): void {
    this.meter.stopListening();
    this.meter.disconnect();
    this.constraints.audio = false;
  }

  ngOnInit(): void {
    this.browserMediaDevice
      .getAudioInputList()
      .then((res) => (this.inputDevices = res))
      .catch((error) => console.log(error));
    this.browserMediaDevice
      .getAudioOutputList()
      .then((res) => (this.outputDevices = res))
      .catch((error) => console.log(error));
    this.audio = document.getElementsByTagName('audio');
  }
  // tslint:disable-next-line: typedef
  changeVolume(vol: number) {
    this.audio.volume = this.volume;
  }
  // tslint:disable-next-line: typedef
  onChange() {
    if (this.inputDevice === undefined) {
      this.inputDevice = this.inputDevices[0];
    }
    console.log(this.outputDevice);
    this.meter
      .connect(this.inputDevice)
      .catch((err) => alert('Connection Error'));
    this.meter.on('sample', (dB, percent, value) => (this.db = dB + 100));
    console.log(this.db);
    this.meter.listen();
  }
}
