import { Component, OnInit } from '@angular/core';
import { SimpleModalComponent } from 'ngx-simple-modal';
import { MeetingSettingsService } from 'app/core/services';

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

  constructor(private meetingSettingService: MeetingSettingsService) {
    super();
  }
  public ngOnInit(): void {
    this.webcam = this.isCurrentParticipantHost
      ? true
      : this.isAllowedVideoOnStart;
    this.microphone = this.isCurrentParticipantHost
      ? true
      : this.isAllowedAudioOnStart;
    if (this.isCurrentParticipantHost){
      this.isAllowedVideoOnStart = !this.meetingSettingService.getSettings().isVideoDisabled;
      this.isAllowedAudioOnStart = !this.meetingSettingService.getSettings().isAudioDisabled;
      switch (this.recognitionLanguage) {
        case 'ru':
          this.recognitionLanguage = 'Russian';
          break;
        case 'uk':
          this.recognitionLanguage = 'Ukrainian';
          break;
        default:
          this.recognitionLanguage = 'English';
      }
    }
  }

  public onProceed(): void {
    let selectRecognitionLanguage = this.recognitionLanguage;
    if (this.isCurrentParticipantHost) {
      switch (this.recognitionLanguage) {
        case 'Russian':
          selectRecognitionLanguage = 'ru';
          break;
        case 'Ukrainian':
          selectRecognitionLanguage = 'uk';
          break;
        default:
          selectRecognitionLanguage = 'en-US';
      }
    }
    this.result = {
      microOff: !this.microphone,
      cameraOff: !this.webcam,
      leave: this.leave,
      isAllowedVideoOnStart: this.isAllowedVideoOnStart,
      isAllowedAudioOnStart: this.isAllowedAudioOnStart,
      recognitionLanguage: selectRecognitionLanguage,
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
