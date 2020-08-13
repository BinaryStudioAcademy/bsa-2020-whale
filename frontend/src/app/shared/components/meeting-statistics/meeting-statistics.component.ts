import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { Statistics } from '@shared/models/statistics/statistics';
import { Observable, interval, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-meeting-statistics',
  templateUrl: './meeting-statistics.component.html',
  styleUrls: ['./meeting-statistics.component.sass']
})
export class MeetingStatisticsComponent implements OnInit, OnDestroy {
  @Input() statistic: Statistics;
  public userTimeUnix: number;
  public meetingTimeUnix: number;
  clock: Observable<any>;
  private unsubscribe$ = new Subject<void>();
  constructor() { }

  ngOnInit(): void {
    this.userTimeUnix = Date.now() - this.statistic.userJoinTime.getTime();
    this.meetingTimeUnix = Date.now() - new Date(this.statistic.startTime).getTime();
    this.clock = interval(1000);
    this.clock.pipe(takeUntil(this.unsubscribe$)).subscribe(() => {
      this.userTimeUnix += 1000;
      this.meetingTimeUnix += 1000;
    });
  }
  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
