import { MeetingLink } from '../meeting/meeting-link';
import { Contact } from '../contact/contact';

export interface Call {
  link: MeetingLink;
  contact: Contact;
}
