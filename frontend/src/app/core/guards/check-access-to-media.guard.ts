import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  UrlTree,
  Router,
} from '@angular/router';
import { Observable, from } from 'rxjs';
import { tap, map, catchError } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { MediaSettingsService } from '../services/media-settings.service';

@Injectable({
  providedIn: 'root',
})
export class CheckAccessToMediaGuard implements CanActivate {
  constructor(
    private router: Router,
    private toastr: ToastrService,
    private mediaSettingsService: MediaSettingsService
  ) {}

  async canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Promise<boolean | UrlTree> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia(
        await this.mediaSettingsService.getMediaConstraints()
      );
      return stream.active;
    } catch {
      alert('Cannot access the camera and microphone');
      if (window.location.pathname == '/home') window.location.reload();
      return this.router.navigate(['/home']);
    }
  }
}
