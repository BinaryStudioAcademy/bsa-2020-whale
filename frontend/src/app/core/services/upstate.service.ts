import { Injectable } from '@angular/core';
import { HttpService } from './http.service';
import { AuthService } from '../auth/auth.service';
import { User } from '../../shared/models/user/user';
import { Subject, from, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class UpstateService {
  public routePrefix = '/api/User';
  public loggedInUser: User;

  private signalUserConected = new Subject<User>();
  public signalUserConected$ = this.signalUserConected.asObservable();

  constructor(private httpService: HttpService) {}
  public getLoggeInUser(): Observable<User> {
    return from(this.httpService.getRequest<User>(this.routePrefix));
  }
}
