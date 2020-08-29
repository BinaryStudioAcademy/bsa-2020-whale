import { MediaPermissions } from './media-permissions';

export interface MediaState extends MediaPermissions {
  isVideoActive: boolean;
  isAudioActive: boolean;
}
