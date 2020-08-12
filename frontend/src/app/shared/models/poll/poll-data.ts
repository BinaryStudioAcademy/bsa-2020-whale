import { PollDto } from './poll-dto';

export interface PollData {
  userId: string;
  groupId: string;
  pollDto: PollDto;
}
