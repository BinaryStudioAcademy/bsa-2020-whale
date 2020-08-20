import { Contact } from '../contact/contact';
import { User } from '@shared/models/user/user';

export interface DirectMessage {
  id?: string;
  contactId: string;
  contact?: Contact;
  authorId: string;
  author?: User;
  createdAt: Date;
  message: string;
  attachment: boolean;
}
