import { Component, Output, EventEmitter } from '@angular/core';
import { ReactionsEnum } from '@shared/models';

@Component({
  selector: 'app-reactions',
  templateUrl: './reactions.component.html',
  styleUrls: ['./reactions.component.sass']
})
export class ReactionsComponent {
  @Output() reaction: EventEmitter<ReactionsEnum> = new EventEmitter<ReactionsEnum>();
  public userTimeUnix: number;
  public meetingTimeUnix: number;
  public reactionsEnum = ReactionsEnum;
  constructor() { }

  public onReactionClick(reaction: ReactionsEnum): void {
    this.reaction.emit(reaction);
  }
}
