import { Component, OnInit, inject, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core'; // 1. Schema'yı import et
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SettingsService, SmtpSettingsDto } from '../../services/settings.service';

@Component({
  selector: 'app-smtp-setting',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './smtp-setting.component.html',
  // 2. Schema'yı buraya ekle
  schemas: [CUSTOM_ELEMENTS_SCHEMA] 
})
export class SmtpSettingComponent implements OnInit {
  private fb = inject(FormBuilder);
  private settingsService = inject(SettingsService);

  smtpForm!: FormGroup;
  isLoading = false;

  constructor() {
    this.initForm();
  }

  ngOnInit() {
    this.loadSettings();
  }

  private initForm() {
    this.smtpForm = this.fb.group({
      host: ['', Validators.required],
      port: [587, [Validators.required, Validators.pattern("^[0-9]*$")]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      displayName: ['Sarfiyum Bildirim', Validators.required],
      enableSsl: [true]
    });
  }

  loadSettings() {
    this.isLoading = true;
    this.settingsService.getAllSettings().subscribe({
      next: (res) => {
        if (res && res.smtp) {
          this.smtpForm.patchValue(res.smtp);
        }
        this.isLoading = false;
      },
      error: () => this.isLoading = false
    });
  }

  // Parent Component (SettingsComponent) tarafından tetiklenir
  save() {
    if (this.smtpForm.invalid) {
      this.smtpForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    const data: SmtpSettingsDto = this.smtpForm.value;

    this.settingsService.updateSmtpSettings(data).subscribe({
      next: () => {
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }
  
  get f() { return this.smtpForm.controls; }
}