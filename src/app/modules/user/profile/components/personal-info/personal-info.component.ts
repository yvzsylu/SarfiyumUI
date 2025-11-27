import { Component, Input, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserProfileDto } from '../../services/profile.service';

@Component({
  selector: 'profile-personal-info',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './personal-info.component.html',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class PersonalInfoComponent {
  @Input() user!: UserProfileDto; // Parent'tan veri alacak
}