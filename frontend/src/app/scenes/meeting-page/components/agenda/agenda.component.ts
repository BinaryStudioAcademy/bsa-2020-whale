import { Component, OnInit, EventEmitter, Input, ElementRef, ViewChild, Output } from '@angular/core';
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
  @Output() topicEnd = new EventEmitter<boolean>();
  dateNow: Date;
  private unsubscribe$ = new Subject<void>();
  isSnooze = false;
  cachedTopics: PointAgenda[] = [];
  ngOnInit(): void {
    this.dateNow = new Date();
    this.httpServie.getRequest<PointAgenda[]>(`${environment.apiUrl}/meeting/agenda/${this.meetingId}`)
    .subscribe((res) =>
    {
      this.agenda = res;
      res.forEach(x => {
        const ntf = setTimeout(() => {
          this.dateNow = new Date();
          if (this.dateNow >= new Date(x.startTime) && !this.cachedTopics.includes(x)){
            this.meetingSignalrService.invoke(SignalMethods.OnOutTime, {
              point: x ,
              meetingId: this.meetingId
            });
            this.isSnooze = true;
            clearTimeout(ntf);
            this.cachedTopics.push(x);
          }
        }, 1000);
        });
    });
  }
}
