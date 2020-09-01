import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  HostListener,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { User } from '@shared/models/user/user';
import { Meeting } from '@shared/models/meeting/meeting';
import { HttpService } from 'app/core/services/http.service';
import { environment } from '@env';
import { HttpParams } from '@angular/common/http';
import { timeStamp } from 'console';
import { ThrowStmt } from '@angular/compiler';

@Component({
  selector: 'app-history',
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.sass'],
})
export class HistoryComponent implements OnInit {
  public route = environment.apiUrl + '/api/meetingHistory';

  @Input() user: User;
  @Output() historyClose: EventEmitter<void> = new EventEmitter<void>();
  @ViewChild('scrollable') scrollElement: ElementRef;
  public meetings: Meeting[] = [];

  public take = 10;

  public isScrolled = false;
  public isMeetingHistoryEmpty = false;
  public ishistoryLoading = true;
  public requestSent = false;
  public allDataLoaded = false;

  constructor(private httpService: HttpService) {}

  ngOnInit(): void {
    this.getSomeMeetings();
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

  public scrollToTop(): void {
    this.scrollElement.nativeElement.scrollTo({ top: 0, behavior: 'smooth' });
  }

  public getSomeMeetings(): void {
    if (this.allDataLoaded) {
      return;
    }

    const params = new HttpParams()
      .set('userId', this.user.id)
      .set('skip', `${this.meetings.length}`)
      .set('take', `${this.take}`);

    this.ishistoryLoading = true;
    this.httpService.getRequest<Meeting[]>(this.route, params).subscribe(
      (response) => {
        if (response.length === 0 && this.meetings.length === 0) {
          this.isMeetingHistoryEmpty = true;
        }

        this.meetings = this.meetings.concat(response);
        this.ishistoryLoading = false;
        if (response.length === 0) {
          this.allDataLoaded = true;
        }
        this.requestSent = false;
      },
      (error) => {
        this.ishistoryLoading = false;
        this.requestSent = false;
      }
    );
  }

  public close(): void {
    this.historyClose.emit();
  }
}
