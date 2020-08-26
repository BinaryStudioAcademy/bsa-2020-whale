import { Directive, Input, ElementRef, OnInit } from '@angular/core';

@Directive({
  selector: '[appHighlightCreator]',
})
export class HighlightCreatorDirective implements OnInit {
  @Input() userEmail: string;
  @Input() creatorEmail: string;

  element: ElementRef;

  constructor(element: ElementRef) {
    this.element = element;
  }

  ngOnInit(): void {
    this.highlight();
  }

  private highlight(): void {
    if (this.creatorEmail === this.userEmail) {
      this.element.nativeElement.style.fontWeight = 'bold';
    }
  }
}
