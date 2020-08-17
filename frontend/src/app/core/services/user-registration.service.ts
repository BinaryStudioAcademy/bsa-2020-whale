import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { HttpService } from './http.service';
import { IFireBaseUser, User } from '../../shared/models/user';
import { environment } from '../../../environments/environment';
import { LinkTypeEnum } from '@shared/Enums/LinkTypeEnum';

@Injectable({
  providedIn: 'root',
})
export class UserRegistrationService {
  private getUserUrl: string = environment.apiUrl + '/api/user/email';
  private addUserUrl: string = environment.apiUrl + '/api/user';

  constructor(private httpService: HttpService, private http: HttpClient) {}

  registerUser(currentUser: any) {
    const user: IFireBaseUser = {
      uid: currentUser.uid,
      displayName: currentUser.displayName,
      email: currentUser.email,
      phoneNumber: currentUser.phoneNumber,
      photoUrl: currentUser.photoURL,
      linkType: LinkTypeEnum.External,
    };

    this.http
      .get<User>(this.getUserUrl + `/${user.email}`, { observe: 'response' })
      .subscribe(
        (user) => console.log(`User ${user.body.email} exists`),
        (error) => {
          if (error.status === 404) {
            this.httpService
              .postClearRequest<IFireBaseUser, User>(this.addUserUrl, user)
              .subscribe();
          }
        }
      );
  }
}
