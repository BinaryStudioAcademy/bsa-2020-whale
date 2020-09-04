import { PointAgenda } from '../agenda/agenda';
import { Recurrence } from 'app/scenes/schedule-meeting-page/components/schedule-meeting-page/schedule-meeting-page.component';

export interface MeetingCreate {
  settings: string;
  startTime: Date;
  anonymousCount: number;
  isScheduled: boolean;
  isRecurrent: boolean;
  recurrency: Recurrence;
  isAudioAllowed: boolean;
  isVideoAllowed: boolean;
  isWhiteboard: boolean;
  isAllowedToChooseRoom: boolean;
  isPoll: boolean;
  creatorEmail: string;
  participantsEmails: string[];
  agendaPoints?: PointAgenda[];
  recognitionLanguage: string;
}
