import { LinkTypeEnum } from '@shared/Enums/LinkTypeEnum';

export interface User {
  id?: string;
  firstName: string;
  secondName?: string;
  registrationDate?: Date;
  avatarUrl: string;
  linkType: LinkTypeEnum;
  email: string;
  phone?: string;
  connectionId: string;
}
