import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ScriptLoaderService } from '../landing-page/services/script-loader.service';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.scss'],
  encapsulation: ViewEncapsulation.None // Şablonun global CSS seçicilerinin çalışabilmesi için şarttır
})
export class LandingPageComponent implements OnInit {

  // assets/niotech klasörüne attığın scriptlerin yüklenme sırası
  private readonly niotechScripts: string[] = [
    'assets/niotech/js/jquery-3.7.1.min.js',
    'assets/niotech/js/bootstrap.bundle.min.js',
    'assets/niotech/js/jquery.waypoints.js',
    'assets/niotech/js/jquery.counterup.min.js',
    'assets/niotech/js/viewport.jquery.js',
    'assets/niotech/js/tilt.min.js',
    'assets/niotech/js/swiper-bundle.min.js',
    'assets/niotech/js/jquery.meanmenu.min.js',
    'assets/niotech/js/magnific-popup.min.js',
    'assets/niotech/js/wow.min.js',
    'assets/niotech/js/nice-select.min.js',
    'assets/niotech/js/main.js'
  ];

  constructor(private scriptLoader: ScriptLoaderService) {}

  ngOnInit(): void {
    // Sayfa DOM'a yüklendiğinde Niotech scriptlerini sırayla çalıştırır
    this.scriptLoader.loadScriptsSequentially(this.niotechScripts)
    .then(() => {
        // Tarayıcı bloğunu aşmak için küçük bir tetikleme
        setTimeout(() => {
            const video = document.querySelector('video') as HTMLVideoElement;
            if (video) {
                video.play().catch(error => {
                    console.log("Tarayıcı autoplay'i engelledi, video manuel tetiklendi.");
                });
            }
        }, 500);
    });
    
    this.scriptLoader.loadScriptsSequentially(this.niotechScripts)
      .then(() => {
        console.log('Sarfiyum Landing Page modülleri başarıyla tetiklendi.');
      })
      .catch(err => console.error('Landing Page script yükleme hatası:', err));
  }
}