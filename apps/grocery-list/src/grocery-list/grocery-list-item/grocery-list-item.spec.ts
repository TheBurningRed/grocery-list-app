import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GroceryListItem } from './grocery-list-item';

describe('GroceryListItem', () => {
  let component: GroceryListItem;
  let fixture: ComponentFixture<GroceryListItem>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GroceryListItem],
    }).compileComponents();

    fixture = TestBed.createComponent(GroceryListItem);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
