import { QuestionStatus } from './question-status';

export interface QuestionStatusUpdate {
  meetingId: string;
  questionId: string;
  questionStatus: QuestionStatus;
}
