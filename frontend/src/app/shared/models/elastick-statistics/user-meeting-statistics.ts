export interface UserMeetingStatistics {
    id: string;
    userId: string;
    meetingId: string;
    startDate: Date;
    endDate: Date;
    durationTime: number;
    speechTime: number;
    presenceTime: number;
    meetingDuration: string;
}
