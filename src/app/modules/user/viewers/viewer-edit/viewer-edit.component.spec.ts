import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewerEditComponent } from './viewer-edit.component';

describe('ViewerEditComponent', () => {
  let component: ViewerEditComponent;
  let fixture: ComponentFixture<ViewerEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewerEditComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewerEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
