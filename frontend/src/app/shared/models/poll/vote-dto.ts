import { VoterDto } from './voter-dto';
import { PollDto } from './poll-dto';

export interface VoteDto {
  pollId: string;
  meetingId: string;
  choosedOptions: string[];
  user: VoterDto;
}
