import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class InviteModalService {

  constructor() { }

  public emails: string[] = [];
}
