import { Injectable } from '@angular/core';
import { AuthService } from '../auth/auth.service';

@Injectable({
  providedIn: 'root',
})
export class GoogleCalendarService {
  constructor() {}

  public async insertEvent(event: gapi.client.calendar.Event) {
    console.log(event);
    const insert = await gapi.client.calendar.events.insert({
      calendarId: 'primary',
      resource: event,
    });
  }

  private hoursFromNow = (n) =>
    new Date(Date.now() + n * 1000 * 60 * 60).toISOString();
}
