import { MediaState } from './media-state';

export interface ParticipantDynamicData extends MediaState {
  userFirstName: string;
  userSecondName: string;
  avatarUrl?: string;
  isUserHost?: boolean;
}
