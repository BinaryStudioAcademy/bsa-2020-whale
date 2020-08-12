import { Injectable } from '@angular/core';
import { SignalRService } from '../services/signal-r.service';
import { HubConnection } from '@aspnet/signalr';
import { environment } from '../../../environments/environment';
import { Subject, from, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { MeetingConnectionData } from '@shared/models/meeting/meeting-connect';
import { PollDto } from '@shared/models/poll/poll-dto';
import { PollResultsDto } from '@shared/models/poll/poll-results-dto';

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

  private pollReceived = new Subject<PollDto>();
  public pollReceived$ = this.pollReceived.asObservable();

  private pollResultsReceived = new Subject<PollResultsDto>();
  public pollResultsReceived$ = this.pollResultsReceived.asObservable();

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

        this.signalHub.on('OnPoll', (poll: PollDto) => {
          this.pollReceived.next(poll);
        });

        this.signalHub.on('OnPollResults', (pollResultsDto: PollResultsDto) => {
          this.pollResultsReceived.next(pollResultsDto);
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
  OnPoll,
  OnPollCreated,
}
