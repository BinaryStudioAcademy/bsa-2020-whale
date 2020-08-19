import { Injectable } from '@angular/core';
import { PollDto } from '../../shared/models/poll/poll-dto';
import { PollResultDto } from '../../shared/models/poll/poll-result-dto';
import { PollsAndResultsDto } from '../../shared/models/poll/polls-and-results-dto';
import { PollCreateDto } from '../../shared/models/poll/poll-create-dto';
import { PollData } from '../../shared/models/poll/poll-data';
import {
  MeetingSignalrService,
  SignalMethods,
} from './meeting-signalr.service';
import { HttpService } from './http.service';
import { environment } from '../../../environments/environment';
import { HttpParams } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PollService {
  private route = environment.apiUrl + '/api/polls';

  public polls: PollDto[] = [];
  public pollResults: PollResultDto[] = [];

  public isPollCreating = false;
  public isShowPoll = false;
  public isShowPollResults = false;

  constructor(
    private meetingSignalrService: MeetingSignalrService,
    private httpService: HttpService,
    private toastr: ToastrService,
    private unsubscribe$: Subject<void>
  ) {
    this.meetingSignalrService.pollReceived$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((poll: PollDto) => {
        this.onPollReceived(poll);
      });

    this.meetingSignalrService.pollResultReceived$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((pollResultDto: PollResultDto) => {
        this.onPollResultReceived(pollResultDto);
      });

    this.meetingSignalrService.pollDeleted$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((pollId: string) => {
        this.onPollDeleted(pollId);
      });
  }

  public getPollsAndResults(meetingId: string, userEmail: string) {
    const httpParams = new HttpParams()
      .set('meetingId', meetingId)
      .set('userEmail', userEmail);

    this.httpService
      .getRequest<PollsAndResultsDto>(
        environment.meetingApiUrl + '/api/polls',
        httpParams
      )
      .subscribe((pollsAndResults: PollsAndResultsDto) => {
        this.polls = pollsAndResults.polls;
        this.pollResults = pollsAndResults.results;
      });
  }

  public onPollCreated(
    pollCreateDto: PollCreateDto,
    meetingId: string,
    userEmail: string
  ) {
    this.httpService
      .postRequest<PollCreateDto, PollDto>(
        environment.meetingApiUrl + '/api/polls',
        pollCreateDto
      )
      .subscribe(
        (response: PollDto) => {
          const pollData: PollData = {
            userId: userEmail,
            groupId: meetingId,
            pollDto: response,
          };

          this.meetingSignalrService.invoke(
            SignalMethods.OnPollCreated,
            pollData
          );

          this.isPollCreating = false;
          this.toastr.success('Poll was created!', 'Success');
        },
        (error) => {
          this.toastr.error(error);
        }
      );
  }

  public onPollReceived(poll: PollDto) {
    this.polls.push(poll);
    this.isShowPoll = true;
  }

  public onPollAnswered(poll: PollDto) {
    const pollIndex = this.polls.findIndex((p) => p.id == poll.id);
    this.polls.splice(pollIndex, 1);
  }

  public onPollResultReceived(pollResultDto: PollResultDto) {
    const pollResultIndex = this.pollResults.findIndex(
      (result) => result.pollId == pollResultDto.pollId
    );
    if (pollResultIndex != -1) {
      this.pollResults[pollResultIndex] = pollResultDto;
    } else {
      this.pollResults.push(pollResultDto);
    }
  }

  public onPollDeleted(pollId: string) {
    const pollIndex = this.polls.findIndex((poll) => poll.id == pollId);
    if (pollIndex != -1) {
      this.polls.splice(pollIndex, 1);
    }

    const resultIndex = this.pollResults.findIndex(
      (result) => result.pollId == pollId
    );
    if (resultIndex != -1) {
      this.pollResults.splice(resultIndex, 1);
    }
  }

  public savePollResults(meetindId: string) {
    this.httpService
      .getRequest(
        this.route + '/saveResults',
        new HttpParams().set('meetingId', meetindId)
      )
      .subscribe(
        () => {},
        (error) => console.error(error)
      );
  }

  public onPollIconClick() {
    this.isPollCreating = false;
    this.isShowPoll = !this.isShowPoll;
  }

  public onNewPollClick() {
    this.isShowPoll = false;
    this.isPollCreating = true;
  }

  public onDeletePollIconClick(poll: PollDto) {
    const httpParams = new HttpParams()
      .set('pollId', poll.id)
      .set('meetingId', poll.meetingId);

    this.httpService.deleteRequest(this.route, httpParams).subscribe(() => {
      // spinner
      this.toastr.success('Poll deleted', 'Success');
    });
  }

  public onDeletePollResultIconClick(
    pollResult: PollResultDto,
    meetingId: string
  ) {
    const httpParams = new HttpParams()
      .set('pollId', pollResult.pollId)
      .set('meetingId', meetingId);

    this.httpService.deleteRequest(this.route, httpParams).subscribe(() => {
      // spinner
      this.toastr.success('Poll deleted', 'Success');
    });
  }
}
