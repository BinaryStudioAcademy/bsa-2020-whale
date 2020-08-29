import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { HttpService } from './http.service';
import { IFireBaseUser, User } from '../../shared/models/user';
import { environment } from '../../../environments/environment';
import { LinkTypeEnum } from '@shared/Enums/LinkTypeEnum';
import { Router } from '@angular/router';
import { first } from 'rxjs/operators';
import { ReplaySubject, Subject, BehaviorSubject, AsyncSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UserRegistrationService {
  private getUserUrl: string = environment.apiUrl + '/api/user/email';
  private addUserUrl: string = environment.apiUrl + '/api/user';

  private userRegistered = new ReplaySubject<User>(1);
  public userRegistered$ = this.userRegistered.asObservable();

  constructor(
    private httpService: HttpService,
    private http: HttpClient,
    private router: Router
  ) {
    console.error('USER REGISTRATION SERVICE');
  }

  registerUser(currentUser: any): void {
    const fireUser: IFireBaseUser = {
      uid: currentUser.uid,
      displayName: currentUser.displayName,
      email: currentUser.email,
      phoneNumber: currentUser.phoneNumber,
      photoUrl: currentUser.photoURL,
      linkType: LinkTypeEnum.External,
    };

    this.http
      .get<User>(this.getUserUrl + `/${fireUser.email}`, {
        observe: 'response',
      })
      .pipe(first())
      .subscribe(
        (user) => {
          console.log(user);
          if (!user.body) {
            this.httpService
              .postClearRequest<IFireBaseUser, User>(this.addUserUrl, fireUser)
              .pipe(first())
              .subscribe((createdUser) => {
                console.log(createdUser);
                this.userRegistered.next(createdUser);
                this.router.navigate(['/home']);
              });
          } else {
            this.userRegistered.next(user.body);
            if (this.router.url === '/' || 'landing') {
              this.router.navigate(['/home']);
            }
          }
        },
        (error) => {
          console.log(error);
          // if (error.status === 404) {
          //   this.httpService
          //     .postClearRequest<IFireBaseUser, User>(this.addUserUrl, user)
          //     .pipe(first())
          //     .subscribe((user) => {
          //       this.userRegistered.next(user);
          //       //this.router.navigate(['/home']);
          //     });
          // }
        }
      );
  }
}
