import { Injectable, EventEmitter } from '@angular/core';
import * as signalR from '@aspnet/signalr';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SignalRService {
  constructor() {
  }
  public registerHub(apiUrl: string, hubName: string): Promise<signalR.HubConnection> {
    const hubConnection = this.buildConnection(apiUrl, hubName);
    return this.startConnection(hubConnection).then(() => hubConnection);
  }
  private buildConnection = (apiUrl: string, hubName: string): signalR.HubConnection => {
    return new signalR.HubConnectionBuilder()
    .withUrl(`${apiUrl}/${hubName}`)
    .build();
  }
  private startConnection = (hub: signalR.HubConnection): Promise<void> => {
    return hub
    .start()
    .catch(err => {
      console.log(`Error while starting connection:${err}`);
      setTimeout(function(): void {
        this.startConnection();
      }, 3000);
    });
  }
  public registerEvent<T>(hub: signalR.HubConnection, eventName: string): EventEmitter<T> {
    const eventEmitter = new EventEmitter<T>();
    hub.on(eventName, (response: T) => {
      eventEmitter.emit(response);
    });
    return eventEmitter;
  }
}
