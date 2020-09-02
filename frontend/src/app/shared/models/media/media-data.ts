import { BehaviorSubject, Subject } from 'rxjs';
import { ParticipantDynamicData } from './participant-dynamic-data';
import { ReactionsEnum } from '@shared/models';

export interface MediaData {
  id: string;
  isSmallCard?: boolean;
  isCurrentUser?: boolean;
  currentStreamId: string;
  stream: MediaStream;
  dynamicData: BehaviorSubject<ParticipantDynamicData>;
  reactions: Subject<ReactionsEnum>;
  volume: number;
}
