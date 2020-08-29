import { Injectable } from '@angular/core';
import { environment } from '@env';
import { AngularFireAuth } from '@angular/fire/auth';

@Injectable({
  providedIn: 'root',
})
export class GoogleCalendarService {
  constructor() {
    this.initClient();
  }

  private initClient(): void {
    gapi.load('client', () => {
      gapi.client.init({
        apiKey: environment.firebase.apiKey,
        clientId: environment.googleClientId,
        discoveryDocs: [
          'https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest',
        ],
        scope: 'https://www.googleapis.com/auth/calendar',
      });

      gapi.client.load('calendar', 'v3', () => {});
    });
  }

  public async insertEvent(
    event: gapi.client.calendar.Event
  ): Promise<boolean> {
    const googleAuth = gapi.auth2.getAuthInstance();
    return await googleAuth
      .signIn()
      .then(async (user) => {
        const insert = await gapi.client.calendar.events.insert({
          calendarId: 'primary',
          resource: event,
        });
        return insert.status === 200 || insert.status === 201;
      })
      .catch((err) => {
        console.error(err);
        return false;
      });
  }
}
