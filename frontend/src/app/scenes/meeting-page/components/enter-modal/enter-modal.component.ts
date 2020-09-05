import { Component, OnInit } from '@angular/core';
import { SimpleModalComponent } from 'ngx-simple-modal';
import { MeetingSettingsService } from 'app/core/services';
import {MeetingTypeEnum} from '@shared/Enums/MeetingTypeEnum';

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
  public meetingTypeLabel: string;
  public switchMeetingTypeLabel: boolean;
  public meetingType = MeetingTypeEnum[1];
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
      this.isAllowedVideoOnStart = this.meetingSettingService.getSettings().isVideoDisabled;
      this.isAllowedAudioOnStart = this.meetingSettingService.getSettings().isAudioDisabled;
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

  public switchMeetingTypes(type: MeetingTypeEnum): void {
    this.switchMeetingTypeLabel = true;
    if (this.isCurrentParticipantHost) {
      switch (type) {
        case 1:
          this.isAllowedAudioOnStart = true;
          this.isAllowedVideoOnStart = true;
          this.meetingType = MeetingTypeEnum[1];
          this.meetingTypeLabel = 'Simple (audio on for all, video on for all, music off)';
          break;
        case 2:
          this.isAllowedAudioOnStart = true;
          this.isAllowedVideoOnStart = true;
          this.meetingType = MeetingTypeEnum[2];
          this.meetingTypeLabel = 'Party (audio on for all, video on for all, music on)';
          break;
        case 3:
          this.isAllowedAudioOnStart = false;
          this.isAllowedVideoOnStart = true;
          this.meetingType = MeetingTypeEnum[3];
          this.meetingTypeLabel = 'Training (audio on only for host, video on for all, music on)';
          break;
        case 4:
          this.isAllowedAudioOnStart = false;
          this.isAllowedVideoOnStart = true;
          this.meetingType = MeetingTypeEnum[4];
          this.meetingTypeLabel = 'Lesson (audio on only for host, video on for all, music off)';
          break;
        case 5:
          this.isAllowedAudioOnStart = false;
          this.isAllowedVideoOnStart = false;
          this.meetingType = MeetingTypeEnum[5];
          this.meetingTypeLabel = 'Conference (audio on only for host, video on for host)';
          break;
        default:
          this.isAllowedAudioOnStart = true;
          this.isAllowedVideoOnStart = true;
          this.meetingType = MeetingTypeEnum[1];
          this.meetingTypeLabel = 'Simple (audio on for all, video on for all, music off)';
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
