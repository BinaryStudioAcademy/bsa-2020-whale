import { Component, OnInit, Output, EventEmitter, Input, OnDestroy } from '@angular/core';
import { User, UserMeetingStatistics } from '@shared/models';
import { StatisticsService } from 'app/core/services';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { IDatePickerConfig } from 'ng2-date-picker';
import { FormGroup, FormControl } from '@angular/forms';
import moment from 'moment';

enum StatisticFields {
  Call,
  Speech,
  Presence
}

enum Aggregations {
  Min,
  Average,
  Max
}

@Component({
  selector: 'app-statistics',
  templateUrl: './statistics.component.html',
  styleUrls: ['./statistics.component.sass']
})
export class StatisticsComponent implements OnInit, OnDestroy {
  @Input() user: User;
  @Output() statisticsClose: EventEmitter<void> = new EventEmitter<void>();

  public fields = StatisticFields;
  public aggregations = Aggregations;

  config: IDatePickerConfig = {
    weekDayFormat: 'dd',
    firstDayOfWeek: 'mo',
    showNearMonthDays: false,
    monthBtnCssClassCallback: (month) => 'ng2-date-picker-button',
    dayBtnCssClassCallback: (day) => 'ng2-date-picker-button',
  };

  public form: FormGroup;

  statistics: UserMeetingStatistics[];
  private unsubscribe$ = new Subject<void>();

  data = [];
  chartTitle: string;
  markerSettings = {
    visible: true
  };
  xAxis: object;
  yAxis: object;
  tooltip = {
    enable: true
  };

  statisticField = StatisticFields.Call;
  aggregation = Aggregations.Max;

constructor(
    private statisticsService: StatisticsService,
    private toastr: ToastrService,
  ) {
    const endDate = moment();
    const startDate = moment({hour: 0, minute: 0, seconds: 0}).add(-7, 'days');
    this.form = new FormGroup({
      startDate: new FormControl(startDate),
      endDate: new FormControl(endDate),
    });
  }

ngOnInit(): void {
    const startDate = moment(this.form.controls.startDate.value).toDate();
    const endDate = moment(this.form.controls.endDate.value).add(1, 'days').add(-1, 'seconds').toDate();
    this.getStatistics(startDate, endDate);
  }

  public ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

getStatistics(startDate: Date, endDate: Date): void {
    this.statisticsService
      .getStatistics(this.getTicks(startDate), this.getTicks(endDate))
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(resp => {
        this.statistics = resp.body;
        this.getData();
        this.xAxis = {
          title: 'Date Time',
          valueType: 'DateTime',
          labelFormat: 'EEEE',
          minimum: startDate,
          maximum: endDate,
          interval: 1,
          intervalType: 'Days'
        };
        this.yAxis = {
          title: 'Duration',
          valueType: 'DateTime',
          intervalType: 'Minutes'
        };
      },
      (error) => this.toastr.error(error.Message));
  }

  getTicks(date: Date): number {
    return ((date.getTime() * 10000) + 621355968000000000);
  }


  getData(): void{
    switch (this.statisticField) {
      case StatisticFields.Call: {
        switch (this.aggregation) {
          case Aggregations.Min: {
            this.data = this.statistics.map((s) => {
              return {
                date: new Date(s.date.valueAsString),
                value: this.getDate(s.minDuration.value)
              };
            });
            break;
          }
          case Aggregations.Average: {
            this.data = this.statistics.map((s) => {
              return {
                date: new Date(s.date.valueAsString),
                value: this.getDate(s.avgDuration.value)
              };
            });
            break;
          }
          case Aggregations.Max: {
            this.data = this.statistics.map((s) => {
              return {
                date: new Date(s.date.valueAsString),
                value: this.getDate(s.maxDuration.value)
              };
            });
            break;
          }
        }
        break;
      }
      case StatisticFields.Presence: {
        switch (this.aggregation) {
          case Aggregations.Min: {
            this.data = this.statistics.map((s) => {
              return {
                date: new Date(s.date.valueAsString),
                value: this.getDate(s.minPresence.value)
              };
            });
            break;
          }
          case Aggregations.Average: {
            this.data = this.statistics.map((s) => {
              return {
                date: new Date(s.date.valueAsString),
                value: this.getDate(s.avgPresence.value)
              };
            });
            break;
          }
          case Aggregations.Max: {
            this.data = this.statistics.map((s) => {
              return {
                date: new Date(s.date.valueAsString),
                value: this.getDate(s.maxPresence.value)
              };
            });
            break;
          }
        }
        break;
      }
      case StatisticFields.Speech: {
        switch (this.aggregation) {
          case Aggregations.Min: {
            this.data = this.statistics.map((s) => {
              return {
                date: new Date(s.date.valueAsString),
                value: this.getDate(s.minSpeech.value)
              };
            });
            break;
          }
          case Aggregations.Average: {
            this.data = this.statistics.map((s) => {
              return {
                date: new Date(s.date.valueAsString),
                value: this.getDate(s.avgSpeech.value)
              };
            });
            break;
          }
          case Aggregations.Max: {
            this.data = this.statistics.map((s) => {
              return {
                date: new Date(s.date.valueAsString),
                value: this.getDate(s.maxSpeech.value)
              };
            });
            break;
          }
        }
        break;
      }
    }
    this.chartTitle = `${Aggregations[this.aggregation]} ${StatisticFields[this.statisticField]} duration`;
  }

  changeAggregation(value: string): void{
    this.aggregation = Number(value);
    this.getData();
  }

  changeField(value: string): void{
    this.statisticField = Number(value);
    this.getData();
  }

  getDate(ms: number): Date {
    const d = new Date();
    d.setHours(0);
    d.setMinutes(0);
    d.setSeconds(0);
    d.setMilliseconds(ms);
    return d;
  }

  createStringFromDate(date: Date): string {
    let pieces: string[] = [];
    pieces.push(`${date.getDate()}`);
    pieces.push(`${date.getMonth() + 1}`);
    pieces.push(`${date.getFullYear()}`);
    pieces = pieces.map((piece) => {
      if (piece.length === 1) {
        return '0' + piece;
      } else {
        return piece;
      }
    });

    return pieces.join('/');
  }

  submit(): void{
    const startDate = moment(this.form.controls.startDate.value).toDate();
    const endDate = moment(this.form.controls.endDate.value).add(1, 'days').add(-1, 'seconds').toDate();
    let isOutOfRange = true;
    if (this.data.length > 1) {
      const startCachedDate = this.data[0].date;
      const endCachedDate = new Date(this.data[this.data.length - 1].date);
      endCachedDate.setDate(endCachedDate.getDate() + 1);
      if (startDate >= startCachedDate && endDate <= endCachedDate){
        this.xAxis = {
          title: 'Date Time',
          valueType: 'DateTime',
          labelFormat: 'EEEE',
          minimum: startDate,
          maximum: endDate,
          interval: 1,
          intervalType: 'Days'
        };
        isOutOfRange = false;
      }
    }
    if (isOutOfRange) {
      this.getStatistics(startDate, endDate);
    }
  }

  public close(): void {
    this.statisticsClose.emit();
  }
}
