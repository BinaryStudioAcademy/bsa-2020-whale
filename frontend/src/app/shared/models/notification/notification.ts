import { NotificationTypeEnum } from './notification-type-enum';

export interface Notification {
  id: string;
  createdAt: Date;
  notificationType: NotificationTypeEnum;
  options: string;
}
