import { MediaState } from './media-state';

export interface StreamChangedData extends MediaState {
  oldStreamId: string;
  newStreamId: string;
}
