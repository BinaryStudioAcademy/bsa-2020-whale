import { User } from '../user/user';

export interface Contact {
  id: string;
  ownerId: string;
  owner: User;
  contactnerId: string;
  contactner: User;
  isBlocked: boolean;
}
