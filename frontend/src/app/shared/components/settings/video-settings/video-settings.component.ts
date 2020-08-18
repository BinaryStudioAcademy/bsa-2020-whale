import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { BrowserMediaDevice } from '@shared/browser-media-device';
import { MediaSettingsService } from 'app/core/services/media-settings.service';

@Component({
  selector: 'app-video-settings',
  templateUrl: './video-settings.component.html',
  styleUrls: ['./video-settings.component.sass'],
})
export class VideoSettingsComponent implements OnInit {
  public browserMediaDevice = new BrowserMediaDevice();
  public videoDevices: MediaDeviceInfo[];
  @Input() videoDeviceId: string;
  @Output() onClick = new EventEmitter();
  constructor(private mediaService: MediaSettingsService) {}

  ngOnInit(): void {
    this.browserMediaDevice
      .getVideoInputList()
      .then((res) => (this.videoDevices = res));
  }
  isActive(event: MediaDeviceInfo) {
    return this.mediaService.settings.VideoDeviceId === event.deviceId;
  }
}
