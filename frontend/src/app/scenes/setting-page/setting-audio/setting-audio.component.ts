import { Component, OnInit, OnDestroy } from '@angular/core';
import { BrowserMediaDevice } from '../browser-media-device';
import * as DecibelMeter from 'decibel-meter';
import * as RecordRTC from 'recordrtc';
import { MediaSettingsService } from 'app/core/services/media-settings.service';
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
  public audio: HTMLMediaElement;
  public meter = new DecibelMeter('meter');
  public db: number;
  public volume = 50;
  public recordedChunks: [];
  public recorder;
  constructor(private mediaSettingsService: MediaSettingsService) {}
  ngOnDestroy(): void {
    this.constraints.audio = false;
  }

  ngOnInit(): void {
    this.browserMediaDevice
      .getAudioInputList()
      .then((res) => {
        this.inputDevices = res;
        if (!this.mediaSettingsService.settings.InputDeviceId) {
          this.mediaSettingsService.changeInputDevice(
            this.inputDevices[0]?.deviceId
          );
        }
        this.inputDeviceId = this.mediaSettingsService.settings.InputDeviceId;
      })
      .catch((error) => console.log(error));
    this.browserMediaDevice
      .getAudioOutputList()
      .then((res) => {
        this.outputDevices = res;
        if (!this.mediaSettingsService.settings.OutputDeviceId) {
          this.mediaSettingsService.changeOutputDevice(
            this.outputDevices[0]?.deviceId
          );
        }
        this.outputDeviceId = this.mediaSettingsService.settings.OutputDeviceId;
      })
      .catch((error) => console.log(error));
    this.audio = document.getElementById('audio') as HTMLMediaElement;

    if (navigator.userAgent.search(/Firefox/) > 0) {
      document.getElementById('outputDevice').style.display = 'none';
    }
  }
  // tslint:disable-next-line: typedef
  changeVolume(vol: number) {
    this.volume = vol;
  }

  async testMicro() {
    this.meter
      .connect(this.inputDevices.find((x) => x.deviceId === this.inputDeviceId))
      .catch((err) => alert('Connection Error'));
    this.meter.on('sample', (dB, percent, value) => (this.db = dB + 100));
    this.meter.listen();
    navigator.mediaDevices
      .getUserMedia({
        video: false,
        audio: {
          deviceId: this.inputDeviceId,
        },
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
    this.audio.volume = this.volume / 100;
    this.audio.play();
  }
  public async changeInputDevice(deviceId: string) {
    this.mediaSettingsService.changeInputDevice(deviceId);
    const stream = await navigator.mediaDevices.getUserMedia({
      video: false,
      audio: { deviceId: deviceId },
    });
    this.handleSuccess(stream);
  }

  public async changeOutputDevice(deviceId: string) {
    this.mediaSettingsService.changeOutputDevice(deviceId);
    this.mediaSettingsService.attachSinkId(this.audio, deviceId);
  }

  async handleSuccess(stream): Promise<void> {
    const audio = document.querySelector('audio');
    audio.srcObject = stream;
  }
}
