import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { BrowserMediaDevice } from '@shared/browser-media-device';
import { MediaSettingsService } from 'app/core/services/media-settings.service';

@Component({
  selector: 'app-audio-settings',
  templateUrl: './audio-settings.component.html',
  styleUrls: ['./audio-settings.component.sass'],
})
export class AudioSettingsComponent implements OnInit {
  public browserMediaDevice = new BrowserMediaDevice();
  public inputAudioDevices: MediaDeviceInfo[];
  @Input() inputAudioDeviceId: string;
  @Output() onClick = new EventEmitter();

  constructor(private mediaService: MediaSettingsService) {}

  ngOnInit(): void {
    this.browserMediaDevice
      .getAudioInputList()
      .then((res) => (this.inputAudioDevices = res));
  }
  isActive(event: MediaDeviceInfo): boolean {
    return this.mediaService.settings.InputDeviceId === event.deviceId;
  }
}
