import { BehaviorSubject } from 'rxjs';
import { ParticipantDynamicData } from './participant-dynamic-data';

export interface MediaData {
  id: string;
  isCurrentUser?: boolean;
  stream: MediaStream;
  dynamicData: BehaviorSubject<ParticipantDynamicData>;
}
