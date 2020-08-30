import { ReactionsEnum } from './reactions-enum';

export interface Reaction {
  meetingId: string;
  userId: string;
  reaction: ReactionsEnum;
}
