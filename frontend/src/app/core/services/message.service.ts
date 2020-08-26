import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class MessageService {
  public creationDate: Date = new Date();

  constructor() {
    console.log('service constructor');
  }
}
