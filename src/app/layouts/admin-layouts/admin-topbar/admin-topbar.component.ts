import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, EventEmitter, inject, Input, Output, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { NgbActiveOffcanvas, NgbDropdownModule, NgbOffcanvas, NgbOffcanvasModule } from '@ng-bootstrap/ng-bootstrap';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { changetheme } from '@store/layout/layout-action';
import { getLayoutColor } from '@store/layout/layout-selector';
import { SimplebarAngularModule } from 'simplebar-angular';
import { AdminActivitiStremComponent } from './component/admin-activiti-strem/admin-activiti-strem.component';
import { notificationsData } from './data';
import { logout } from '@store/authentication/authentication.actions';
import { getUser } from '@store/authentication/authentication.selector';
// User modelini import etmeyi unutma (Tip güvenliği için iyi olur)
// import { User } from '@store/authentication/auth.model'; 
import { tap } from 'rxjs/operators'; // <-- Import etmeyi unutma
@Component({
  selector: 'app-admin-topbar',
  standalone: true,
  imports: [
    RouterModule,
    CommonModule,
    NgbOffcanvasModule,
    SimplebarAngularModule,
    NgbDropdownModule,
  ],
  templateUrl: './admin-topbar.component.html',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  providers: [NgbActiveOffcanvas],
})
export class AdminTopbarComponent implements OnInit {
  @Input() title: string | undefined;
  @Output() settingsButtonClicked = new EventEmitter();
  @Output() mobileMenuButtonClicked = new EventEmitter();

  router = inject(Router);
  store = inject(Store);
  offcanvasService = inject(NgbOffcanvas);

  notificationList = notificationsData;
  
  // ! işareti ile init sorununu aşıyoruz
  user$!: Observable<any>; 

  ngOnInit(): void {
    // Selector'ı loglayarak dinle
    this.user$ = this.store.select(getUser).pipe(
      tap(user => {
        console.log('📢 [5] Topbar Component Verisi:', user);
        if (user) {
            console.log('👤 [6] İsim Alanı Kontrolü:', user.fullName);
        }
      })
    );
  }

  settingMenu() {
    this.settingsButtonClicked.emit();
  }

  toggleMobileMenu() {
    this.mobileMenuButtonClicked.emit();
  }

  changeTheme() {
    const color = document.documentElement.getAttribute('data-bs-theme');
    if (color == 'light') {
      this.store.dispatch(changetheme({ color: 'dark' }));
    } else {
      this.store.dispatch(changetheme({ color: 'light' }));
    }
    this.store.select(getLayoutColor).subscribe((color) => {
      document.documentElement.setAttribute('data-bs-theme', color);
    });
  }

  logout() {
    this.store.dispatch(logout())
  }

  open() {
    this.offcanvasService.open(AdminActivitiStremComponent, {
      position: 'end',
      panelClass: 'border-0 width-auto',
    });
  }
}