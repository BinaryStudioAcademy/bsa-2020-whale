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

  public totalVotes: number = 0;

  get totalVoted(): number {
    return this.pollResult.isAnonymous
      ? this.getTotalVotedOfAnonymousPoll()
      : this.pollResult.votedUsers?.length;
  }

  constructor() {}

  ngOnInit(): void {
    this.answers = this.pollResult.optionResults.map((optRes) => optRes.option);
    this.pollResult.optionResults
      .map((optRes) => optRes.votedUserIds.length)
      .forEach((length) => (this.totalVotes += length));
  }

  public calculatePercentage(index: number) {
    if (this.totalVotes == 0) {
      return 0;
    }
    return Math.round(
      (this.pollResult.optionResults[index].votedUserIds.length * 100) /
        this.totalVotes
    );
  }

  public getTotalVotedOfAnonymousPoll() {
    let votedUsers: string[] = [];
    this.pollResult.optionResults
      .map((oR) => oR.votedUserIds)
      .forEach((ids) => (votedUsers = votedUsers.concat(ids)));

    const distinctVotedUsers = new Set(votedUsers);
    return distinctVotedUsers.size;
  }

  public getVoter(id: string) {
    return this.pollResult.votedUsers.find((voter) => voter.id == id);
  }
}
