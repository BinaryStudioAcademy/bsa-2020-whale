import { PollDto } from './poll-dto';

export interface PollResultsDto {
  pollId: string;
  title: string;
  isAnonymous: boolean;
  totalVoted: number;
  results: Map<string, number>;
}
