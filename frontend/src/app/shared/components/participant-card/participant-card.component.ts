import {
  Component,
  OnInit,
  Input,
  ElementRef,
  Output,
  EventEmitter,
  OnDestroy,
} from '@angular/core';
import { createPopper } from '@popperjs/core';
import flip from '@popperjs/core/lib/modifiers/flip.js';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import {
  MediaData,
  ParticipantDynamicData,
  Participant,
  ReactionsEnum,
  CardMediaData,
} from '@shared/models';
import { MediaSettingsService } from 'app/core/services';

@Component({
  selector: 'app-participant-card',
  templateUrl: './participant-card.component.html',
  styleUrls: ['./participant-card.component.sass'],
})
export class ParticipantCardComponent implements OnInit, OnDestroy {
  @Input() data: MediaData;
  @Input() meetingHolder: Participant;
  @Output() pinVideEvent = new EventEmitter<string>();
  @Output() hideViewEvent = new EventEmitter<string>();
  @Output() stopVideoEvent = new EventEmitter<string>();
  @Output() toggleCameraEvent = new EventEmitter<string>();
  @Output() toggleMicrophoneEvent = new EventEmitter<string>();
  @Output() switchMediaPermissionAsHostEvent = new EventEmitter<
    CardMediaData
  >();

  public actionsIcon: HTMLElement;
  public actionsPopupContent: HTMLElement;
  public actionsPopup: any;
  public shouldShowActions = false;
  public isMicrophoneHovered = false;
  public dynamicData: ParticipantDynamicData;
  public reaction: ReactionsEnum;

  private video: HTMLVideoElement;
  private participantContainer: HTMLElement;
  private participantName: HTMLElement;
  private unsubscribe$ = new Subject<void>();

  constructor(
    private elRef: ElementRef,
    private mediaSettingsService: MediaSettingsService
  ) {}

  public ngOnInit(): void {
    this.initCardElements();
    this.handleActionsPopup();

    this.video.srcObject = this.data.stream;
    if (
      this.mediaSettingsService.settings.IsMirrorVideo &&
      this.data.isCurrentUser
    ) {
      document.querySelector('video').style.transform = 'scale(-1,1)';
    }
    this.actionsPopupContent = this.data.isCurrentUser
      ? this.elRef.nativeElement.querySelector('.current-user-actions')
      : this.elRef.nativeElement.querySelector('.other-participant-actions');

    this.data.dynamicData
      .asObservable()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((dynamicData) => {
        this.dynamicData = dynamicData;
        if (
          !this.dynamicData.isVideoAllowed &&
          this.dynamicData.isVideoActive &&
          !this.dynamicData.isUserHost
        ) {
          this.dynamicData.isVideoActive = false;
        }
        if (
          !this.dynamicData.isAudioAllowed &&
          this.dynamicData.isAudioActive &&
          !this.dynamicData.isUserHost
        ) {
          this.dynamicData.isAudioActive = false;
        }

        this.updateData();
      });
    this.data.reactions
      .asObservable()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((reaction) => this.onReaction(reaction));
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
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

  public switchMediaPermissionAsHost(isVideo: boolean): void {
    this.switchMediaPermissionAsHostEvent.emit({
      cardStreamId: this.data.stream.id,
      isVideoAllowed: isVideo
        ? !this.dynamicData.isVideoAllowed
        : this.dynamicData.isVideoAllowed,
      isAudioAllowed: isVideo
        ? this.dynamicData.isAudioAllowed
        : !this.dynamicData.isAudioAllowed,
      isVideoActive: this.dynamicData.isVideoActive,
      isAudioActive: this.dynamicData.isAudioActive,
    });
  }

  private addAvatar(): void {
    if (this.dynamicData.avatarUrl) {
      this.participantContainer.style.background = `url(${this.dynamicData.avatarUrl})`;
      this.participantContainer.style.backgroundSize = 'contain';
      this.participantContainer.style.backgroundRepeat = 'no-repeat';
      this.participantContainer.style.backgroundPosition = 'center';
    } else {
      const participantInitials = this.elRef.nativeElement.querySelector(
        '.participant-initials'
      );
      console.log('dd', this.dynamicData);
      participantInitials.textContent = `${this.dynamicData.userFirstName.slice(
        0,
        1
      )} ${this.dynamicData.userSecondName?.slice(0, 1)}`;
    }
  }

  private initCardElements(): void {
    this.video = this.elRef.nativeElement.querySelector('video');
    this.participantName = this.elRef.nativeElement.querySelector('.header');
    this.participantContainer = this.elRef.nativeElement.querySelector(
      '.image'
    );
    this.actionsIcon = this.elRef.nativeElement.querySelector(
      '.small.blue.ellipsis.vertical.icon'
    );
  }

  private updateData(): void {
    this.participantName.textContent = `${this.dynamicData.userFirstName} ${
      this.dynamicData.userSecondName ? this.dynamicData.userSecondName : ''
    }`.trim();

    if (this.dynamicData.isUserHost) {
      this.participantName.classList.add('inverted-text');
    }

    this.addAvatar();
  }

  private handleActionsPopup(): void {
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

  private onOutsideActionsClick(ev: Event): void {
    if (
      ev.target !== this.actionsPopupContent &&
      ev.target !== this.actionsIcon
    ) {
      this.actionsPopupContent.style.display = 'none';
      this.actionsPopup?.destroy();
    }
  }

  private async onReaction(reaction: ReactionsEnum): Promise<void> {
    this.reaction = reaction;
    await new Promise((res) => setTimeout(res, 5000));
    this.reaction = undefined;
  }
}
