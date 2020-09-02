import { MediaPermissions } from './media-permissions';

export interface MediaState extends MediaPermissions {
  meetingId: string;
  isVideoActive: boolean;
  isAudioActive: boolean;
}
