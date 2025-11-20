import { Component, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder, Validators, type UntypedFormGroup } from '@angular/forms';
import { RouterLink } from '@angular/router'
import { LogoBoxComponent } from '@component/logo-box.component'
import { Store } from '@ngrx/store';
import { login } from '@store/authentication/authentication.actions';

@Component({
  selector: 'app-login',
  imports: [LogoBoxComponent,RouterLink,FormsModule,ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})


export class LoginComponent {
  loginForm!: UntypedFormGroup
  submitted: boolean = false

  public fb = inject(UntypedFormBuilder)
  public store = inject(Store)

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required]],
      rememberMe: [false] // Varsayılan false
    })
  }

  get formValues() {
    return this.loginForm.controls
  }

  login() {
    this.submitted = true
    if (this.loginForm.valid) {     
      const username = this.formValues['username'].value // Get the username from the form
      const password = this.formValues['password'].value // Get the password from the form
      // Checkbox değerini al
      const rememberMe = this.formValues['rememberMe'].value

      // Login Api
      this.store.dispatch(login({ username: username, password: password, rememberMe: rememberMe }))
    }
  }
}
