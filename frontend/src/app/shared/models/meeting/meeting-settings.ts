import { Recurrence } from './meeting-recurrence';

export interface MeetingSettings {
  isWhiteboard: boolean;
  isPoll: boolean;
  isAudioDisabled: boolean;
  isVideoDisabled: boolean;
  isAllowedToChooseRoom: boolean;
  recognitionLanguage: string;
  recurrence: Recurrence;
  selectMusic: string;
}
