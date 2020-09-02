import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpService } from './http.service';
import { UpstateService } from './upstate.service';
import {
  MeetingSignalrService,
  SignalMethods,
} from './meeting-signalr.service';
import { Subject } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { first } from 'rxjs/operators';
import { Question } from '../../shared/models/question/question';
import { UserData } from '../../shared/models/question/user-data';
import { User } from '../../shared/models/user';
import { QuestionCreate } from '../../shared/models/question/question-create';
import { QuestionStatusUpdate } from '@shared/models/question/question-status-update';
import { QuestionDelete } from '@shared/models/question/question-delete';
import { HttpParams } from '@angular/common/http';
import { QuestionStatus } from '@shared/models/question/question-status';

@Injectable({
  providedIn: 'root',
})
export class QuestionService {
  private route = environment.apiUrl + '/api/questions';

  public questions: Question[] = [];
  public currentUser: User;

  public isNewQuestion = false;
  public areQuestionsOpened = false;

  constructor(
    private meetingSignalrService: MeetingSignalrService,
    private httpService: HttpService,
    private toastr: ToastrService,
    private upstateService: UpstateService
  ) {
    this.upstateService.getLoggedInUser().subscribe(
      (user) => {
        this.currentUser = user;
      },
      (error) => {
        console.error(error);
      }
    );

    this.meetingSignalrService.questionCreated$.subscribe(
      (question: Question) => {
        this.addQuestion(question);
        this.isNewQuestion = !this.areQuestionsOpened;
      },
      (error) => {
        console.error(error);
      }
    );

    this.meetingSignalrService.questionStatusUpdated$.subscribe(
      (questionStatusUpdate: QuestionStatusUpdate) => {
        this.updateQuestionStatus(questionStatusUpdate);
      },
      (error) => {
        console.error(error);
      }
    );

    this.meetingSignalrService.questionDeleted$.subscribe(
      (questionToDelete: QuestionDelete) => {
        this.deleteQuestion(questionToDelete);
      },
      (error) => {
        console.error(error);
      }
    );
  }

  public notifyNewQuestion(question: Question): void {
    if (question.asker.userId === this.currentUser.id) {
      return;
    }
  }

  public addQuestion(question: Question): void {
    this.questions.push(question);
    this.isNewQuestion = true;
  }

  public updateQuestionStatus(
    questionStatusUpdate: QuestionStatusUpdate
  ): void {
    const question = this.questions.find(
      (q) => q.id === questionStatusUpdate.questionId
    );
    if (!question) {
      return;
    }
    question.questionStatus = questionStatusUpdate.questionStatus;
    if (question.questionStatus === QuestionStatus.Answering) {
      this.toastr.info(question.text, 'Host is answering question:');
    }
  }

  public deleteQuestion(questionDelete: QuestionDelete): void {
    this.questions = this.questions.filter(
      (q) => q.id !== questionDelete.questionId
    );
  }

  private generateUserData(): UserData {
    const userData: UserData = {
      userId: this.currentUser.id,
      firstName: this.currentUser.firstName,
      secondName: this.currentUser.secondName,
      avatarUrl: this.currentUser.avatarUrl,
    };

    return userData;
  }

  public getQuestionsByMeeting(meetingId: string): void {
    this.httpService
      .getRequest<Question[]>(
        this.route,
        new HttpParams().set('meetingId', meetingId)
      )
      .subscribe(
        (questions: Question[]) => {
          this.questions = questions;
        },
        (error) => {
          console.error(error);
        }
      );
  }

  public sendQuestionCreate(meetingId, questionText: string): void {
    const newQuestion: QuestionCreate = {
      meetingId,
      asker: this.generateUserData(),
      text: questionText,
    };

    this.httpService
      .postRequest<QuestionCreate, any>(this.route, newQuestion)
      .subscribe(
        () => {},
        (error) => {
          console.error(error);
        }
      );
  }

  public sendQuestionStatusUpdate(question: Question): void {
    const questionStatusUpdate: QuestionStatusUpdate = {
      meetingId: question.meetingId,
      questionId: question.id,
      questionStatus: question.questionStatus,
    };

    this.httpService
      .putRequest<QuestionStatusUpdate, any>(
        `${this.route}/status`,
        questionStatusUpdate
      )
      .subscribe(
        () => {},
        (error) => {
          console.error(error);
        }
      );
  }

  public sendQuestionDelete(question: Question): void {
    const questionDelete: QuestionDelete = {
      meetingId: question.meetingId,
      questionId: question.id,
    };

    this.httpService
      .deleteRequest(
        `${this.route}/${questionDelete.questionId}`,
        new HttpParams().set('meetingId', questionDelete.meetingId)
      )
      .subscribe(
        () => {},
        (error) => {
          console.error(error);
        }
      );
  }
}
