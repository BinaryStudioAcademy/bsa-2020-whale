import { LinkTypeEnum } from '@shared/Enums/LinkTypeEnum';

export interface IFireBaseUser {
  uid: string;
  displayName: string;
  email: string;
  photoUrl: string;
  phoneNumber: string;
  linkType: LinkTypeEnum;
}
