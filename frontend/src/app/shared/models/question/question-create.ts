import { UserData } from './user-data';

export interface QuestionCreate {
  meetingId: string;
  isAnonymous: boolean;
  asker?: UserData;
  text: string;
}
