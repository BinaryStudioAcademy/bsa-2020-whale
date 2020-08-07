export interface Meeting {
    id: string;
    settings: string;
    startTime: Date;
    anonymousCount: number;
    isScheduled: boolean;
    isRecurrent: boolean;
}
