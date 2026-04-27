import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GroceryListItem } from 'interfaces';

import { GroceryListItemComponent } from './grocery-list-item.component';

describe('GroceryListItemComponent', () => {
  let component: GroceryListItemComponent;
  let fixture: ComponentFixture<GroceryListItemComponent>;

  const item: GroceryListItem = {
    id: '1',
    name: 'Apples',
    quantity: 3,
    isBought: false,
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GroceryListItemComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(GroceryListItemComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('item', item);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit the item with updated bought state', () => {
    const emitSpy = vi.spyOn(component.itemBoughtChanged, 'emit');

    component.isBoughtChanged(true);

    expect(emitSpy).toHaveBeenCalledTimes(1);
    expect(emitSpy).toHaveBeenCalledWith({
      ...item,
      isBought: true,
    });
  });

  it('should render the item name and quantity', () => {
    const nativeElement = fixture.nativeElement as HTMLElement;

    expect(nativeElement.textContent).toContain('Apples');
    expect(nativeElement.textContent).toContain('3');
  });

  it('should emit the decreased quantity when remove is clicked', () => {
    const emitSpy = vi.spyOn(component.itemQuantityChanged, 'emit');

    const buttons = fixture.nativeElement.querySelectorAll(
      'button',
    ) as NodeListOf<HTMLButtonElement>;
    buttons[0].click();

    expect(emitSpy).toHaveBeenCalledTimes(1);
    expect(emitSpy).toHaveBeenCalledWith(2);
  });

  it('should emit the increased quantity when add is clicked', () => {
    const emitSpy = vi.spyOn(component.itemQuantityChanged, 'emit');

    const buttons = fixture.nativeElement.querySelectorAll(
      'button',
    ) as NodeListOf<HTMLButtonElement>;
    buttons[1].click();

    expect(emitSpy).toHaveBeenCalledTimes(1);
    expect(emitSpy).toHaveBeenCalledWith(4);
  });

  it('should emit the item when edit is clicked', () => {
    const emitSpy = vi.spyOn(component.itemEditClicked, 'emit');

    const buttons = fixture.nativeElement.querySelectorAll(
      'button',
    ) as NodeListOf<HTMLButtonElement>;
    buttons[2].click();

    expect(emitSpy).toHaveBeenCalledTimes(1);
    expect(emitSpy).toHaveBeenCalledWith(item);
  });

  it('should emit the item when delete is clicked', () => {
    const emitSpy = vi.spyOn(component.itemDeleteClicked, 'emit');

    const buttons = fixture.nativeElement.querySelectorAll(
      'button',
    ) as NodeListOf<HTMLButtonElement>;
    buttons[3].click();

    expect(emitSpy).toHaveBeenCalledTimes(1);
    expect(emitSpy).toHaveBeenCalledWith(item);
  });
});
