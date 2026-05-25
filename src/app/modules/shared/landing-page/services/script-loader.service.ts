import { Injectable, Renderer2, RendererFactory2 } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ScriptLoaderService {
  private renderer: Renderer2;
  private loadedScripts: string[] = []; // Yüklenen scriptleri takip eder

  constructor(rendererFactory: RendererFactory2) {
    this.renderer = rendererFactory.createRenderer(null, null);
  }

  // Belirli bir scripti sayfaya ekler
  public loadScript(src: string): Promise<void> {
    return new Promise((resolve, reject) => {
      // Eğer script zaten yüklendiyse tekrar yükleme
      if (this.loadedScripts.includes(src)) {
        resolve();
        return;
      }

      const script = this.renderer.createElement('script');
      script.type = 'text/javascript';
      script.src = src;
      script.onload = () => {
        this.loadedScripts.push(src);
        resolve();
      };
      script.onerror = (error: any) => reject(error);
      
      // Scripti <body> etiketinin sonuna ekler
      this.renderer.appendChild(document.body, script);
    });
  }

  // Birden fazla scripti sırayla yükler (jQuery gibi bağımlılıkları olanlar için kritik)
  public async loadScriptsSequentially(scripts: string[]): Promise<void> {
    for (const script of scripts) {
      try {
        await this.loadScript(script);
      } catch (error) {
        console.error(`Script yüklenemedi: ${script}`, error);
      }
    }
  }

  // İsteğe bağlı: Component kapatıldığında DOM'dan temizlemek için (B2B panele geçildiğinde)
  public removeScripts() {
      // Not: jQuery olayları DOM'a bağlandığı için sadece script etiketini silmek bazen yetmez, 
      // ancak bellek sızıntılarını önlemek için kullanılabilir.
  }
}