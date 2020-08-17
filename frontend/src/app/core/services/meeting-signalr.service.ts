import { Injectable } from '@angular/core';
import { SignalRService } from '../services/signal-r.service';
import { HubConnection } from '@aspnet/signalr';
import { environment } from '../../../environments/environment';
import { Subject, from, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { MeetingConnectionData } from '@shared/models/meeting/meeting-connect';
import { MeetingMessage } from '@shared/models/meeting/message/meeting-message';
import { CanvasWhiteboardUpdate } from 'ng2-canvas-whiteboard';

@Injectable({
  providedIn: 'root',
})
export class MeetingSignalrService {
  public signalHub: HubConnection;
  public connectionId: string;

  private signalUserConected = new Subject<MeetingConnectionData>();
  public signalUserConected$ = this.signalUserConected.asObservable();

  private signalUserDisconected = new Subject<MeetingConnectionData>();
  public signalUserDisconected$ = this.signalUserDisconected.asObservable();

  private conferenceStartRecording = new Subject<string>();
  public conferenceStartRecording$ = this.conferenceStartRecording.asObservable();

  private conferenceStopRecording = new Subject<string>();
  public conferenceStopRecording$ = this.conferenceStopRecording.asObservable();

  private sendMessage = new Subject<MeetingMessage>();
  public sendMessage$ = this.sendMessage.asObservable();

  private getMessages = new Subject<MeetingMessage[]>();
  public getMessages$ = this.getMessages.asObservable();

  private canvasDraw = new Subject<CanvasWhiteboardUpdate[]>();
  public readonly canvasDraw$ = this.canvasDraw.asObservable();

  private canvasErase = new Subject<boolean>();
  public readonly canvasErase$ = this.canvasErase.asObservable();

  constructor(private hubService: SignalRService) {
    from(hubService.registerHub(environment.meetingApiUrl, 'meeting'))
      .pipe(
        tap((hub) => {
          this.signalHub = hub;
        })
      )
      .subscribe(() => {
        this.signalHub.on('OnConferenceStartRecording', (message: string) => {
          this.conferenceStartRecording.next(message);
        });

        this.signalHub.on('OnConferenceStopRecording', (message: string) => {
          this.conferenceStopRecording.next(message);
        });

        this.signalHub.on(
          'OnUserConnect',
          (connectionData: MeetingConnectionData) => {
            this.signalUserConected.next(connectionData);
          }
        );

        this.signalHub.on(
          'OnUserDisconnect',
          (connectionData: MeetingConnectionData) => {
            this.signalUserDisconected.next(connectionData);
          }
        );

        this.signalHub.on('OnSendMessage', (message: MeetingMessage) => {
          this.sendMessage.next(message);
        });

        this.signalHub.on('OnGetMessages', (messages: MeetingMessage[]) => {
          this.getMessages.next(messages);
        });

        this.signalHub.on('OnDrawing', (drawing: CanvasWhiteboardUpdate[]) => {
          this.canvasDraw.next(drawing);
        });

        this.signalHub.on('OnErasing', (erase: boolean) => {
          this.canvasErase.next(erase);
        });
      });
  }

  public invoke(method: SignalMethods, arg: any): Observable<void> {
    return from(this.signalHub.invoke(SignalMethods[method].toString(), arg));
  }
}

export interface SignalData {
  fromConnectionId: string;
  signalInfo: string;
}

export enum SignalMethods {
  OnUserConnect,
  OnUserDisconnect,
  OnConferenceStartRecording,
  OnConferenceStopRecording,
  OnSendMessage,
  OnGetMessages,
  OnDrawing,
  OnErasing,
}
