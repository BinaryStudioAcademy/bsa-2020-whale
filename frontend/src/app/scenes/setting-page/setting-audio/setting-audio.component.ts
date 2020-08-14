import { Component, OnInit, OnDestroy } from '@angular/core';
import { BrowserMediaDevice } from '../browser-media-device';
import * as DecibelMeter from 'decibel-meter';
import * as RecordRTC from 'recordrtc';
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
  public volume = 50;
  public recordedChunks: [];
  public recorder;
  public audioContext = new AudioContext();
  gainN = this.audioContext.createGain();
  constructor() {}
  ngOnDestroy(): void {
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

    if (navigator.userAgent.search(/Firefox/) > 0) {
      document.getElementById('outputDevice').style.display = 'none';
    }
  }
  // tslint:disable-next-line: typedef
  changeVolume(vol: number) {
    this.volume = vol;
  }
  getLabelList(list: MediaDeviceInfo[]) {
    return list.map((x) => x.label.slice(0, 38) + '...');
  }
  // tslint:disable-next-line: typedef
  async testMicro() {
    if (this.inputDevice === undefined) {
      this.inputDevice = this.inputDevices[0];
    }
    this.meter
      .connect(this.inputDevice)
      .catch((err) => alert('Connection Error'));
    this.meter.on('sample', (dB, percent, value) => (this.db = dB + 100));
    this.meter.listen();
    navigator.mediaDevices
      .getUserMedia({
        audio: true,
      })
      .then(async (stream) => {
        this.recorder = RecordRTC(stream, {
          type: 'audio',
        });
        this.recorder.startRecording();
        await this.sleep(5000);
        await this.stopTest();
        await this.sleep(1000);
        await this.playTestAudio();
      });
  }
  async stopTest() {
    this.recorder.stopRecording();
    this.meter.stopListening();
    this.meter.disconnect();
  }
  async sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
  async playTestAudio() {
    this.recordedChunks = this.recorder.getBlob();
    const blob = new Blob([this.recorder.getBlob()], { type: 'audio/webm' });
    const blobURL = window.URL.createObjectURL(blob);
    this.audio = new Audio(blobURL);
    console.log(this.volume);
    this.audio.volume = this.volume / 100;
    this.audio.play();
  }
}
