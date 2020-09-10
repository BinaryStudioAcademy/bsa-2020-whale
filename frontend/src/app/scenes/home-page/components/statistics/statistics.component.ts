import { Component, OnInit, Output, EventEmitter, Input, OnDestroy } from '@angular/core';
import { User, UserMeetingStatistics } from '@shared/models';
import { StatisticsService } from 'app/core/services';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { IDatePickerConfig } from 'ng2-date-picker';
import { FormGroup, FormControl } from '@angular/forms';
import moment, { Moment } from 'moment';

enum StatisticFields {
  Call,
  Speech,
  Presence,
  Count
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

  configStart: IDatePickerConfig = {
    weekDayFormat: 'dd',
    firstDayOfWeek: 'mo',
    showNearMonthDays: false,
    max: moment({hour: 0, minute: 0, seconds: 0}).add(-1, 'days'),
    monthBtnCssClassCallback: (month) => 'ng2-date-picker-button',
    dayBtnCssClassCallback: (day) => 'ng2-date-picker-button',
  };

  configEnd: IDatePickerConfig = {
    weekDayFormat: 'dd',
    firstDayOfWeek: 'mo',
    showNearMonthDays: false,
    max: moment({hour: 0, minute: 0, seconds: 0}),
    monthBtnCssClassCallback: (month) => 'ng2-date-picker-button',
    dayBtnCssClassCallback: (day) => 'ng2-date-picker-button',
  };

  public form: FormGroup;

  statistics: UserMeetingStatistics[];
  allTimeStatistics: UserMeetingStatistics;
  private unsubscribe$ = new Subject<void>();

  chartData: any[];
  statisticField = StatisticFields.Call;
  minDate: Date;
  maxDate: Date;

  startDate: Moment;
  endDate: Moment;
  isLoading = true;
  xAxisTicks: Date[] = [new Date()];

constructor(
    private statisticsService: StatisticsService,
  ) {
    const endDate = moment({hour: 0, minute: 0, seconds: 0});
    this.endDate = moment(endDate);
    const startDate = moment({hour: 0, minute: 0, seconds: 0}).add(-7, 'days');
    this.startDate = moment(startDate);
    this.form = new FormGroup({
      startDate: new FormControl(startDate),
      endDate: new FormControl(endDate),
    });
  }

  ngOnInit(): void {
    this.getAllTimeStatistics();
    this.submit();
  }

  public ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  getAllTimeStatistics(): void {
    this.statisticsService
      .getAllTimeStatistics()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(resp => {
        this.allTimeStatistics = resp.body;
        this.isLoading = false;
      },
      (error) => {
        this.allTimeStatistics = null;
        this.isLoading = false;
      });
  }

  getStatistics(startDate: Date, endDate: Date): void {
    this.statisticsService
      .getStatistics(this.getTicks(startDate), this.getTicks(endDate))
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(resp => {
        this.statistics = resp.body;
        if (this.statistics.length > 0){
          this.getData();
        } else {
          this.chartData = null;
        }
      },
      (error) => (this.chartData = null));
  }

  getTicks(date: Date): number {
    return ((date.getTime() * 10000) + 621355968000000000);
  }

  getData(): void{
    let updatedData;
    switch (this.statisticField) {
      case StatisticFields.Call: {
        updatedData = [
          {
            name: 'Max call duration',
            series: this.statistics.map((s) => {
              return {
                name: moment(s.date.valueAsString).toDate(),
                value: s.maxDuration.value
              };
            })
          },
          {
            name: 'Average call duration',
            series: this.statistics.map((s) => {
              return {
                name: moment(s.date.valueAsString).toDate(),
                value: s.avgDuration.value
              };
            })
          },
          {
            name: 'Min call duration',
            series: this.statistics.map((s) => {
              return {
                name: moment(s.date.valueAsString).toDate(),
                value: s.minDuration.value
              };
            })
          }
        ];
        break;
      }
      case StatisticFields.Presence: {
        updatedData = [
          {
            name: 'Max presence duration',
            series: this.statistics.map((s) => {
              return {
                name: moment(s.date.valueAsString).toDate(),
                value: s.maxPresence.value
              };
            })
          },
          {
            name: 'Average presence duration',
            series: this.statistics.map((s) => {
              return {
                name: moment(s.date.valueAsString).toDate(),
                value: s.avgPresence.value
              };
            })
          },
          {
            name: 'Min presence duration',
            series: this.statistics.map((s) => {
              return {
                name: moment(s.date.valueAsString).toDate(),
                value: s.minPresence.value
              };
            })
          }
        ];
        break;
      }
      case StatisticFields.Speech: {
        updatedData = [
          {
            name: 'Max speech duration',
            series: this.statistics.map((s) => {
              return {
                name: moment(s.date.valueAsString).toDate(),
                value: s.maxSpeech.value
              };
            })
          },
          {
            name: 'Average speech duration',
            series: this.statistics.map((s) => {
              return {
                name: moment(s.date.valueAsString).toDate(),
                value: s.avgSpeech.value
              };
            })
          },
          {
            name: 'Min speech duration',
            series: this.statistics.map((s) => {
              return {
                name: moment(s.date.valueAsString).toDate(),
                value: s.minSpeech.value
              };
            })
          }
        ];
        break;
      }
      case StatisticFields.Count: {
        updatedData = [
          {
            name: 'Number of calls',
            series: this.statistics.map((s) => {
              return {
                name: moment(s.date.valueAsString).toDate(),
                value: s.docCount.value
              };
            })
          }
        ];
        break;
      }
    }
    this.chartData = [...updatedData];
  }

  changeField(value: string): void{
    this.statisticField = Number(value);
    this.getData();
  }

  submit(): void{
    const startDate = moment(this.form.controls.startDate.value).toDate();
    const endDate = moment(this.form.controls.endDate.value).add(1, 'days').add(-1, 'seconds').toDate();
    this.minDate = moment(this.form.controls.startDate.value).add(-6, 'hours').toDate();
    this.maxDate = moment(this.form.controls.endDate.value).add(6, 'hours').toDate();
    this.calculateTicks();
    let isOutOfRange = true;
    if (this.statistics != null && this.statistics.length > 0) {
      const startCachedDate = new Date(this.statistics[0].date.valueAsString);
      const endCachedDate = new Date(this.statistics[this.statistics.length - 1].date.valueAsString);
      endCachedDate.setDate(endCachedDate.getDate() + 1);
      if (startDate >= startCachedDate && endDate <= endCachedDate){
        isOutOfRange = false;
      }
    }
    if (isOutOfRange) {
      this.getStatistics(startDate, endDate);
    }
  }

  calculateTicks(){
    let startMoment = moment(this.form.controls.startDate.value);
    const endMoment = moment(this.form.controls.endDate.value);
    const diffDays = endMoment.diff(startMoment, 'days');
    const step = (Math.ceil(diffDays / 10));
    const ticks = [startMoment.toDate()];
    do {
      if (step === 0){
        break;
      }
      startMoment = startMoment.add(step, 'days');
      ticks.push(startMoment.toDate());
    } while (startMoment <= endMoment);
    this.xAxisTicks = [... ticks];
  }

  dateTickFormatting(val: Date): string {
      const options = { weekday: 'short', month: 'short', day: 'numeric' };
      return val.toLocaleDateString('en-US', options);
  }

  valueDateTickFormatting(val: number): string {
    function pad(num: number, size: number): string {
      const s = '000000000' + num;
      return s.substr(s.length - size);
    }
    let dayString = '';
    let temp = Math.floor(val / 1000);
    const day = Math.floor(temp / 86400);
    if (day > 0){
      dayString = `${day}d `;
    }
    temp %= 86400;
    const hours = pad(Math.floor(temp / 3600), 2);
    temp %= 3600;
    const minutes = pad(Math.floor(temp / 60), 2);
    const seconds = pad(temp % 60, 2);
    return `${dayString}${hours}:${minutes}:${seconds}`;
  }

  valueTickFormatting(val: number): string{
    return val.toString();
  }

  changeStartDate(val: Moment): void {
    if (val === undefined){
      this.form.controls.startDate.setValue(this.startDate);
    } else{
      this.startDate = val;
    }
  }

  changeEndDate(val: Moment): void {
    if (val === undefined){
      this.form.controls.endDate.setValue(this.endDate);
    } else{
      this.endDate = val;
    }
  }

  public close(): void {
    this.statisticsClose.emit();
  }
}
