import { Component, OnInit, Input } from '@angular/core';
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
  public meetings: Meeting[] = [];

  public take: number = 10;

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

    this.httpService.getRequest<Meeting[]>(this.route, params).subscribe(
      (response) => {
        this.meetings = this.meetings.concat(response);
        console.log(this.meetings);
      },
      (error) => console.error(error)
    );
  }
}
