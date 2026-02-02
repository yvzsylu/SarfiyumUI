import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VisitorPricingModalComponent } from './visitor-pricing-modal.component';

describe('VisitorPricingModalComponent', () => {
  let component: VisitorPricingModalComponent;
  let fixture: ComponentFixture<VisitorPricingModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VisitorPricingModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VisitorPricingModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
