export interface MeetingCreate {
    settings: string;
    startTime: Date;
    anonymousCount: number;
    isScheduled: boolean;
    isRecurrent: boolean;
}
