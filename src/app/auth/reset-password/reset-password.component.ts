import { Component } from '@angular/core';
import { RouterLink } from '@angular/router'
import { LogoBoxComponent } from '@component/logo-box.component'

@Component({
  selector: 'app-reset-password',
  imports: [RouterLink,LogoBoxComponent],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.scss'
})


export class ResetPasswordComponent {

}
