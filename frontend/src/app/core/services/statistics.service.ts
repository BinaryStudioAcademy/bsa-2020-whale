import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpService } from '.';
import { UserMeetingStatistics } from '@shared/models';
import { Observable } from 'rxjs';
import { HttpResponse } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class StatisticsService {
  public routePrefix = `${environment.apiUrl}/api/statistics`;
  constructor(
    private httpService: HttpService,
  ) { }

  public getStatistics(): Observable<HttpResponse<UserMeetingStatistics[]>>{
    return this.httpService.getFullRequest<UserMeetingStatistics[]>(this.routePrefix);
  }
}
