import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SymbolCategoryEditComponent } from './symbol-category-edit.component';

describe('SymbolCategoryEditComponent', () => {
  let component: SymbolCategoryEditComponent;
  let fixture: ComponentFixture<SymbolCategoryEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SymbolCategoryEditComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SymbolCategoryEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
