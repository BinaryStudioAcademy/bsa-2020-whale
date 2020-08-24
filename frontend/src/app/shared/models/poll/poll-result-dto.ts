import { OptionResultDto } from './option-result-dto';
import { VoterDto } from './voter-dto';

export interface PollResultDto {
  pollId: string;
  title: string;
  isAnonymous: boolean;

  optionResults: OptionResultDto[];
  votedUsers: VoterDto[];
}
