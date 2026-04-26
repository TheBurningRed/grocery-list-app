import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GroceryListItemEditDialogComponent } from './grocery-list-item-edit-dialog.component';

describe('GroceryListItemEditDialogComponent', () => {
  let component: GroceryListItemEditDialogComponent;
  let fixture: ComponentFixture<GroceryListItemEditDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GroceryListItemEditDialogComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(GroceryListItemEditDialogComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
