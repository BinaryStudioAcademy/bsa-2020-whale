import { VoterDto } from './voter-dto';
import { PollDto } from './poll-dto';

export interface VoteDto {
  poll: PollDto;
  meetingId: string;
  choosedOptions: string[];
  user: VoterDto;
}
