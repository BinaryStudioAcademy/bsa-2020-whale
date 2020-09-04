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

  public getStatistics(): Observable<HttpResponse<any>>{
    return this.httpService.getFullRequest<any>(this.routePrefix);
  }
}
