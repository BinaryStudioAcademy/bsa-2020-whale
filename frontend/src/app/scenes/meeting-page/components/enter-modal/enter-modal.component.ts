import { Component, OnInit } from '@angular/core';
import { SimpleModalComponent } from 'ngx-simple-modal';

@Component({
  selector: 'app-enter-modal',
  templateUrl: './enter-modal.component.html',
  styleUrls: ['./enter-modal.component.sass'],
})
export class EnterModalComponent
  extends SimpleModalComponent<
    EnterMeetingModalInputData,
    EnterMeetingModalOutputData
  >
  implements OnInit, EnterMeetingModalInputData {
  public isCurrentParticipantHost: boolean;
  public isAllowedVideoOnStart: boolean;
  public isAllowedAudioOnStart: boolean;
  public message: string;
  public webcam: boolean;
  public microphone: boolean;
  public recognitionLanguage: string;
  private leave = false;

  constructor() {
    super();
  }
  public ngOnInit(): void {
    this.webcam = this.isCurrentParticipantHost
      ? true
      : this.isAllowedVideoOnStart;
    this.microphone = this.isCurrentParticipantHost
      ? true
      : this.isAllowedAudioOnStart;
    if (this.isCurrentParticipantHost) {
      switch (this.recognitionLanguage) {
        case 'ru':
          this.recognitionLanguage = 'Russian';
          break;
        case 'ua':
          this.recognitionLanguage = 'Ukrainian';
          break;
        default:
          this.recognitionLanguage = 'English';
      }
    }
  }

  public onProceed(): void {
    if (this.isCurrentParticipantHost) {
      switch (this.recognitionLanguage) {
        case 'Russian':
          this.recognitionLanguage = 'ru';
          break;
        case 'Ukrainian':
          this.recognitionLanguage = 'ua';
          break;
        default:
          this.recognitionLanguage = 'en-US';
      }
    }
    this.result = {
      microOff: !this.microphone,
      cameraOff: !this.webcam,
      leave: this.leave,
      isAllowedVideoOnStart: this.isAllowedVideoOnStart,
      isAllowedAudioOnStart: this.isAllowedAudioOnStart,
      recognitionLanguage: this.recognitionLanguage,
    };
    this.close();
  }

  public onLeave(): void {
    this.leave = true;
    this.onProceed();
  }
}

export interface EnterMeetingModalInputData {
  isCurrentParticipantHost: boolean;
  isAllowedVideoOnStart: boolean;
  isAllowedAudioOnStart: boolean;
  recognitionLanguage: string;
}

export interface EnterMeetingModalOutputData {
  microOff: boolean;
  cameraOff: boolean;
  leave: boolean;
  isAllowedVideoOnStart: boolean;
  isAllowedAudioOnStart: boolean;
  recognitionLanguage: string;
}
