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
  @Input() user: User;
  public meetings: Meeting[];

  constructor(private httpService: HttpService) {}

  ngOnInit(): void {
    console.log(this.user);
    const apiUrl = environment.apiUrl + '/api/meetingHistory';
    const params = new HttpParams().set('userId', this.user.id);
    this.httpService.getRequest<Meeting[]>(apiUrl, params).subscribe(
      (response) => {
        this.meetings = response;
        console.log(this.meetings);
      },
      (error) => console.error(error)
    );
  }
}
