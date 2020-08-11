import { Injectable } from '@angular/core';
import { HttpService } from './http.service';
import { User } from '../../shared/models/user/user';
import { Subject, from, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UpstateService {
  public routePrefix = '/api/user';
  public loggedInUser: User;

  private signalUserConected = new Subject<User>();
  public signalUserConected$ = this.signalUserConected.asObservable();

  constructor(private httpService: HttpService) {}
  public getLoggedInUser(): Observable<User> {
    return from(this.httpService.getRequest<User>(this.routePrefix));
  }
}
