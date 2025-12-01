import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SymbolCategoryListComponent } from './symbol-category-list.component';

describe('SymbolCategoryListComponent', () => {
  let component: SymbolCategoryListComponent;
  let fixture: ComponentFixture<SymbolCategoryListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SymbolCategoryListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SymbolCategoryListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
