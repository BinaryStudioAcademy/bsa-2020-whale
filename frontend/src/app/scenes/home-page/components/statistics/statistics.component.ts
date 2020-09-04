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

  statistics: any;

  private unsubscribe$ = new Subject<void>();

  constructor(
    private statisticsService: StatisticsService,
    private toastr: ToastrService,
  ) { }

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
      },
      (error) => this.toastr.error(error.Message));
  }

  public close(): void {
    this.statisticsClose.emit();
  }
}
