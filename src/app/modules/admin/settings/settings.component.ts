import { Component, ViewChild } from '@angular/core';
import { SmtpSettingComponent } from './components/smtp-setting/smtp-setting.component';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    SmtpSettingComponent,
  ],
  templateUrl: './settings.component.html',
})
export class SettingsComponent {
  title = 'Settings';

  // Child Component'e erişim sağlıyoruz
  @ViewChild(SmtpSettingComponent) smtpSettingComponent!: SmtpSettingComponent;

  onSave() {
    // Child component içindeki save metodunu tetikle
    if (this.smtpSettingComponent) {
      this.smtpSettingComponent.save();
    }
  }
  
  onCancel() {
    // İptal edilince verileri tekrar yükle (Reset)
    if (this.smtpSettingComponent) {
      this.smtpSettingComponent.loadSettings();
    }
  }
}