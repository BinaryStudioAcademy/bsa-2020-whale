import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  UrlTree,
  Router,
} from '@angular/router';
import { MediaSettingsService } from '../services/media-settings.service';
import { AuthService } from '../auth/auth.service';

@Injectable({
  providedIn: 'root',
})
export class CheckAccessToMediaGuard implements CanActivate {
  constructor(
    private router: Router,
    private mediaSettingsService: MediaSettingsService,
    private authService: AuthService
  ) {}

  async canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Promise<boolean | UrlTree> {
    // await this.authService.user$.toPromise();
    // if (!this.authService.isSignedIn) {
    //   return this.router.navigate(['/']);
    // }
    try {
      const stream = await navigator.mediaDevices.getUserMedia(
        await this.mediaSettingsService.getMediaConstraints()
      );

      let isActive = stream.active;
      stream?.getTracks().forEach((track) => track.stop());

      return isActive;
    } catch {
      alert('Cannot access the camera and microphone');
      if (window.location.pathname == '/home') window.location.reload();
      return this.router.navigate(['/home']);
    }
  }
}
