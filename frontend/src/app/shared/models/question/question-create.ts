import { UserData } from './user-data';

export interface QuestionCreate {
  meetingId: string;
  asker: UserData;
  text: string;
}
