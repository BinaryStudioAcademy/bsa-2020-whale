import { Injectable, OnDestroy } from '@angular/core';
import { Contact, DirectMessage, GroupMessage } from '@shared/models';
import { User } from 'firebase';
import { Subject, from, Observable, ReplaySubject } from 'rxjs';
import { HubConnection } from '@aspnet/signalr';
import { SignalRService } from '.';
import { environment } from '@env';
import { tap, takeUntil } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class MessageService implements OnDestroy {
  public hubConnection: HubConnection;

  public receivedMessage = new Subject<DirectMessage>();
  public receivedMessage$ = this.receivedMessage.asObservable();

  public receivedGroupMessage = new Subject<GroupMessage>();
  public receivedGroupMessage$ = this.receivedGroupMessage.asObservable();

  private unsubscribe$ = new Subject<void>();

  constructor(private signalRService: SignalRService) {}

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  public registerHub(): Observable<HubConnection> {
    return from(
      this.signalRService.registerHub(environment.signalrUrl, 'chatHub')
    ).pipe(
      tap((hub) => {
        this.hubConnection = hub;
        this.registerNewMessageReceived();
        this.registerNewGroupMessageReceived();
      })
    );
  }

  public registerNewMessageReceived(): void {
    this.hubConnection.on('NewMessageReceived', (message: DirectMessage) => {
      this.receivedMessage.next(message);
    });
  }

  public registerNewGroupMessageReceived(): void {
    this.hubConnection.on(
      'NewGroupMessageReceived',
      (message: GroupMessage) => {
        this.receivedGroupMessage.next(message);
      }
    );
  }

  public joinGroup(contactId: string): void {
    this.hubConnection.invoke('JoinGroup', contactId);
  }

  public leaveGroup(contactId: string): void {
    this.hubConnection.invoke('LeaveGroup', contactId);
  }
}
