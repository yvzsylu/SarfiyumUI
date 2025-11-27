import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MultiplierSettingsComponent } from './multiplier-settings.component';

describe('MultiplierSettingsComponent', () => {
  let component: MultiplierSettingsComponent;
  let fixture: ComponentFixture<MultiplierSettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MultiplierSettingsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MultiplierSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
