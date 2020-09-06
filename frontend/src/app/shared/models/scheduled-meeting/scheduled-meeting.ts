import { Meeting } from '../meeting/meeting';
import { User } from '../user';

export interface ScheduledMeeting {
    id: string;
    meeting: Meeting;
    creator: User;
    participants: User[];
    link: string;
    canceled: boolean;
}
