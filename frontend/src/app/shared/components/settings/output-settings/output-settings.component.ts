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
  @Output() onClick = new EventEmitter();

  constructor(private mediaService: MediaSettingsService) {}

  ngOnInit(): void {
    this.browserMediaDevice
      .getAudioOutputList()
      .then((res) => (this.outputAudioDevices = res));
  }
  isActive(event: MediaDeviceInfo) {
    return this.mediaService.settings.OutputDeviceId === event.deviceId;
  }
}
