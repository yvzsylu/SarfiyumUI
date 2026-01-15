import { findAllParent, findMenuItem } from '@/app/helper/utils';
import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, inject } from '@angular/core';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { basePath } from '@common/constants';
import { MENU, type MenuItem } from '@common/user-menu-meta'; // MENU dosyanızın burada olduğunu varsayıyorum
import { UserLogoBoxComponent } from '@component/user-logo-box.component';
import {
  NgbCollapseModule,
  type NgbCollapse,
} from '@ng-bootstrap/ng-bootstrap';
import { Store } from '@ngrx/store';
import { changesidebarsize } from '@store/layout/layout-action';
import { getSidebarsize } from '@store/layout/layout-selector';
import { SimplebarAngularModule } from 'simplebar-angular';
import { getUser } from '@/app/store/authentication/authentication.selector';
import { take } from 'rxjs';

@Component({
  selector: 'app-user-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    UserLogoBoxComponent,
    NgbCollapseModule,
    SimplebarAngularModule,
  ],
  templateUrl: './user-sidebar.component.html',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class UserSidebarComponent {
  menuItems: MenuItem[] = [];
  activeMenuItems: string[] = [];

  router = inject(Router);
  trimmedURL = this.router.url?.replaceAll(
    basePath !== '' ? basePath + '/' : '',
    '/',
  );

  store = inject(Store);

  constructor() {
    this.router.events.forEach((event) => {
      if (event instanceof NavigationEnd) {
        this.trimmedURL = this.router.url?.replaceAll(
          basePath !== '' ? basePath + '/' : '',
          '/',
        );
        this._activateMenu();
        setTimeout(() => {
          this.scrollToActive();
        }, 200);
      }
    });
  }

  ngOnInit(): void {
    this.initMenu();
  }

  // 🔥 GÜNCELLENEN MENU MANTIĞI
  initMenu(): void {
    this.store.select(getUser).pipe(take(1)).subscribe((user) => {
      if (!user) {
        this.menuItems = MENU;
        return;
      }

      // Rol kontrolü
      const isViewer = user.roles?.some((r: string) => r.toLowerCase() === 'viewer');

      if (isViewer) {
        // --- SENARYO 1: VIEWER ---
        // Sadece 'dashboard' ve 'contact' (iletişim) sayfalarını görsün.
        // Eğer Yardım ve SSS de görsün istiyorsan listeye 'faqs', 'help-center' ekle.
        const allowedKeys = ['dashboards', 'contact'];

        this.menuItems = MENU.filter((item) => {
          // Başlıkları (isTitle) gizlemek istersen bu satırı kaldırabilirsin, 
          // ama genelde menü bütünlüğü için başlıklar kalabilir veya onları da filtreleyebilirsin.
          if (item.isTitle) return false; 

          return allowedKeys.includes(item.key || '');
        });

      } else {
        // --- SENARYO 2: USER / ADMIN ---
        // 'contact' (iletişim) hariç her şeyi görsün.
        // Çünkü User zaten ayarlar sayfasından numarayı yönetiyor, kendisine mesaj atmasına gerek yok.
        this.menuItems = MENU.filter((item) => {
          return item.key !== 'contact';
        });
      }
    });
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this._activateMenu();
    });
    setTimeout(() => {
      this.scrollToActive();
    }, 200);
  }

  scrollToActive(): void {
    const activatedItem = document.querySelector('.nav-item li a.active');
    if (activatedItem) {
      const simplebarContent = document.querySelector(
        '.main-nav .simplebar-content-wrapper',
      );
      if (simplebarContent) {
        const activatedItemRect = activatedItem.getBoundingClientRect();
        const simplebarContentRect = simplebarContent.getBoundingClientRect();
        const activatedItemOffsetTop =
          activatedItemRect.top + simplebarContent.scrollTop;
        const centerOffset =
          activatedItemOffsetTop -
          simplebarContentRect.top -
          simplebarContent.clientHeight / 2 +
          activatedItemRect.height / 2;
        this.scrollTo(simplebarContent, centerOffset, 600);
      }
    }
  }

  easeInOutQuad(t: number, b: number, c: number, d: number): number {
    t /= d / 2;
    if (t < 1) return (c / 2) * t * t + b;
    t--;
    return (-c / 2) * (t * (t - 2) - 1) + b;
  }

  scrollTo(element: Element, to: number, duration: number): void {
    const start = element.scrollTop;
    const change = to - start;
    const increment = 20;
    let currentTime = 0;

    const animateScroll = () => {
      currentTime += increment;
      const val = this.easeInOutQuad(currentTime, start, change, duration);
      element.scrollTop = val;
      if (currentTime < duration) {
        setTimeout(animateScroll, increment);
      }
    };
    animateScroll();
  }

  _activateMenu(): void {
    const div = document.querySelector('.navbar-nav');

    let matchingMenuItem = null;

    if (div) {
      let items: any = div.getElementsByClassName('nav-link-ref');
      for (let i = 0; i < items.length; ++i) {
        if (
          this.trimmedURL === items[i].pathname ||
          (this.trimmedURL.startsWith('/invoice/') &&
            items[i].pathname === '/invoice/RB6985') ||
          (this.trimmedURL.startsWith('/ecommerce/product/') &&
            items[i].pathname === '/ecommerce/product/1')
        ) {
          matchingMenuItem = items[i];
          break;
        }
      }

      if (matchingMenuItem) {
        const mid = matchingMenuItem.getAttribute('aria-controls');
        const activeMt = findMenuItem(this.menuItems, mid);

        if (activeMt) {
          const matchingObjs = [
            activeMt['key'],
            ...findAllParent(this.menuItems, activeMt),
          ];

          this.activeMenuItems = matchingObjs;
          this.menuItems.forEach((menu: MenuItem) => {
            menu.collapsed = !matchingObjs.includes(menu.key!);
          });
        }
      }
    }
  }

  hasSubmenu(menu: MenuItem): boolean {
    return menu.subMenu ? true : false;
  }

  toggleMenuItem(menuItem: MenuItem, collapse: NgbCollapse): void {
    collapse.toggle();
    let openMenuItems: string[];
    if (!menuItem.collapsed) {
      openMenuItems = [
        menuItem['key'],
        ...findAllParent(this.menuItems, menuItem),
      ];
      this.menuItems.forEach((menu: MenuItem) => {
        if (!openMenuItems.includes(menu.key!)) {
          menu.collapsed = true;
        }
      });
    }
  }

  changeSidebarSize() {
    let size = document.documentElement.getAttribute('data-menu-size');
    if (size == 'sm-hover') {
      size = 'sm-hover-active';
    } else {
      size = 'sm-hover';
    }
    this.store.dispatch(changesidebarsize({ size }));
    this.store.select(getSidebarsize).subscribe((size) => {
      document.documentElement.setAttribute('data-menu-size', size);
    });
  }
}