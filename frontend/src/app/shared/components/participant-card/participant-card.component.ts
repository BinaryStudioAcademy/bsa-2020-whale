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
  @Output() startVideoEvent = new EventEmitter<string>();
  @Output() muteEvent = new EventEmitter<string>();
  @Output() unmuteEvent = new EventEmitter<string>();

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

  public switchMute(): void {
    this.isParticipantMuted
      ? this.unmuteEvent.emit(this.data.id)
      : this.muteEvent.emit(this.data.id);
  }

  public switchVideo(): void {
    this.hasParticipantVideo
      ? this.stopVideoEvent.emit(this.data.id)
      : this.startVideoEvent.emit(this.data.id);
  }

  public pinVideo(): void {
    this.pinVideEvent.emit(this.data.id);
  }

  public hideCurrentCard(): void {
    this.hideViewEvent.emit(this.data.id);
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

  private updateMediData() {
    if (this.data.isUserHost) {
      this.participantName.classList.add('inverted-text');
    }

    this.isParticipantMuted = this.data.stream
      ? this.data.stream.getAudioTracks().length == 0
      : false;
    this.hasParticipantVideo = this.data.stream
      ? this.data.stream.getVideoTracks().length == 0
      : false;
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
      this.data.stream.onaddtrack = (ev: MediaStreamTrackEvent) => {
        ev.track.kind == 'audio'
          ? (this.isParticipantMuted = false)
          : (this.hasParticipantVideo = true);
      };
      this.data.stream.onremovetrack = (ev: MediaStreamTrackEvent) => {
        ev.track.kind == 'audio'
          ? (this.isParticipantMuted = true)
          : (this.hasParticipantVideo = false);
      };
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
