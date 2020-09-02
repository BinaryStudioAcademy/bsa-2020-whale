import { Participant } from '../participant/participant';
import { PollResultDto } from '../poll/poll-result-dto';
import { MediaPermissions } from '..';

export interface Meeting {
  id: string;
  settings: string;
  startTime: Date;
  endTime?: Date;
  anonymousCount: number;
  isScheduled: boolean;
  isRecurrent: boolean;
  isWhiteboard: boolean;
  isPoll: boolean;
  isAllowedToChooseRoom: boolean;
  isAudioAllowed: boolean;
  isVideoAllowed: boolean;

  participants: Participant[];
  pollResults: PollResultDto[];
}
