import {
  Component,
  OnInit,
  Input,
  ElementRef,
  Output,
  EventEmitter,
} from '@angular/core';
import { UserMediaData } from '@shared/models/media/user-media-data';
import { createPopper } from '@popperjs/core';
import flip from '@popperjs/core/lib/modifiers/flip.js';

@Component({
  selector: 'app-participant-card',
  templateUrl: './participant-card.component.html',
  styleUrls: ['./participant-card.component.sass'],
})
export class ParticipantCardComponent implements OnInit {
  @Input() data: UserMediaData;
  @Output() pinVideEvent = new EventEmitter<string>();
  @Output() hideViewEvent = new EventEmitter<string>();
  @Output() stopVideoEvent = new EventEmitter<string>();
  @Output() toggleCameraEvent = new EventEmitter<string>();
  @Output() toggleMicrophoneEvent = new EventEmitter<string>();

  public actionsIcon: HTMLElement;
  public actionsPopupContent: HTMLElement;
  public actionsPopup: any;
  public shouldShowActions = false;
  public isMicrophoneHovered = false;
  public isParticipantMuted: boolean;
  public hasParticipantVideo: boolean;
  private video: HTMLVideoElement;
  private participantContainer: HTMLElement;
  private participantName: HTMLElement;

  constructor(private elRef: ElementRef) {}

  public ngOnInit(): void {
    this.initCardElements();
    this.updateMediData();
    this.handleActionsPopup();
    this.handleStreamChanges();
  }

  public toggleMicrophone(): void {
    this.toggleMicrophoneEvent.emit(this.data.id);
  }

  public toggleCamera(): void {
    this.toggleCameraEvent.emit(this.data.id);
  }

  public pinVideo(): void {
    this.pinVideEvent.emit(this.data.id);
  }

  public hideCurrentCard(): void {
    this.hideViewEvent.emit(this.data.id);
  }

  public addAvatar() {
    if (this.data.avatarUrl) {
      this.participantContainer.style.background = `url(${this.data.avatarUrl})`;
      this.participantContainer.style.backgroundSize = 'contain';
      this.participantContainer.style.backgroundRepeat = 'no-repeat';
      this.participantContainer.style.backgroundPosition = 'center';
    } else {
      var participantInitials = this.elRef.nativeElement.querySelector(
        '.participant-initials'
      );
      participantInitials.textContent = `${this.data.userFirstName.slice(
        0,
        1
      )} ${this.data.userLastName?.slice(0, 1)}`;
    }
  }

  private initCardElements(): void {
    this.video = this.elRef.nativeElement.querySelector('video');
    this.participantContainer = this.elRef.nativeElement.querySelector(
      '.image'
    );
    this.participantName = this.elRef.nativeElement.querySelector('.header');
    this.actionsIcon = this.elRef.nativeElement.querySelector(
      '.small.blue.ellipsis.vertical.icon'
    );
    this.actionsPopupContent = this.data.isCurrentUser
      ? this.elRef.nativeElement.querySelector('.current-user-actions')
      : this.elRef.nativeElement.querySelector('.other-participant-actions');

    this.video.srcObject = this.data.stream;
    this.participantName.textContent = `${this.data.userFirstName} ${
      this.data.userLastName ? this.data.userLastName : ''
    }`.trim();

    this.addAvatar();
  }

  private updateMediData() {
    if (this.data.isUserHost) {
      this.participantName.classList.add('inverted-text');
    }
    this.isParticipantMuted = !this.data.stream
      .getAudioTracks()
      .some((at) => at.enabled);
    this.hasParticipantVideo = this.data.stream
      .getVideoTracks()
      .some((at) => at.enabled);
  }

  private handleActionsPopup() {
    this.actionsIcon.addEventListener('click', () => {
      this.shouldShowActions = !this.shouldShowActions;
      if (this.shouldShowActions) {
        this.actionsPopup = createPopper(
          this.actionsIcon,
          this.actionsPopupContent,
          {
            placement: 'right',
            modifiers: [flip],
          }
        );
        this.actionsPopupContent.style.display = 'block';
        document.addEventListener(
          'click',
          this.onOutsideActionsClick.bind(this)
        );
      } else {
        this.actionsPopupContent.style.display = 'none';
        this.actionsPopup?.destroy();
        document.removeEventListener('click', this.onOutsideActionsClick);
      }
    });
  }

  private handleStreamChanges() {
    if (this.data.stream) {
      this.data.stream.getAudioTracks().forEach((at) => {
        at.addEventListener('enabled', () => {
          this.isParticipantMuted = false;
        });
        at.addEventListener('disabled', () => {
          this.isParticipantMuted = true;
        });
      });
      this.data.stream.getVideoTracks().forEach((at) => {
        at.addEventListener('enabled', () => {
          this.hasParticipantVideo = true;
        });
        at.addEventListener('disabled', () => {
          this.hasParticipantVideo = false;
        });
      });
    }
  }

  private onOutsideActionsClick(ev: Event): void {
    if (
      ev.target != this.actionsPopupContent &&
      ev.target != this.actionsIcon
    ) {
      this.actionsPopupContent.style.display = 'none';
      this.actionsPopup?.destroy();
    }
  }
}
