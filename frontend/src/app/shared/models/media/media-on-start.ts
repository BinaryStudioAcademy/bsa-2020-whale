import { MediaPermissions } from './media-permissions';

export interface MediaOnStart extends MediaPermissions {
  meetingId: string;
}
