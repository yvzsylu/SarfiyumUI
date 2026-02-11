import { Component, inject, ViewChild, type OnInit } from '@angular/core';
import {
  NavigationCancel,
  NavigationEnd,
  NavigationError,
  NavigationStart,
  Router,
  RouterOutlet,
  ActivatedRoute, // 🔥 Eklendi: Aktif rotayı bulmak için
  type Event,
} from '@angular/router';
import { Title } from '@angular/platform-browser'; // 🔥 Eklendi: Başlığı değiştirmek için standart servis
import { filter, map } from 'rxjs/operators'; // 🔥 Eklendi: Router olaylarını filtrelemek için

import { NgProgressbar, NgProgressRef } from 'ngx-progressbar';
import { Store } from '@ngrx/store';
import { AuthenticationService } from '@/app/core/services/auth.service';
import { loginSuccess } from '@/app/store/authentication/authentication.actions';
import { BrandingService } from '@core/services/branding-service'; // Servis yolunu kontrol et
import { TitleService } from '@core/services/title.service'; // Senin mevcut servisin

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NgProgressbar],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {

  @ViewChild(NgProgressRef) progressBar!: NgProgressRef;

  // Servis Enjeksiyonları
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute); // 🔥 Yeni
  private titleService = inject(Title);            // 🔥 Yeni (Angular'ın kendi servisi)
  private customTitleService = inject(TitleService); // Senin eski servisin (İsmini değiştirdim karışmasın diye)
  
  private store = inject(Store);
  private authService = inject(AuthenticationService);
  private brandingService = inject(BrandingService);

  constructor() {
    // Progress Bar için Router dinleyicisi
    this.router.events.subscribe((event: Event) => {
      this.checkRouteChange(event);
    });
  }

  ngOnInit(): void {
    // 1. Senin mevcut Title servisin (Varsa başlangıç ayarları için kalsın)
    this.customTitleService.init();

    // 2. OTURUM KURTARMA (Sayfa yenilendiğinde)
    const user = this.authService.getUserFromCookie();
    if (user) {
      this.store.dispatch(loginSuccess({ user, redirect: false }));
    }

    // 3. SPLASH SCREEN KALDIRMA
    // Biraz gecikme eklemek (setTimeout) Angular'ın render işlemini bitirmesini bekler, daha smooth olur.
    setTimeout(() => {
      const splash = document.getElementById('splash-screen');
      if (splash) {
        splash.classList.add('remove');
      }
    }, 500);

    // 4. 🔥 DİNAMİK TITLE VE MARKA YÖNETİMİ 🔥
    // Sayfa her değiştiğinde çalışır.
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      map(() => {
        // Aktif rotanın en alt çocuğuna (child) kadar in
        let child = this.activatedRoute.firstChild;
        while (child?.firstChild) {
          child = child.firstChild;
        }
        // Route datasındaki 'title' bilgisini al (varsa)
        if (child?.snapshot.data['title']) {
          return child.snapshot.data['title'];
        }
        return null;
      })
    ).subscribe((pageTitle: string | null) => {
      
      // Servisten güncel marka ismini al (Sarfiyum veya Çilçil Altın)
      const brandName = this.brandingService.brand.name; 

      if (pageTitle) {
        // Eğer sayfanın özel bir başlığı varsa: "Dashboard | Çilçil Altın"
        this.titleService.setTitle(`${pageTitle} | ${brandName}`);
      } else {
        // Yoksa sadece marka ismi: "Çilçil Altın"
        this.titleService.setTitle(brandName);
      }
      
    });
  }

  // Progress Bar Kontrolü
  checkRouteChange(routerEvent: Event) {
    if (routerEvent instanceof NavigationStart) {
      this.progressBar?.start();
    }
    if (
      routerEvent instanceof NavigationEnd ||
      routerEvent instanceof NavigationCancel ||
      routerEvent instanceof NavigationError
    ) {
      setTimeout(() => {
        this.progressBar?.complete();
      }, 200);
    }
  }
}