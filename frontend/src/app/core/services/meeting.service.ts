import { Injectable } from '@angular/core';
import { HttpService } from './http.service';
import { MeetingCreate } from '../../shared/models/meeting/meeting-create';
import { HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { MeetingLink } from '../../shared/models/meeting/meeting-link';
import { Meeting } from '../../shared/models/meeting/meeting';
import { MediaOnStart } from '@shared/models';
import { UpdateSettings } from '@shared/models/meeting/update-settings';

@Injectable({
  providedIn: 'root',
})
export class MeetingService {
  public routePrefix = `${environment.apiUrl}/api/meeting`;

  constructor(private httpService: HttpService) {}

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
  ): Observable<HttpResponse<MeetingLink>> {
    return this.httpService.postFullRequest<MeetingCreate, MeetingLink>(
      `${this.routePrefix}/scheduled`,
      meeting
    );
  }

  public connectMeeting(link: string): Observable<HttpResponse<Meeting>> {
    return this.httpService.getFullRequest<Meeting>(
      `${this.routePrefix}${link}`
    );
  }

  // public updateMediaOnStart(
  //   mediaOnStart: MediaOnStart
  // ): Observable<HttpResponse<void>> {
  //   return this.httpService.putFullRequest(
  //     `${this.routePrefix}/updateMedia`,
  //     mediaOnStart
  //   );
  // }

  public updateMeetingSettings(
    updateSettings: UpdateSettings
  ): Observable<HttpResponse<void>> {
    return this.httpService.putFullRequest(
      `${this.routePrefix}/updateSettings`,
      updateSettings
    );
  }
}
