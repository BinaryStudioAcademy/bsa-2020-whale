import { Injectable } from '@angular/core';
import { HttpService } from './http.service';
import { MeetingCreate } from '../../shared/models/meeting/meeting-create';
import { HttpResponse, HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { MeetingLink } from '../../shared/models/meeting/meeting-link';
import { Meeting } from '../../shared/models/meeting/meeting';
import { MediaOnStart, UpdateStatistics } from '@shared/models';
import { UpdateSettings } from '@shared/models/meeting/update-settings';

@Injectable({
  providedIn: 'root',
})
export class MeetingService {
  public routePrefix = `${environment.apiUrl}/meeting`;

  constructor(private httpService: HttpService, private http: HttpClient) {}

  public createMeeting(
    meeting: MeetingCreate
  ): Observable<HttpResponse<MeetingLink>> {
    return this.httpService.postFullRequest<MeetingCreate, MeetingLink>(
      `${this.routePrefix}`,
      meeting
    );
  }

  public createScheduledMeeting(
    meeting: MeetingCreate
  ){
    return this.http.post(`${this.routePrefix}/scheduled`, meeting , {
      responseType: 'text',
    });
  }

  public connectMeeting(link: string): Observable<HttpResponse<Meeting>> {
    return this.httpService.getFullRequest<Meeting>(
      `${this.routePrefix}${link}`
    );
  }

  public updateMeetingSettings(
    updateSettings: UpdateSettings
  ): Observable<HttpResponse<void>> {
    return this.httpService.putFullRequest(
      `${this.routePrefix}/updateSettings`,
      updateSettings
    );
  }

  public updateMeetingStatistics(statistics: UpdateStatistics): Observable<HttpResponse<void>> {
    return this.httpService.putFullRequest(`${this.routePrefix}/statistics`, statistics);
  }
}
