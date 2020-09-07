export interface UserMeetingStatistics {
    date: {
        value: number;
        valueAsString: string;
    };
    minDuration: {
        value: number;
    };
    maxDuration: {
        value: number;
    };
    avgDuration: {
        value: number;
    };
    minSpeech: {
        value: number;
    };
    maxSpeech: {
        value: number;
    };
    avgSpeech: {
        value: number;
    };
    minPresence: {
        value: number;
    };
    maxPresence: {
        value: number;
    };
    avgPresence: {
        value: number;
    };
    docCount: {
        value: number;
    };
}
