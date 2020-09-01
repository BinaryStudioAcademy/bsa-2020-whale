import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { BrowserMediaDevice } from '@shared/browser-media-device';
import { MediaSettingsService } from 'app/core/services/media-settings.service';

@Component({
  selector: 'app-output-settings',
  templateUrl: './output-settings.component.html',
  styleUrls: ['./output-settings.component.sass'],
})
export class OutputSettingsComponent implements OnInit {
  public browserMediaDevice = new BrowserMediaDevice();
  public outputAudioDevices: MediaDeviceInfo[];
  @Output() clickEmited = new EventEmitter();

  constructor(private mediaService: MediaSettingsService) {}

  ngOnInit(): void {
    this.browserMediaDevice
      .getAudioOutputList()
      .then((res) => (this.outputAudioDevices = res));
  }
  isActive(event: MediaDeviceInfo): boolean {
    return this.mediaService.getSettings().OutputDeviceId === event.deviceId;
  }
}
