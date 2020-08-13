export interface PollDto {
  id: string;
  meetingId: string;
  title: string;
  isAnonymous: boolean;
  isSingleChoice: boolean;

  answers: string[];
}
