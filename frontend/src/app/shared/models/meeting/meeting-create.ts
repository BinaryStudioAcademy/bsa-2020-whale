import { PointAgenda } from '../agenda/agenda';

export interface MeetingCreate {
  topic?: string;
  description?: string;
  settings: string;
  startTime: Date;
  anonymousCount: number;
  isScheduled: boolean;
  isRecurrent: boolean;
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
