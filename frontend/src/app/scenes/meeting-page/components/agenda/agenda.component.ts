import { Component, OnInit, EventEmitter, Input, ElementRef, ViewChild } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { PointAgenda } from '@shared/models/agenda/agenda';
import { HttpService, MeetingSignalrService, SignalMethods } from 'app/core/services';
import { environment } from '@env';
import { takeUntil } from 'rxjs/internal/operators/takeUntil';
import { Subject } from 'rxjs/internal/Subject';

@Component({
  selector: 'app-agenda',
  templateUrl: './agenda.component.html',
  styleUrls: ['./agenda.component.sass'],
})
export class AgendaComponent implements OnInit {
  constructor(private toastr: ToastrService,
              private httpServie: HttpService,
              private meetingSignalrService: MeetingSignalrService) {
  }
  public agenda: PointAgenda[] = [];
  @Input() meetingId;
  dateNow: Date;
  private unsubscribe$ = new Subject<void>();
  isSnooze = false;
  @ViewChild('myCheck') myCheck: ElementRef<HTMLInputElement>;
  ngOnInit(): void {
    this.dateNow = new Date();
    this.meetingSignalrService.onOutTime$
    .pipe(takeUntil(this.unsubscribe$))
    .subscribe(
      (point) => {
        this.toastr.success(`Topic ${point.name} must be finished`);
      },
      () => {
        this.toastr.error('Error');
      }
    );
    this.meetingSignalrService.onEndedTopic$
    .pipe(takeUntil(this.unsubscribe$))
    .subscribe(
      (point) => {
        this.toastr.success(`Topic ${point.name} finished`);
        this.checkPoint();
      },
      () => {
        this.toastr.error('Error');
      }
    );
    this.meetingSignalrService.onSnoozeTopic$
    .pipe(takeUntil(this.unsubscribe$))
    .subscribe(
      (point) => {
        this.toastr.success(`Topic ${point.name} snooze on 5 minute`);
        this.httpServie.getRequest<PointAgenda[]>(`${environment.apiUrl}/api/meeting/agenda/${this.meetingId}`)
        .subscribe((res) =>
        {
          this.agenda = res;
        });
      },
      () => {
        this.toastr.error('Error');
      }
    );
    this.httpServie.getRequest<PointAgenda[]>(`${environment.apiUrl}/api/meeting/agenda/${this.meetingId}`)
    .subscribe((res) =>
    {
      this.agenda = res;
      res.forEach(x => {
        const ntf = setInterval(() => {
          this.dateNow = new Date();
          if (this.dateNow >= new Date(x.startTime)){
            this.meetingSignalrService.invoke(SignalMethods.OnOutTime, {
              point: x ,
              meetingId: this.meetingId
            });
            this.isSnooze = true;
            clearTimeout(ntf);
          }
        }, 1000);
        });
    });
  }

  finishedPoint(event, a: PointAgenda){
    if (event.target.checked){
      this.meetingSignalrService.invoke(SignalMethods.OnEndedTopic, {
        point: a ,
        meetingId: this.meetingId
      });
    }
  }
  checkPoint()
  {
    this.myCheck.nativeElement.checked = true;
  }
  snoozeTopic(topic: PointAgenda){
    let list = this.agenda.filter(x => topic.startTime >= x.startTime);
    list.forEach(x =>
      {
        x.startTime = new Date(x.startTime);
        x.startTime.setMinutes(x.startTime.getMinutes() + 5);
      } );
    list.forEach(x => this.httpServie.putRequest(`${environment.apiUrl}/api/meeting/agenda`, x));
    this.meetingSignalrService.invoke(SignalMethods.OnSnoozeTopic, {
      point: topic ,
      meetingId: this.meetingId
    });
   }
}
