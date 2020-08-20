export interface UserMediaData {
  id: string;
  userFirstName: string;
  userLastName: string;
  avatarUrl?: string;
  isUserHost?: boolean;
  isCurrentUser?: boolean;
  stream: MediaStream;
  isVideoEnabled: boolean;
  isAudioEnabled: boolean;
}
