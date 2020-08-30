import { MediaState } from '.';

export interface ChangedMediaPermissions extends MediaState {
  changedParticipantConnectionId?: string;
}
