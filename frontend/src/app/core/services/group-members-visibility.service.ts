import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class GroupMembersVisibilityService {

  constructor() { }

  public isMembersVisible = false;
}
