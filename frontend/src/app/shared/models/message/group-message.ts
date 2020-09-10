import { Group } from '../group/group';
import { User } from '@shared/models/user/user';

export interface GroupMessage {
  id?: string;
  groupId: string;
  group?: Group;
  authorId: string;
  author?: User;
  createdAt: Date;
  message: string;
  attachment: boolean;
  attachmentUrl: string;
}
