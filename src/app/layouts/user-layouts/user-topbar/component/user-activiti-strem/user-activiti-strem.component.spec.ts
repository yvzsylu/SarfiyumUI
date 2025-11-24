import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserActivitiStremComponent } from './user-activiti-strem.component';

describe('UserActivitiStremComponent', () => {
  let component: UserActivitiStremComponent;
  let fixture: ComponentFixture<UserActivitiStremComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserActivitiStremComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserActivitiStremComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
