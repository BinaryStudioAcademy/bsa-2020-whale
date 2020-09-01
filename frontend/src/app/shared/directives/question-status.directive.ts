import {
  Directive,
  Input,
  ElementRef,
  OnInit,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { QuestionStatus } from '@shared/models/question/question-status';

@Directive({
  selector: '[appQuestionStatus]',
})
export class QuestionStatusDirective implements OnChanges {
  @Input('appQuestionStatus') questionStatus: QuestionStatus;

  constructor(private statusIcon: ElementRef<HTMLDivElement>) {}
  ngOnChanges(changes: SimpleChanges): void {
    let iconClass: string;
    switch (this.questionStatus) {
      case QuestionStatus.Created:
        iconClass = 'grey pen square';
        break;

      case QuestionStatus.Answering:
        iconClass = 'blue podcast';
        break;

      case QuestionStatus.Answered:
        iconClass = 'green check';
        break;

      case QuestionStatus.Dismissed:
        iconClass = 'orange times';
        break;
    }

    this.statusIcon.nativeElement.firstElementChild.className = `ui icon ${iconClass} circle`;
    this.statusIcon.nativeElement.lastElementChild.innerHTML =
      QuestionStatus[this.questionStatus];
  }
}
