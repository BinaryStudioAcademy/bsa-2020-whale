import { Participant } from '../participant/participant';
import { PollResultDto } from '../poll/poll-result-dto';
import { Recurrence } from './meeting-recurrence';

export interface Meeting {
  id: string;
  topic?: string;
  description?: string;
  settings: string;
  startTime: Date;
  endTime?: Date;
  anonymousCount: number;
  isScheduled: boolean;
  isRecurrent: boolean;
  isWhiteboard: boolean;
  isPoll: boolean;
  isAllowedToChooseRoom: boolean;
  recognitionLanguage: string;
  recurrence: Recurrence;
  isAudioAllowed: boolean;
  isVideoAllowed: boolean;
  speechDuration: number;
  presenceDuration: number;
  participants: Participant[];
  pollResults: PollResultDto[];
}
