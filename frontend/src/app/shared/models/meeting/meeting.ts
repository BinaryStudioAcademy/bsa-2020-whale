import { Participant } from '../participant/participant';
import { PollResultDto } from '../poll/poll-result-dto';

export interface Meeting {
  id: string;
  settings: string;
  startTime: Date;
  anonymousCount: number;
  isScheduled: boolean;
  isRecurrent: boolean;

  participants: Participant[];
  pollResults: PollResultDto[];
}
