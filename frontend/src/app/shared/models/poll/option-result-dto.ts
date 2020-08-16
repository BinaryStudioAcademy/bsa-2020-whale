import { VoterDto } from './voter-dto';

export interface OptionResultDto {
  option: string;
  voteCount: number;
  votedUsers: VoterDto[];
}
