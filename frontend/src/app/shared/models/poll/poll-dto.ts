export interface PollDto {
    meetingId: string;
    title: string;
    isAnonymous: boolean;
    isSingleChoice: boolean;

    answer1: string;
    answer2: string;
    answer3?: string;
    answer4?: string;
    answer5?: string;
}