import { Component, OnInit, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { ScheduledMeeting } from '@shared/models';
import { HttpService } from 'app/core/services';
import { HttpParams } from '@angular/common/http';
import { environment } from '@env';


@Component({
  selector: 'app-upcoming-meetings',
  templateUrl: './upcoming-meetings.component.html',
  styleUrls: ['./upcoming-meetings.component.sass']
})
export class UpcomingMeetingsComponent implements OnInit {
  private route = environment.apiUrl + '/scheduledMeeting';

  @Output() upcomingClose: EventEmitter<void> = new EventEmitter<void>();
  @ViewChild('scrollable') scrollElement: ElementRef;
  public meetings: ScheduledMeeting[] = [];

  public take = 10;

  public isScrolled = false;
  public isUpcomingMeetingEmpty = false;
  public isUpcomingLoading = true;
  public requestSent = false;
  public allDataLoaded = false;

  constructor(private httpService: HttpService) { }

  ngOnInit(): void {
    this.getSomeMeetings();
  }

  public scrollToTop(): void {
    this.scrollElement.nativeElement.scrollTo({ top: 0, behavior: 'smooth' });
  }

  public getSomeMeetings(): void {
    if (this.allDataLoaded) {
      return;
    }

    const params = new HttpParams()
      .set('skip', `${this.meetings.length}`)
      .set('take', `${this.take}`);

    this.isUpcomingLoading = true;
    this.httpService.getRequest<ScheduledMeeting[]>(`${this.route}/all`, params).subscribe(
      (response) => {
        if (response.length === 0 && this.meetings.length === 0) {
          this.isUpcomingMeetingEmpty = true;
        }

        this.meetings = this.meetings.concat(response);
        this.isUpcomingLoading = false;
        if (response.length === 0) {
          this.allDataLoaded = true;
        }
        this.requestSent = false;
      },
      (error) => {
        this.isUpcomingLoading = false;
        this.requestSent = false;
      }
    );
  }

  public onScroll(): void {
    if (this.scrollElement.nativeElement.scrollTop >= 100) {
      this.isScrolled = true;
    } else {
      this.isScrolled = false;
    }
    if (this.requestSent) {
      return;
    }
    this.requestSent = true;
    this.getSomeMeetings();
  }

  public close(): void {
    this.upcomingClose.emit();
  }
}
