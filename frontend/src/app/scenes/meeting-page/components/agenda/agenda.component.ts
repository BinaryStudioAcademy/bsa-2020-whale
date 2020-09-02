import { Component, OnInit, EventEmitter, Input } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { PointAgenda } from '@shared/models/agenda/agenda';
import { HttpService, MeetingSignalrService, SignalMethods } from 'app/core/services';
import { environment } from '@env';
import { takeUntil } from 'rxjs/internal/operators/takeUntil';
import { Subject } from 'rxjs/internal/Subject';
import { IToastButton } from '@shared/components/custom-toast/custom-toast.component';

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
  toastRef;
  @Input() meetingId;
  intervalToEventList = [];
  dateNow: Date;
  private unsubscribe$ = new Subject<void>();
  isSneeze = false;
  ngOnInit(): void {
    this.dateNow = new Date();
    this.meetingSignalrService.onOutTime$
    .pipe(takeUntil(this.unsubscribe$))
    .subscribe(
      (point) => {
        this.toastr.success(`Time for topic ${point.name} must be finished or sneezing`);
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
          console.log(this.agenda);
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
            this.isSneeze = true;
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
      //this.agenda.splice(this.agenda.indexOf(a), 1);
    }
  }
  sneezeTopic(topic: PointAgenda){
    let list = this.agenda.filter(x => topic.startTime >= x.startTime);
    list.forEach(x => this.httpServie.putRequest<PointAgenda, PointAgenda>(`${environment.apiUrl}/api/meeting/agenda`, x));
    this.meetingSignalrService.invoke(SignalMethods.OnSnoozeTopic, {
      point: topic ,
      meetingId: this.meetingId
    }); 
    console.log(this.agenda);
   }
}
