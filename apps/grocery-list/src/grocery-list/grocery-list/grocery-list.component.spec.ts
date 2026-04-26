import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GroceryListItem } from 'interfaces';

import { GroceryListComponent } from './grocery-list.component';

describe('GroceryListComponent', () => {
  let component: GroceryListComponent;
  let fixture: ComponentFixture<GroceryListComponent>;

  const groceryListItems: GroceryListItem[] = [
    {
      id: '1',
      name: 'Milk',
      quantity: 2,
      isBought: false,
    },
    {
      id: '2',
      name: 'Bread',
      quantity: 1,
      isBought: true,
    },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GroceryListComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(GroceryListComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('groceryListItems', groceryListItems);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render all grocery list items', () => {
    const nativeElement = fixture.nativeElement as HTMLElement;

    expect(nativeElement.textContent).toContain('Milk');
    expect(nativeElement.textContent).toContain('Bread');
  });

  it('should emit quantity changes from child item components', () => {
    const emitSpy = vi.spyOn(component.itemQuantityChanged, 'emit');

    component.itemQuantityChanged.emit({
      item: groceryListItems[0],
      quantity: 5,
    });

    expect(emitSpy).toHaveBeenCalledTimes(1);
    expect(emitSpy).toHaveBeenCalledWith({
      item: groceryListItems[0],
      quantity: 5,
    });
  });

  it('should emit edit events', () => {
    const emitSpy = vi.spyOn(component.itemEditClicked, 'emit');

    component.itemEditClicked.emit(groceryListItems[0]);

    expect(emitSpy).toHaveBeenCalledTimes(1);
    expect(emitSpy).toHaveBeenCalledWith(groceryListItems[0]);
  });

  it('should emit delete events', () => {
    const emitSpy = vi.spyOn(component.itemDeleteClicked, 'emit');

    component.itemDeleteClicked.emit(groceryListItems[0]);

    expect(emitSpy).toHaveBeenCalledTimes(1);
    expect(emitSpy).toHaveBeenCalledWith(groceryListItems[0]);
  });

  it('should emit bought changed events', () => {
    const updatedItem: GroceryListItem = {
      ...groceryListItems[0],
      isBought: true,
    };

    const emitSpy = vi.spyOn(component.itemBoughtChanged, 'emit');

    component.itemBoughtChanged.emit(updatedItem);

    expect(emitSpy).toHaveBeenCalledTimes(1);
    expect(emitSpy).toHaveBeenCalledWith(updatedItem);
  });
});
