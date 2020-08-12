import { Component, OnInit, Input } from '@angular/core';
import { PollResultsDto } from '@shared/models/poll/poll-results-dto';

@Component({
  selector: 'app-poll-results',
  templateUrl: './poll-results.component.html',
  styleUrls: ['./poll-results.component.sass'],
})
export class PollResultsComponent implements OnInit {
  @Input() pollResults: PollResultsDto;
  public answers: string[];

  public total: number;

  constructor() {}

  ngOnInit(): void {
    this.answers = Object.keys(this.pollResults.results);
  }
}
