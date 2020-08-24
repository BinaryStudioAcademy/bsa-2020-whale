import { VoterDto } from './voter-dto';

export interface OptionResultDto {
  option: string;
  votedUserIds: string[];
}
