import { PollDto } from './poll-dto';
import { PollResultDto } from './poll-result-dto';

export interface PollsAndResultsDto {
  polls: PollDto[];
  results: PollResultDto[];
}
