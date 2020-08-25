import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-email-tag',
  templateUrl: './email-tag.component.html',
  styleUrls: ['./email-tag.component.sass'],
})
export class EmailTagComponent implements OnInit {
  @Input() email: string;
  @Output() tagRemoved = new EventEmitter<string>();

  constructor() {}

  ngOnInit(): void {}

  public removeTag() {
    this.tagRemoved.emit(this.email);
  }
}
