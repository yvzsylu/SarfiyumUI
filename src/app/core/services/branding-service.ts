import { Injectable } from '@angular/core';
import { Title } from '@angular/platform-browser';

export interface BrandConfig {
  name: string;
  email: string;
  website: string;
  phoneDisplay: string;  
  phoneLink: string;     
  logoDarkPath: string;
  logoLightPath: string;
  logoSmPath: string;
  faviconPath: string;
  cssClass: string;
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

  private detectBrand(): BrandConfig {
    const hostname = window.location.hostname;

    if (hostname.includes('cilcilaltin')) {
      return {
        name: 'Çilçil Altın',
        email: 'info@cilcilaltin.com',
        website: 'portal.cilcilaltin.com',
        phoneDisplay: '+90 531 360 54 74',
        phoneLink: '+905313605474',
        faviconPath: 'assets/images/branding/cilcilaltin/favicon.ico',
        logoDarkPath: 'assets/images/branding/cilcilaltin/logo-dark.png',
        logoLightPath: 'assets/images/branding/cilcilaltin/logo-light.png',
        logoSmPath: 'assets/images/branding/cilcilaltin/logo-sm.png',
        cssClass: 'theme-cilcil'
      };
    }

    return {
      name: 'Sarfiyum',
      email: 'info@sarfiyum.com',
      website: 'sarfiyum.com',
      phoneDisplay: '+90 539 921 23 91',
      phoneLink: '+905399212391',
      logoDarkPath: 'assets/images/branding/sarfiyum/logo-dark.png',
      logoLightPath: 'assets/images/branding/sarfiyum/logo-light.png',
      logoSmPath: 'assets/images/branding/sarfiyum/logo-sm.png',
      faviconPath: 'assets/images/branding/sarfiyum/favicon.ico',
      cssClass: 'theme-sarfiyum'
    };
  }

  private applyBrand() {
    this.titleService.setTitle(this.currentBrand.name);
    this.updateFavicon(this.currentBrand.faviconPath);
  }

  private updateFavicon(path: string) {
    let link: HTMLLinkElement | null = document.getElementById('appIcon') as HTMLLinkElement;
    if (!link) link = document.querySelector("link[rel*='icon']") as HTMLLinkElement;
    if (!link) {
        link = document.createElement('link');
        link.id = 'appIcon';
        link.rel = 'icon';
        document.getElementsByTagName('head')[0].appendChild(link);
    }
    link.type = 'image/x-icon';
    link.href = path;
  }

  get brand(): BrandConfig {
    return this.currentBrand;
  }
}