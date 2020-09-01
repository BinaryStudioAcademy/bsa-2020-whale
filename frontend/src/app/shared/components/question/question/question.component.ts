import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Question } from '@shared/models/question/question';
import { FormGroup, FormControl, AbstractControl } from '@angular/forms';
import { QuestionStatus } from '@shared/models/question/question-status';

@Component({
  selector: 'app-question',
  templateUrl: './question.component.html',
  styleUrls: ['./question.component.sass'],
})
export class QuestionComponent implements OnInit {
  @Input() question: Question;
  @Input() isHost = false;
  @Output() statusChanged = new EventEmitter<Question>();
  @Output() questionDeleted = new EventEmitter<Question>();

  public textRows: string[];

  constructor() {}

  ngOnInit(): void {
    this.textRows = this.splitMessage(this.question.text);
  }

  public markAnswering(): void {
    this.question.questionStatus = QuestionStatus.Answering;
    this.statusChanged.emit(this.question);
  }

  public markAnswered(): void {
    this.question.questionStatus = QuestionStatus.Answered;
    this.statusChanged.emit(this.question);
  }

  public markDismissed(): void {
    this.question.questionStatus = QuestionStatus.Dismissed;
    this.statusChanged.emit(this.question);
  }

  public deleteQuestion(): void {
    this.questionDeleted.emit(this.question);
  }

  public splitMessage(message: string): string[] {
    return message.split(/\n/gi);
  }
}
