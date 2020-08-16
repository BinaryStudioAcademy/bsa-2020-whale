import { OptionResultDto } from './option-result-dto';

export interface PollResultDto {
  pollId: string;
  title: string;
  isAnonymous: boolean;
  totalVoted: number;
  optionResults: OptionResultDto[];
  voteCount: number;
}
