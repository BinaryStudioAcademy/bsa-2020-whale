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

  public getAllGroups(): Observable<Group[]> {
    return this.httpService.getRequest<Group[]>('/api/groups');
  }

  public createGroup(group: Group): Observable<HttpResponse<Group>> {
    return this.httpService.postFullRequest<Group, Group>(
      `${this.routePrefix}`,
      group
    );
  }
  public deleteGroup(group: Group): Observable<HttpResponse<void>> {
    return this.httpService.deleteFullRequest<void>(
      `${this.routePrefix}/${group.id}`
    );
  }
}
