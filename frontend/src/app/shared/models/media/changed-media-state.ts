import { MediaState } from './media-state';

export interface ChangedMediaState extends MediaState {
  streamId: string;
  receiverConnectionId?: string;
}
