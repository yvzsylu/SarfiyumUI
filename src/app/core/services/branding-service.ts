import { Injectable } from '@angular/core';
import { Title } from '@angular/platform-browser';

export interface BrandConfig {
    name: string;
    logoDarkPath?: string;
    logoSmPath?: string;
    logoLightPath?: string;
    faviconPath: string;
    cssClass: string; // İleride renkleri CSS ile değiştirmek istersen

}

@Injectable({
    providedIn: 'root'
})
export class BrandingService {

    private currentBrand: BrandConfig;

    constructor(private titleService: Title) {
        this.currentBrand = this.detectBrand();
        this.applyBrand();
    }

    // 1. Domain'e göre markayı tespit et
    private detectBrand(): BrandConfig {
        const hostname = window.location.hostname;

        if (hostname.includes('cilcilaltin')) {
            return {
                name: 'Çilçil Altın',
                faviconPath: 'assets/images/branding/cilcilaltin/favicon.ico',
                logoDarkPath: 'assets/images/branding/cilcilaltin/logo-dark.png',
                logoLightPath: 'assets/images/branding/cilcilaltin/logo-light.png',
                logoSmPath: 'assets/images/branding/cilcilaltin/logo-sm.png',
                cssClass: 'theme-cilcil'
            };
        }

        // Varsayılan (Sarfiyum)
        return {
            name: 'Sarfiyum',
            logoDarkPath: 'assets/images/branding/sarfiyum/logo-dark.png',
            logoLightPath: 'assets/images/branding/sarfiyum/logo-light.png',
            faviconPath: 'assets/images/branding/sarfiyum/favicon.ico',
            logoSmPath: 'assets/images/branding/sarfiyum/logo-sm.png',
            cssClass: 'theme-sarfiyum'
        };
    }

    // 2. Favicon ve Başlığı (Title) uygula
    private applyBrand() {
        // Tarayıcı sekmesindeki başlığı değiştir
        this.titleService.setTitle(this.currentBrand.name);

        // Favicon'u değiştir (DOM Manipülasyonu)
        this.updateFavicon(this.currentBrand.faviconPath);
    }

    private updateFavicon(path: string) {
        // 1. Önce ID ile bulmaya çalış (En hızlı yöntem)
        let link: HTMLLinkElement | null = document.getElementById('appIcon') as HTMLLinkElement;

        // 2. Eğer ID ile bulamazsa genel arama yap (Yedek plan)
        if (!link) {
            link = document.querySelector("link[rel*='icon']");
        }

        // 3. Hiçbiri yoksa yeni oluştur
        if (!link) {
            link = document.createElement('link');
            link.id = 'appIcon'; // Bir dahaki sefere bulabilmek için ID ver
            link.rel = 'icon';
            document.getElementsByTagName('head')[0].appendChild(link);
        }

        // Yolu güncelle
        link.type = 'image/x-icon';
        link.href = path;
    }

    // Componentlerden erişmek için getter
    get brand(): BrandConfig {
        return this.currentBrand;
    }
}