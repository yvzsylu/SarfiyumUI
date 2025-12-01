import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SymbolEditComponent } from './symbol-edit.component';

describe('SymbolEditComponent', () => {
  let component: SymbolEditComponent;
  let fixture: ComponentFixture<SymbolEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SymbolEditComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SymbolEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
