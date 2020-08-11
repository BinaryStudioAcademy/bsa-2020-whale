export interface UserMediaData {
  id: string;
  userFirstName: string;
  userLastName: string;
  avatarUrl?: string;
  stream: MediaStream;
  isUserHost?: boolean;
  isCurrentUser?: boolean;
}
