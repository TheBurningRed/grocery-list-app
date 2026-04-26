import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GroceryListPage } from './grocery-list-page';

describe('GroceryListPage', () => {
  let component: GroceryListPage;
  let fixture: ComponentFixture<GroceryListPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GroceryListPage],
    }).compileComponents();

    fixture = TestBed.createComponent(GroceryListPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
