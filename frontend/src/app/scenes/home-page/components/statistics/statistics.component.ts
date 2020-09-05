import { Component, OnInit, Output, EventEmitter, Input, OnDestroy } from '@angular/core';
import { User, UserMeetingStatistics } from '@shared/models';
import { StatisticsService } from 'app/core/services';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { ToastrService } from 'ngx-toastr';


@Component({
  selector: 'app-statistics',
  templateUrl: './statistics.component.html',
  styleUrls: ['./statistics.component.sass']
})
export class StatisticsComponent implements OnInit, OnDestroy {
  @Input() user: User;
  @Output() statisticsClose: EventEmitter<void> = new EventEmitter<void>();


  statistics: UserMeetingStatistics[];
  private unsubscribe$ = new Subject<void>();

  data: any;
  chartTitle = 'Max meeting duration';
  markerSettings = {
    visible: true
  };
  xAxis = {
    title: 'Date Time',
    valueType: 'DateTime',
    edgeLabelPlacement: 'Shift',
    labelFormat: 'EEEE',
    maximum: new Date()
  };
  yAxis = {
    title: 'Duration',
  };
  tooltip = {
    enable: true
  };

  constructor(
    private statisticsService: StatisticsService,
    private toastr: ToastrService,
  ) {
  }

  ngOnInit(): void {
    this.getStatistics();
  }

  public ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  getStatistics(): void {
    this.statisticsService
      .getStatistics()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(resp => {
        this.statistics = resp.body;
        this.data = this.statistics.map((s) => {
          return {
            date: new Date(s.date.valueAsString),
            value: this.getDate(s.maxDuration.value)
          };
        });
      },
      (error) => this.toastr.error(error.Message));
  }

  getDate(ms: number): Date {
    const d = new Date();
    d.setHours(0);
    d.setMinutes(0);
    d.setSeconds(0);
    d.setMilliseconds(ms);
    return d;
  }

  public close(): void {
    this.statisticsClose.emit();
  }
}
