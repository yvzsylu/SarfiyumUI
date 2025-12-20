import { CommonModule } from '@angular/common';
import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  EventEmitter,
  inject,
  Input,
  Output,
  OnInit
} from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import {
  NgbActiveOffcanvas,
  NgbDropdownModule,
  NgbOffcanvas,
  NgbOffcanvasModule,
} from '@ng-bootstrap/ng-bootstrap';
import { Store } from '@ngrx/store';
import { changetheme } from '@store/layout/layout-action';
import { getLayoutColor } from '@store/layout/layout-selector';
import { SimplebarAngularModule } from 'simplebar-angular';
import { UserActivitiStremComponent } from './component/user-activiti-strem/user-activiti-strem.component'; // Yolunu kontrol et
import { notificationsData } from './data'; // Yolunu kontrol et
import { logout } from '@store/authentication/authentication.actions';
import { getUser } from '@store/authentication/authentication.selector';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../../../environments/environment'; // Environment dosya yolunu kontrol et
import { RemainingDaysPipe } from '@/app/core/pipes/remaining-days.pipe';


@Component({
  selector: 'app-user-topbar',
  standalone: true,
  imports: [
    RouterModule,
    CommonModule,
    NgbOffcanvasModule,
    SimplebarAngularModule,
    NgbDropdownModule,
    RemainingDaysPipe
  ],
  templateUrl: './user-topbar.component.html',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  providers: [NgbActiveOffcanvas],
})
export class UserTopbarComponent implements OnInit {
  @Input() title: string | undefined;
  @Output() settingsButtonClicked = new EventEmitter();
  @Output() mobileMenuButtonClicked = new EventEmitter();

  private router = inject(Router);
  private store = inject(Store);
  private offcanvasService = inject(NgbOffcanvas);

  notificationList = notificationsData;

  // Kullanıcı verisi observable'ı
  user$!: Observable<any>;


  public apiRoot = environment.apiUrl.replace('/api', '');

  ngOnInit(): void {
    console.log(this.apiRoot);
    // Store'dan kullanıcıyı dinle
    this.user$ = this.store.select(getUser).pipe(
      tap(user => {
        // Debug için loglayabilirsin:
        // console.log('User Topbar Data:', user);
      })
    );
    // this.user$ = this.store.select(getUser).pipe(
    // tap(user => {
    //   if(user?.tenantLogoUrl) {
    //      console.log('API Root:', this.apiRoot);
    //      console.log('Gelen Logo URL:', user.tenantLogoUrl);
    //      console.log('Oluşan Final URL:', this.apiRoot + user.tenantLogoUrl);
    //   }
    // })
    // );
  }

  settingMenu() {
    this.settingsButtonClicked.emit();
  }

  toggleMobileMenu() {
    this.mobileMenuButtonClicked.emit();
  }


  // HTML'de kullanmak için:
  getBadgeClass(dateString: string | undefined): string {
    if (!dateString) return 'bg-secondary text-white';

    const endDate = new Date(dateString);
    const now = new Date();

    // Milisaniye farkı
    const diffTime = endDate.getTime() - now.getTime();
    // Gün farkı
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return 'bg-danger-subtle text-danger'; // Süre doldu (Kırmızı)
    if (diffDays <= 7) return 'bg-warning-subtle text-warning'; // 7 günden az (Sarı)
    return 'bg-success-subtle text-success'; // Güvende (Yeşil)
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
    this.offcanvasService.open(UserActivitiStremComponent, {
      position: 'end',
      panelClass: 'border-0 width-auto',
    });
  }
}