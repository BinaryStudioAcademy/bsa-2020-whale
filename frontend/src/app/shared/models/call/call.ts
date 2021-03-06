import { MeetingLink } from '../meeting/meeting-link';
import { Contact } from '../contact/contact';

export interface Call {
  meetingLink: MeetingLink;
  contact: Contact;
  callerEmail: string;
}
