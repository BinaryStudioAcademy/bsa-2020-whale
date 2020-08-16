export interface PollCreateDto {
  meetingId: string;
  title: string;
  isAnonymous: boolean;
  isSingleChoice: boolean;

  options: string[];
}
