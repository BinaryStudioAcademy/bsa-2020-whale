import { PollDto } from './poll-dto';

export interface PollResultsDto {
  pollDto: PollDto;
  results: { [key: string]: number };
}
