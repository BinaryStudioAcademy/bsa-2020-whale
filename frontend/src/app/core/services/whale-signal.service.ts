import { Injectable } from '@angular/core';
import { HubConnection } from '@aspnet/signalr';
import { SignalRService } from '../services/signal-r.service';
import { from, Observable, Subject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import {
  Notification,
  Contact,
  MeetingLink,
  Call,
  UserOnline,
  GroupCall,
  Group,
} from '@shared/models';

@Injectable({
  providedIn: 'root',
})
export class WhaleSignalService {
  public signalHub: HubConnection;

  private signalUserConected = new Subject<UserOnline>();
  public signalUserConected$ = this.signalUserConected.asObservable();

  private signalUserDisconected = new Subject<string>();
  public signalUserDisconected$ = this.signalUserDisconected.asObservable();

  private signalUserDisconectedError = new Subject<string>();
  public signalUserDisconectedError$ = this.signalUserDisconectedError.asObservable();

  private startCallOthers = new Subject<Call>();
  public startCallOthers$ = this.startCallOthers.asObservable();

  private startCallOthersInGroup = new Subject<GroupCall>();
  public startCallOthersInGroup$ = this.startCallOthersInGroup.asObservable();

  private startCallCaller = new Subject<MeetingLink>();
  public startCallCaller$ = this.startCallCaller.asObservable();

  private takeCall = new Subject<void>();
  public takeCall$ = this.takeCall.asObservable();

  private takeGroupCall = new Subject<void>();
  public takeGroupCall$ = this.takeGroupCall.asObservable();

  private declineCall = new Subject<void>();
  public declineCall$ = this.declineCall.asObservable();

  private declineGroupCall = new Subject<void>();
  public declineGroupCall$ = this.declineGroupCall.asObservable();

  private receiveContact = new Subject<Contact>();
  public receiveContact$ = this.receiveContact.asObservable();

  private removeContact = new Subject<string>();
  public removeContact$ = this.removeContact.asObservable();

  private receiveNotify = new Subject<Notification>();
  public receiveNotify$ = this.receiveNotify.asObservable();

  private removeNotify = new Subject<string>();
  public removeNotify$ = this.removeNotify.asObservable();

  private receiveGroup = new Subject<Group>();
  public receiveGroup$ = this.receiveGroup.asObservable();

  private removeGroup = new Subject<string>();
  public removeGroup$ = this.removeGroup.asObservable();

  private removedFromGroup = new Subject<string>();
  public removedFromGroup$ = this.removedFromGroup.asObservable();

  private updatedGroup = new Subject<Group>();
  public updatedGroup$ = this.updatedGroup.asObservable();

  constructor(hubService: SignalRService) {
    from(hubService.registerHub(environment.signalrUrl, 'whale'))
      .pipe(
        tap((hub) => {
          console.log('whale hub connected');
          this.signalHub = hub;
        })
      )
      .subscribe(() => {
        this.signalHub.on('OnUserConnect', (userOnline: UserOnline) => {
          this.signalUserConected.next(userOnline);
        });

        this.signalHub.on('OnUserDisconnect', (userEmail: string) => {
          this.signalUserDisconected.next(userEmail);
        });

        this.signalHub.on('OnUserDisconnectOnError', (userId: string) => {
          this.signalUserDisconectedError.next(userId);
        });

        this.signalHub.on('OnStartCallOthers', (call: Call) => {
          this.startCallOthers.next(call);
        });

        this.signalHub.on(
          'OnStartCallOthersInGroup',
          (groupCall: GroupCall) => {
            this.startCallOthersInGroup.next(groupCall);
          }
        );

        this.signalHub.on('OnStartCallCaller', (link: MeetingLink) => {
          this.startCallCaller.next(link);
        });

        this.signalHub.on('OnTakeCall', () => {
          this.takeCall.next();
        });

        this.signalHub.on('OnTakeGroupCall', () => {
          this.takeGroupCall.next();
        });

        this.signalHub.on('OnDeclineCall', () => {
          this.declineCall.next();
        });

        this.signalHub.on('OnDeclineGroupCall', () => {
          this.declineGroupCall.next();
        });

        this.signalHub.on('onNewContact', (contact: Contact) => {
          this.receiveContact.next(contact);
        });

        this.signalHub.on('onDeleteContact', (contactId: string) => {
          this.removeContact.next(contactId);
        });

        this.signalHub.on('onNewNotification', (notification: Notification) => {
          this.receiveNotify.next(notification);
        });

        this.signalHub.on('onDeleteNotification', (notificationId: string) => {
          this.removeNotify.next(notificationId);
        });

        this.signalHub.on('OnNewGroup', (group: Group) => {
          this.receiveGroup.next(group);
        });

        this.signalHub.on('OnDeleteGroup', (groupId: string) => {
          this.removeGroup.next(groupId);
        });

        this.signalHub.on('OnRemovedFromGroup', (groupId: string) => {
          this.removedFromGroup.next(groupId);
        });

        this.signalHub.on('OnGroupUpdate', (group: Group) => {
          this.updatedGroup.next(group);
        });
      });
  }

  public invoke(method: WhaleSignalMethods, arg: any): Observable<void> {
    return from(
      this.signalHub.invoke(WhaleSignalMethods[method].toString(), arg)
    );
  }

  public invokeALot(
    method: WhaleSignalMethods,
    argс: any,
    agrv: any
  ): Observable<void> {
    return from(
      this.signalHub.invoke(WhaleSignalMethods[method].toString(), argс, agrv)
    );
  }
}

export enum WhaleSignalMethods {
  OnUserConnect,
  OnUserDisconnect,
  OnStartCall,
  OnStartGroupCall,
  OnTakeCall,
  OnTakeGroupCall,
  OnDeclineCall,
  OnDeclineGroupCall,
  onNewContact,
  onDeleteContact,
  onNewNotification,
  onDeleteNotification,
  OnNewGroup,
  OnDeleteGroup,
  OnRemovedFromGroup,
  OnGroupUpdate,
}
