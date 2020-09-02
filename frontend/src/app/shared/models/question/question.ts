import { UserData } from './user-data';
import { QuestionStatus } from './question-status';

export interface Question {
  id: string;
  meetingId: string;
  askedAt: Date;
  asker: UserData;
  text: string;
  questionStatus: QuestionStatus;
}
