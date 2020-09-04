import { Injectable } from '@angular/core';
import { HttpService } from './http.service';
import { Group } from '../../shared/models/group/group';
import { User } from '../../shared/models/user/user';
import { GroupUser } from '../../shared/models/group/groupuser';
import { Observable } from 'rxjs';
import { HttpResponse } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class GroupService {
  public routePrefix = '/groups';

  constructor(private httpService: HttpService) {}

  public getAllGroups(): Observable<Group[]> {
    return this.httpService.getRequest<Group[]>('/groups');
  }

  public createGroup(group: Group): Observable<HttpResponse<Group>> {
    return this.httpService.postFullRequest<Group, Group>(
      `${this.routePrefix}`,
      group
    );
  }
  public addUserToGroup(
    groupUser: GroupUser
  ): Observable<HttpResponse<GroupUser>> {
    return this.httpService.postFullRequest<GroupUser, GroupUser>(
      `${this.routePrefix}/user`,
      groupUser
    );
  }

  public leaveGroup(
    groupId: string,
    userEmail: string
  ): Observable<HttpResponse<void>> {
    return this.httpService.deleteFullRequest<void>(
      `${this.routePrefix}/${groupId}/${userEmail}`
    );
  }

  public getAllGroupUsers(groupId: string): Observable<User[]> {
    return this.httpService.getRequest<User[]>(
      `${this.routePrefix}/users/` + groupId
    );
  }
  public deleteGroup(group: Group): Observable<HttpResponse<void>> {
    return this.httpService.deleteFullRequest<void>(
      `${this.routePrefix}/${group.id}`
    );
  }

  public updateGroup(group: Group): Observable<HttpResponse<Group>> {
    return this.httpService.putFullRequest<Group, Group>(
      `${this.routePrefix}/update`,
      group
    );
  }
}
