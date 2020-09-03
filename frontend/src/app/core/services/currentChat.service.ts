import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CurrentChatService {

  constructor() { }

  public currentGroupChatId: string;
  public currentChatId: string;
}
