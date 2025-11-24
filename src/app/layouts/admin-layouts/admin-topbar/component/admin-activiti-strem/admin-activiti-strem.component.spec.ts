import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminActivitiStremComponent } from './admin-activiti-strem.component';

describe('AdminActivitiStremComponent', () => {
  let component: AdminActivitiStremComponent;
  let fixture: ComponentFixture<AdminActivitiStremComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminActivitiStremComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminActivitiStremComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
