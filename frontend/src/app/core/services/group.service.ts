import { Injectable } from '@angular/core';
import { HttpService } from './http.service';
import { Group } from '../../shared/models/group/group';
import { Observable } from 'rxjs';
import { HttpResponse } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class GroupService {
  public routePrefix = '/api/groups';

  constructor(private httpService: HttpService) {}

  public createGroup(
    email: string,
    group: Group
  ): Observable<HttpResponse<Group>> {
    return this.httpService.postFullRequest<Group, Group>(
      `${this.routePrefix}`,
      group
    );
  }
}
