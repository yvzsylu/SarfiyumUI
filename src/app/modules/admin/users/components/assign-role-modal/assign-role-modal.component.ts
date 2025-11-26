import { Component, Input, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { UserService, UserListDto, RoleDto } from '../../services/user.service';

@Component({
  selector: 'app-role-assign-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './assign-role-modal.component.html'
})
export class AssignRoleModalComponent implements OnInit {
  @Input() user!: UserListDto;

  private userService = inject(UserService);
  modal = inject(NgbActiveModal);

  roles = signal<RoleDto[]>([]);
  selectedRoles = signal<string[]>([]);

  ngOnInit(): void {
    this.loadRoles();
  }

  loadRoles() {
    this.userService.getAllRoles().subscribe({
      next: (res) => {
        this.roles.set(res || []);
        this.selectedRoles.set([...this.user.roles]);
      },
      error: () => {
        this.roles.set([]);
      }
    });
  }

  toggleRole(roleName: string) {
    const list = this.selectedRoles();
    if (list.includes(roleName)) {
      this.selectedRoles.set(list.filter(r => r !== roleName));
    } else {
      this.selectedRoles.set([...list, roleName]);
    }
  }

  assign() {
    this.userService.assignRoles(this.user.id, this.selectedRoles()).subscribe({
      next: () => this.modal.close(true),
      error: () => alert('Rol atama sırasında bir hata oluştu.')
    });
  }

  close() {
    this.modal.dismiss();
  }
}
