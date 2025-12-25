import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewerAddComponent } from './viewer-add.component';

describe('ViewerAddComponent', () => {
  let component: ViewerAddComponent;
  let fixture: ComponentFixture<ViewerAddComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewerAddComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewerAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
