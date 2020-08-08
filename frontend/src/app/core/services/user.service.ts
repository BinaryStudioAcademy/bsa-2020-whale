import { Injectable } from '@angular/core';

import { AuthService } from '../auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(
    private authService: AuthService
  ) { }

  public get userUid() {
    return this.authService.currentUser.uid;
  }

  public get userName() {
    return this.authService.currentUser.displayName;
  }

  public get userEmail() {
    return this.authService.currentUser.email;
  }

  public get userPhoto() {
    return this.authService.currentUser.photoURL;
  }
}
