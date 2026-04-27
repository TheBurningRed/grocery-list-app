import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { By } from '@angular/platform-browser';
import { GroceryListItem } from 'interfaces';
import { of } from 'rxjs';

import { ConfirmDialogComponent } from '../../confirm-dialog/confirm-dialog.component';
import { GroceryListComponent, GroceryListLoadState } from '../grocery-list/grocery-list.component';
import { GroceryListItemEditDialogComponent } from '../grocery-list-item-edit-dialog/grocery-list-item-edit-dialog.component';
import { GroceryListPageFacade } from '../grocery-list-page-facade';
import { GroceryListPageComponent } from './grocery-list-page.component';

describe('GroceryListPageComponent', () => {
  let component: GroceryListPageComponent;
  let fixture: ComponentFixture<GroceryListPageComponent>;

  let facade: {
    groceryList: ReturnType<typeof signal<GroceryListItem[]>>;
    groceryListLoadState: ReturnType<typeof signal<GroceryListLoadState>>;
    loadGroceryList: ReturnType<typeof vi.fn>;
    createItem: ReturnType<typeof vi.fn>;
    updateItem: ReturnType<typeof vi.fn>;
    deleteItem: ReturnType<typeof vi.fn>;
    updateItemQuantity: ReturnType<typeof vi.fn>;
  };

  let dialog: {
    open: ReturnType<typeof vi.fn>;
  };

  const groceryItem: GroceryListItem = {
    id: '1',
    name: 'Milk',
    quantity: 1,
    isBought: false,
  };

  beforeEach(async () => {
    facade = {
      groceryList: signal([groceryItem]),
      groceryListLoadState: signal(GroceryListLoadState.LOADED),
      loadGroceryList: vi.fn(),
      createItem: vi.fn(),
      updateItem: vi.fn(),
      deleteItem: vi.fn(),
      updateItemQuantity: vi.fn(),
    };

    dialog = {
      open: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [GroceryListPageComponent],
      providers: [{ provide: MatDialog, useValue: dialog }],
    })
      .overrideComponent(GroceryListPageComponent, {
        set: {
          providers: [{ provide: GroceryListPageFacade, useValue: facade }],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(GroceryListPageComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load grocery list on init', () => {
    fixture.detectChanges();

    expect(facade.loadGroceryList).toHaveBeenCalledTimes(1);
  });

  it('should expose facade grocery list signal', () => {
    expect(component.groceryList()).toEqual([groceryItem]);
  });

  it('should expose facade grocery list load state signal', () => {
    expect(component.groceryListLoadState()).toBe(GroceryListLoadState.LOADED);
  });

  it('should open edit dialog and delegate update item after dialog closes with a result', () => {
    const updatedItem: GroceryListItem = {
      ...groceryItem,
      name: 'Oat milk',
    };

    dialog.open.mockReturnValue({
      afterClosed: () => of(updatedItem),
    });

    component.editItemDialog(groceryItem);

    expect(dialog.open).toHaveBeenCalledTimes(1);
    expect(dialog.open).toHaveBeenCalledWith(GroceryListItemEditDialogComponent, {
      data: { ...groceryItem },
    });
    expect(facade.updateItem).toHaveBeenCalledTimes(1);
    expect(facade.updateItem).toHaveBeenCalledWith(updatedItem);
  });

  it('should not delegate update item when edit dialog is cancelled', () => {
    dialog.open.mockReturnValue({
      afterClosed: () => of(undefined),
    });

    component.editItemDialog(groceryItem);

    expect(facade.updateItem).not.toHaveBeenCalled();
  });

  it('should open create dialog and delegate create item after dialog closes with a result', () => {
    const newItem = {
      name: 'Bread',
      quantity: 1,
      isBought: false,
    };

    dialog.open.mockReturnValue({
      afterClosed: () => of(newItem),
    });

    component.createItemDialog();

    expect(dialog.open).toHaveBeenCalledTimes(1);
    expect(dialog.open).toHaveBeenCalledWith(GroceryListItemEditDialogComponent, {
      data: { name: '', quantity: 1, isBought: false },
    });
    expect(facade.createItem).toHaveBeenCalledTimes(1);
    expect(facade.createItem).toHaveBeenCalledWith(newItem);
  });

  it('should not delegate create item when create dialog is cancelled', () => {
    dialog.open.mockReturnValue({
      afterClosed: () => of(undefined),
    });

    component.createItemDialog();

    expect(facade.createItem).not.toHaveBeenCalled();
  });

  it('should open confirmation dialog and delegate delete item when confirmed', () => {
    dialog.open.mockReturnValue({
      afterClosed: () => of(true),
    });

    component.deleteItemDialog(groceryItem);

    expect(dialog.open).toHaveBeenCalledTimes(1);
    expect(dialog.open).toHaveBeenCalledWith(ConfirmDialogComponent, {
      data: {
        title: 'Delete item',
        message: 'Are you sure you want to delete "Milk"?',
        confirmText: 'Delete',
        cancelText: 'Cancel',
      },
    });
    expect(facade.deleteItem).toHaveBeenCalledTimes(1);
    expect(facade.deleteItem).toHaveBeenCalledWith(groceryItem);
  });

  it('should not delegate delete item when confirmation dialog is cancelled', () => {
    dialog.open.mockReturnValue({
      afterClosed: () => of(false),
    });

    component.deleteItemDialog(groceryItem);

    expect(facade.deleteItem).not.toHaveBeenCalled();
  });

  it('should delegate quantity updates to the facade', () => {
    const update = {
      item: groceryItem,
      quantity: 5,
    };

    component.updateItemQuantity(update);

    expect(facade.updateItemQuantity).toHaveBeenCalledTimes(1);
    expect(facade.updateItemQuantity).toHaveBeenCalledWith(update);
  });

  it('should delegate bought-state updates to the facade', () => {
    const updatedItem: GroceryListItem = {
      ...groceryItem,
      isBought: true,
    };

    component.updateItemIsBought(updatedItem);

    expect(facade.updateItem).toHaveBeenCalledWith(updatedItem);
  });

  it('should render loading state', () => {
    facade.groceryListLoadState.set(GroceryListLoadState.LOADING);

    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Loading...');
    expect(fixture.debugElement.query(By.directive(GroceryListComponent))).toBeNull();
  });

  it('should render error state', () => {
    facade.groceryListLoadState.set(GroceryListLoadState.ERROR);

    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Could not load the grocery list.');
    expect(fixture.debugElement.query(By.directive(GroceryListComponent))).toBeNull();
  });

  it('should render empty list state', () => {
    facade.groceryList.set([]);
    facade.groceryListLoadState.set(GroceryListLoadState.LOADED);

    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('No items in the list yet');
  });

  it('should render grocery list items', () => {
    facade.groceryList.set([groceryItem]);
    facade.groceryListLoadState.set(GroceryListLoadState.LOADED);

    fixture.detectChanges();

    const groceryList = fixture.debugElement.query(By.directive(GroceryListComponent));

    expect(groceryList).not.toBeNull();
    expect(groceryList.componentInstance.groceryListItems()).toEqual([groceryItem]);
    expect(fixture.nativeElement.textContent).toContain('Milk');
  });

  it('should open create item dialog when add item button is clicked', () => {
    dialog.open.mockReturnValue({
      afterClosed: () => of(undefined),
    });

    fixture.detectChanges();

    const addButton = fixture.debugElement.query(
      By.css('button[aria-label="Add a new grocery item"]'),
    );

    addButton.triggerEventHandler('click');

    expect(dialog.open).toHaveBeenCalledTimes(1);
    expect(dialog.open).toHaveBeenCalledWith(GroceryListItemEditDialogComponent, {
      data: { name: '', quantity: 1, isBought: false },
    });
  });

  it('should wire edit events from the grocery list child component', () => {
    dialog.open.mockReturnValue({
      afterClosed: () => of(undefined),
    });

    fixture.detectChanges();

    const groceryList = fixture.debugElement.query(By.directive(GroceryListComponent));

    groceryList.triggerEventHandler('itemEditClicked', groceryItem);

    expect(dialog.open).toHaveBeenCalledTimes(1);
    expect(dialog.open).toHaveBeenCalledWith(GroceryListItemEditDialogComponent, {
      data: { ...groceryItem },
    });
  });

  it('should wire delete events from the grocery list child component', () => {
    dialog.open.mockReturnValue({
      afterClosed: () => of(false),
    });

    fixture.detectChanges();

    const groceryList = fixture.debugElement.query(By.directive(GroceryListComponent));

    groceryList.triggerEventHandler('itemDeleteClicked', groceryItem);

    expect(dialog.open).toHaveBeenCalledTimes(1);
    expect(dialog.open).toHaveBeenCalledWith(ConfirmDialogComponent, {
      data: {
        title: 'Delete item',
        message: 'Are you sure you want to delete "Milk"?',
        confirmText: 'Delete',
        cancelText: 'Cancel',
      },
    });
  });

  it('should render accessibility-visible labels and text', () => {
    fixture.detectChanges();

    const addButton = fixture.debugElement.query(
      By.css('button[aria-label="Add a new grocery item"]'),
    );
    const groceryList = fixture.debugElement.query(By.css('ul[aria-label="Grocery items"]'));

    expect(fixture.nativeElement.textContent).toContain('My groceries list');
    expect(fixture.nativeElement.textContent).toContain('Add item');
    expect(addButton).not.toBeNull();
    expect(groceryList).not.toBeNull();
  });

  it('should pass child quantity and bought-state events through to the facade', () => {
    fixture.detectChanges();

    const groceryList = fixture.debugElement.query(By.directive(GroceryListComponent));

    groceryList.triggerEventHandler('itemQuantityChanged', {
      item: groceryItem,
      quantity: 3,
    });

    groceryList.triggerEventHandler('itemBoughtChanged', {
      ...groceryItem,
      isBought: true,
    });

    expect(facade.updateItemQuantity).toHaveBeenCalledWith({
      item: groceryItem,
      quantity: 3,
    });
    expect(facade.updateItem).toHaveBeenCalledWith({
      ...groceryItem,
      isBought: true,
    });
  });
});
