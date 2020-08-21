import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { User } from '@shared/models/user/user';
import { Meeting } from '@shared/models/meeting/meeting';
import { HttpService } from 'app/core/services/http.service';
import { environment } from '@env';
import { HttpParams } from '@angular/common/http';

@Component({
  selector: 'app-history',
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.sass'],
})
export class HistoryComponent implements OnInit {
  public route = environment.apiUrl + '/api/meetingHistory';

  @Input() user: User;
  @Output() historyClose: EventEmitter<void> = new EventEmitter<void>();
  public meetings: Meeting[] = [];

  public take: number = 10;
  public ishistoryLoading: boolean = true;

  constructor(private httpService: HttpService) {}

  ngOnInit(): void {
    this.getSomeMeetings();
  }

  public onScroll() {
    this.getSomeMeetings();
  }

  public scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  public getSomeMeetings(): void {
    const params = new HttpParams()
      .set('userId', this.user.id)
      .set('skip', `${this.meetings.length}`)
      .set('take', `${this.take}`);

    this.ishistoryLoading = true;
    this.httpService.getRequest<Meeting[]>(this.route, params).subscribe(
      (response) => {
        this.meetings = this.meetings.concat(response);
        this.ishistoryLoading = false;
      },
      (error) => console.error(error)
    );
  }

  public close(): void {
    this.historyClose.emit();
  }
}
