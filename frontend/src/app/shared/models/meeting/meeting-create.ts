import { PointAgenda } from '../agenda/agenda';

export interface MeetingCreate {
  settings: string;
  startTime: Date;
  anonymousCount: number;
  isScheduled: boolean;
  isRecurrent: boolean;
  creatorEmail: string;
  participantsEmails: string[];
  agendaPoints?: PointAgenda[];
}
