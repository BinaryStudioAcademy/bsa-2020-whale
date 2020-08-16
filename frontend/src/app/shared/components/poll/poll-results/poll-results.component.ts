import { Component, OnInit, Input } from '@angular/core';
import { PollResultDto } from '@shared/models/poll/poll-result-dto';

@Component({
  selector: 'app-poll-results',
  templateUrl: './poll-results.component.html',
  styleUrls: ['./poll-results.component.sass'],
})
export class PollResultsComponent implements OnInit {
  @Input() pollResult: PollResultDto;
  public answers: string[];

  public total: number;

  constructor() {}

  ngOnInit(): void {
    this.answers = this.pollResult.optionResults.map((optRes) => optRes.option);
  }

  public calculatePercentage(index: number) {
    return Math.round(
      (this.pollResult.optionResults[index].voteCount * 100) /
        this.pollResult.voteCount
    );
  }
}
