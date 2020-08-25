import { BehaviorSubject } from 'rxjs';
import { ParticipantDynamicData } from './participant-dynamic-data';

export interface MediaData {
  id: string;
  isCurrentUser?: boolean;
  currentStreamId: string;
  stream: MediaStream;
  dynamicData: BehaviorSubject<ParticipantDynamicData>;
}
