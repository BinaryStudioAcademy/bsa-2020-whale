import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'app/core/auth/auth.service';

@Component({
  selector: 'app-page-header',
  templateUrl: './page-header.component.html',
  styleUrls: ['./page-header.component.sass'],
})
export class PageHeaderComponent implements OnInit {
  settingsMenuVisible = false;
  constructor(private router: Router, public auth: AuthService) {}

  ngOnInit(): void {}
  goToPage(pageName: string): void {
    this.router.navigate([`${pageName}`]);
  }
  logOut(): void {
    this.auth.logout();
    this.router.navigate(['']);
  }
}
