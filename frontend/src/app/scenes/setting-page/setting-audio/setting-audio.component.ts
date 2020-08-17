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
  public inputDeviceId: string;
  public outputDeviceId: string;
  public audio;
  public meter = new DecibelMeter('meter');
  public db: number;
  public volume = 50;
  public recordedChunks: [];
  public recorder;

  public audioStream: MediaStream;

  constructor() {}
  ngOnDestroy(): void {
    this.constraints.audio = false;
    this.audioStream?.getTracks().forEach((track) => track.stop());
  }

  ngOnInit(): void {
    this.browserMediaDevice
      .getAudioInputList()
      .then((res) => {
        this.inputDevices = res;
        this.inputDeviceId = this.inputDevices[0].deviceId;
      })
      .catch((error) => console.log(error));
    this.browserMediaDevice
      .getAudioOutputList()
      .then((res) => {
        this.outputDevices = res;
        this.outputDeviceId = this.outputDevices[0].deviceId;
      })
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
  async testMicro() {
    console.log(this.inputDeviceId);
    this.meter
      .connect(this.inputDevices.find((x) => x.deviceId === this.inputDeviceId))
      .catch((err) => alert('Connection Error'));
    this.meter.on('sample', (dB, percent, value) => (this.db = dB + 100));
    this.meter.listen();
    navigator.mediaDevices
      .getUserMedia({
        audio: true,
      })
      .then(async (stream) => {
        this.audioStream = stream;

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
    this.audio.volume = this.volume / 100;
    this.audio.play();
  }
  public async changeState(event: any) {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: false,
      audio: { deviceId: event.label },
    });
    this.handleSuccess(stream);
  }
  async handleSuccess(stream): Promise<void> {
    const audio = document.querySelector('audio');
    window.MSStream = stream;
    audio.srcObject = stream;
  }
}
