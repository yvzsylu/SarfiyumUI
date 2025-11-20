import { Component, inject, ViewChild, type OnInit } from '@angular/core'; // Kullanılmayan importları temizledim (Signal, viewChild vb.)
import {
  NavigationCancel,
  NavigationEnd,
  NavigationError,
  NavigationStart,
  Router,
  RouterOutlet,
  type Event,
} from '@angular/router';
import { TitleService } from '@core/services/title.service';
import {
  NgProgressbar,
  NgProgressRef,
} from 'ngx-progressbar';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NgProgressbar],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  // progressRef!: NgProgressRef; // <--- BU SATIRI SİLDİM, AŞAĞIDAKİ progressBar ZATEN AYNI İŞİ YAPIYOR, GEREKSİZDİ.
  
  @ViewChild(NgProgressRef) progressBar!: NgProgressRef;

  private titleService = inject(TitleService);
  private router = inject(Router);

  constructor() {
    this.router.events.subscribe((event: Event) => {
      this.checkRouteChange(event);
    });
  }

  ngOnInit(): void {
    this.titleService.init();
  }

  checkRouteChange(routerEvent: Event) {
    if (routerEvent instanceof NavigationStart) {
      // DÜZELTME: ?. eklendi. 
      // Eğer sayfa ilk yüklenirken progressBar henüz hazır değilse uygulama hata vermez, sadece bar çalışmaz.
      this.progressBar?.start();
    }
    if (
      routerEvent instanceof NavigationEnd ||
      routerEvent instanceof NavigationCancel ||
      routerEvent instanceof NavigationError
    ) {
      setTimeout(() => {
        // DÜZELTME: ?. eklendi.
        this.progressBar?.complete();
      }, 200);
    }
  }
}