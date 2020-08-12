import { Injectable } from '@angular/core';
import { AuthService } from '../auth/auth.service';

@Injectable({
  providedIn: 'root',
})
export class GoogleCalendarService {
  constructor() {}

  public async insertEvent() {
    const insert = await gapi.client.calendar.events.insert({
      calendarId: 'primary',
      resource: {
        start: {
          dateTime: this.hoursFromNow(2),
          timeZone: 'America/Los_Angeles',
        },
        end: {
          dateTime: this.hoursFromNow(3),
          timeZone: 'America/Los_Angeles',
        },
        summary: 'Have Fun!!!',
        description: 'Do some cool stuff and have a fun time doing it',
      },
    });
  }

  private hoursFromNow = (n) =>
    new Date(Date.now() + n * 1000 * 60 * 60).toISOString();
}
