import { User } from '../user/user';
import { Group } from '../group/group';

export interface GroupUser {
  groupId: string;
  group?: Group;
  userEmail?: string;
  userId?: string;
  user?: User;
}
