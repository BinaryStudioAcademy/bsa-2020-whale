import { Component, OnInit, EventEmitter, Input, ElementRef, ViewChild, Output } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { PointAgenda } from '@shared/models/agenda/agenda';
import { HttpService, MeetingSignalrService, SignalMethods, MeetingService } from 'app/core/services';
import { environment } from '@env';
import { takeUntil } from 'rxjs/internal/operators/takeUntil';
import { Subject } from 'rxjs/internal/Subject';
import { threadId } from 'worker_threads';

@Component({
  selector: 'app-agenda',
  templateUrl: './agenda.component.html',
  styleUrls: ['./agenda.component.sass'],
})
export class AgendaComponent implements OnInit {
  constructor() {
  }
  @Input() agenda: PointAgenda[] = [];
  cachedTopics: PointAgenda[] = [];
  ngOnInit(): void {
  }

}
