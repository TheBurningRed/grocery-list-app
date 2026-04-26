import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { GroceryListItem } from 'interfaces';
import { of, throwError } from 'rxjs';

import { ConfirmDialogComponent } from '../../confirm-dialog/confirm-dialog.component';
import { GroceryListItemEditDialogComponent } from '../grocery-list-item-edit-dialog/grocery-list-item-edit-dialog.component';
import { GroceryListService } from '../grocery-list.service';
import { GroceryListPageComponent } from './grocery-list-page.component';

describe('GroceryListPageComponent', () => {
  let component: GroceryListPageComponent;
  let fixture: ComponentFixture<GroceryListPageComponent>;

  let groceryListService: {
    fetchGroceryList: ReturnType<typeof vi.fn>;
    updateGroceryListItem: ReturnType<typeof vi.fn>;
    createGroceryListItem: ReturnType<typeof vi.fn>;
    deleteGroceryListItem: ReturnType<typeof vi.fn>;
  };

  let dialog: {
    open: ReturnType<typeof vi.fn>;
  };

  let snackBar: {
    open: ReturnType<typeof vi.fn>;
  };

  const groceryItem: GroceryListItem = {
    id: '1',
    name: 'Milk',
    quantity: 1,
    isBought: false,
  };

  beforeEach(async () => {
    groceryListService = {
      fetchGroceryList: vi.fn().mockReturnValue(of([groceryItem])),
      updateGroceryListItem: vi.fn().mockReturnValue(of(void 0)),
      createGroceryListItem: vi.fn().mockReturnValue(of(void 0)),
      deleteGroceryListItem: vi.fn().mockReturnValue(of(void 0)),
    };

    dialog = {
      open: vi.fn(),
    };

    snackBar = {
      open: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [GroceryListPageComponent],
      providers: [
        { provide: GroceryListService, useValue: groceryListService },
        { provide: MatDialog, useValue: dialog },
        { provide: MatSnackBar, useValue: snackBar },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(GroceryListPageComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should fetch grocery list on init', () => {
    fixture.detectChanges();

    expect(groceryListService.fetchGroceryList).toHaveBeenCalled();
    expect(component.groceryList()).toEqual([groceryItem]);
  });

  it('should show an error when fetching grocery list fails', () => {
    groceryListService.fetchGroceryList.mockReturnValue(throwError(() => new Error('Failed')));

    fixture.detectChanges();

    expect(snackBar.open).toHaveBeenCalledTimes(1);
    expect(snackBar.open).toHaveBeenCalledWith('Could not load the grocery list.', 'Dismiss', {
      duration: 5000,
    });
  });

  it('should update item quantity optimistically and debounce save', async () => {
    vi.useFakeTimers();

    component.groceryList.set([groceryItem]);
    component.ngOnInit();

    component.updateItemQuantity({
      item: groceryItem,
      quantity: 5,
    });

    expect(component.groceryList()).toEqual([
      {
        ...groceryItem,
        quantity: 5,
      },
    ]);

    await vi.advanceTimersByTimeAsync(500);

    expect(groceryListService.updateGroceryListItem).toHaveBeenCalledWith({
      ...groceryItem,
      quantity: 5,
    });
  });

  it('should not allow item quantity below one', async () => {
    vi.useFakeTimers();

    component.groceryList.set([groceryItem]);
    component.ngOnInit();

    component.updateItemQuantity({
      item: groceryItem,
      quantity: 0,
    });

    await vi.advanceTimersByTimeAsync(500);

    expect(component.groceryList()).toEqual([
      {
        ...groceryItem,
        quantity: 1,
      },
    ]);
    expect(groceryListService.updateGroceryListItem).toHaveBeenCalledWith({
      ...groceryItem,
      quantity: 1,
    });
  });

  it('should update bought state and trigger grocery list refresh', () => {
    const refreshSpy = vi.spyOn(component['groceriesUpdated$'], 'next');

    component.updateItemIsBought({
      ...groceryItem,
      isBought: true,
    });

    expect(groceryListService.updateGroceryListItem).toHaveBeenCalledTimes(1);
    expect(groceryListService.updateGroceryListItem).toHaveBeenCalledWith({
      ...groceryItem,
      isBought: true,
    });
    expect(refreshSpy).toHaveBeenCalledTimes(1);
  });

  it('should open edit dialog and update item after dialog closes with a result', () => {
    const updatedItem: GroceryListItem = {
      ...groceryItem,
      name: 'Oat milk',
    };

    dialog.open.mockReturnValue({
      afterClosed: () => of(updatedItem),
    });

    const refreshSpy = vi.spyOn(component['groceriesUpdated$'], 'next');

    component.editItemDialog(groceryItem);

    expect(dialog.open).toHaveBeenCalledTimes(1);
    expect(dialog.open).toHaveBeenCalledWith(GroceryListItemEditDialogComponent, {
      data: { ...groceryItem },
    });
    expect(groceryListService.updateGroceryListItem).toHaveBeenCalledTimes(1);
    expect(groceryListService.updateGroceryListItem).toHaveBeenCalledWith(updatedItem);
    expect(refreshSpy).toHaveBeenCalledTimes(1);
  });

  it('should not update item when edit dialog is cancelled', () => {
    dialog.open.mockReturnValue({
      afterClosed: () => of(undefined),
    });

    component.editItemDialog(groceryItem);

    expect(groceryListService.updateGroceryListItem).not.toHaveBeenCalled();
  });

  it('should open create dialog and create item after dialog closes with a result', () => {
    const newItem = {
      name: 'Bread',
      quantity: 1,
      isBought: false,
    };

    dialog.open.mockReturnValue({
      afterClosed: () => of(newItem),
    });

    const refreshSpy = vi.spyOn(component['groceriesUpdated$'], 'next');

    component.createItemDialog();

    expect(dialog.open).toHaveBeenCalledTimes(1);
    expect(dialog.open).toHaveBeenCalledWith(GroceryListItemEditDialogComponent, {
      data: { name: '', quantity: 1, isBought: false },
    });
    expect(groceryListService.createGroceryListItem).toHaveBeenCalledTimes(1);
    expect(groceryListService.createGroceryListItem).toHaveBeenCalledWith(newItem);
    expect(refreshSpy).toHaveBeenCalledTimes(1);
  });

  it('should not create item when create dialog is cancelled', () => {
    dialog.open.mockReturnValue({
      afterClosed: () => of(undefined),
    });

    component.createItemDialog();

    expect(groceryListService.createGroceryListItem).not.toHaveBeenCalled();
  });

  it('should open confirmation dialog and delete item when confirmed', () => {
    dialog.open.mockReturnValue({
      afterClosed: () => of(true),
    });

    const refreshSpy = vi.spyOn(component['groceriesUpdated$'], 'next');

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
    expect(groceryListService.deleteGroceryListItem).toHaveBeenCalledTimes(1);
    expect(groceryListService.deleteGroceryListItem).toHaveBeenCalledWith(groceryItem);
    expect(refreshSpy).toHaveBeenCalledTimes(1);
  });

  it('should not delete item when confirmation dialog is cancelled', () => {
    dialog.open.mockReturnValue({
      afterClosed: () => of(false),
    });

    component.deleteItemDialog(groceryItem);

    expect(groceryListService.deleteGroceryListItem).not.toHaveBeenCalled();
  });

  it('should show an error when updating bought state fails', () => {
    groceryListService.updateGroceryListItem.mockReturnValue(throwError(() => new Error('Failed')));

    component.updateItemIsBought(groceryItem);

    expect(snackBar.open).toHaveBeenCalledTimes(1);
    expect(snackBar.open).toHaveBeenCalledWith('Could not update the grocery item.', 'Dismiss', {
      duration: 5000,
    });
  });

  it('should rollback quantity to the previous item state when latest quantity save fails', async () => {
    vi.useFakeTimers();

    const originalItem: GroceryListItem = {
      ...groceryItem,
      quantity: 2,
    };

    groceryListService.updateGroceryListItem.mockReturnValue(throwError(() => new Error('Failed')));

    component.groceryList.set([originalItem]);
    component.ngOnInit();

    component.updateItemQuantity({
      item: originalItem,
      quantity: 5,
    });

    expect(component.groceryList()).toEqual([
      {
        ...originalItem,
        quantity: 5,
      },
    ]);

    await vi.advanceTimersByTimeAsync(500);

    expect(component.groceryList()).toEqual([originalItem]);
    expect(snackBar.open).toHaveBeenCalledWith('Could not update the item quantity.', 'Dismiss', {
      duration: 5000,
    });
  });

  it('should not trigger full grocery list refresh when quantity rollback data exists', async () => {
    vi.useFakeTimers();

    const refreshSpy = vi.spyOn(component['groceriesUpdated$'], 'next');

    groceryListService.updateGroceryListItem.mockReturnValue(throwError(() => new Error('Failed')));

    component.groceryList.set([groceryItem]);
    component.ngOnInit();

    component.updateItemQuantity({
      item: groceryItem,
      quantity: 5,
    });

    await vi.advanceTimersByTimeAsync(500);

    expect(refreshSpy).not.toHaveBeenCalled();
    expect(snackBar.open).toHaveBeenCalledWith('Could not update the item quantity.', 'Dismiss', {
      duration: 5000,
    });
  });

  it('should fall back to full grocery list refresh when quantity rollback data is missing', async () => {
    vi.useFakeTimers();

    const refreshSpy = vi.spyOn(component['groceriesUpdated$'], 'next');

    groceryListService.updateGroceryListItem.mockReturnValue(throwError(() => new Error('Failed')));

    component.groceryList.set([groceryItem]);
    component.ngOnInit();

    component.updateItemQuantity({
      item: groceryItem,
      quantity: 5,
    });

    component['quantityUpdateRollbackMap'].delete(groceryItem.id);

    await vi.advanceTimersByTimeAsync(500);

    expect(refreshSpy).toHaveBeenCalledTimes(1);
    expect(snackBar.open).toHaveBeenCalledWith('Could not update the item quantity.', 'Dismiss', {
      duration: 5000,
    });
  });

  it('should save only the latest quantity after rapid updates for the same item', async () => {
    vi.useFakeTimers();

    const originalItem: GroceryListItem = {
      ...groceryItem,
      quantity: 2,
    };

    component.groceryList.set([originalItem]);
    component.ngOnInit();

    component.updateItemQuantity({
      item: originalItem,
      quantity: 3,
    });

    component.updateItemQuantity({
      item: {
        ...originalItem,
        quantity: 3,
      },
      quantity: 4,
    });

    component.updateItemQuantity({
      item: {
        ...originalItem,
        quantity: 4,
      },
      quantity: 5,
    });

    await vi.advanceTimersByTimeAsync(500);

    expect(groceryListService.updateGroceryListItem).toHaveBeenCalledTimes(1);
    expect(groceryListService.updateGroceryListItem).toHaveBeenCalledWith({
      ...originalItem,
      quantity: 5,
    });
  });

  it('should keep quantity updates for different items independent', async () => {
    vi.useFakeTimers();

    const breadItem: GroceryListItem = {
      id: '2',
      name: 'Bread',
      quantity: 1,
      isBought: false,
    };

    component.groceryList.set([groceryItem, breadItem]);
    component.ngOnInit();

    component.updateItemQuantity({
      item: groceryItem,
      quantity: 3,
    });

    component.updateItemQuantity({
      item: breadItem,
      quantity: 4,
    });

    await vi.advanceTimersByTimeAsync(500);

    expect(groceryListService.updateGroceryListItem).toHaveBeenCalledTimes(2);
    expect(groceryListService.updateGroceryListItem).toHaveBeenCalledWith({
      ...groceryItem,
      quantity: 3,
    });
    expect(groceryListService.updateGroceryListItem).toHaveBeenCalledWith({
      ...breadItem,
      quantity: 4,
    });
  });

  it('should not rollback current quantity when handling a stale quantity update failure', () => {
    const originalItem: GroceryListItem = {
      ...groceryItem,
      quantity: 2,
    };

    const newerItem: GroceryListItem = {
      ...groceryItem,
      quantity: 5,
    };

    component.groceryList.set([newerItem]);
    component['quantityUpdateRollbackMap'].set(groceryItem.id, originalItem);
    component['quantityUpdateVersionMap'].set(groceryItem.id, 2);

    component['handleQuantityUpdateError'](
      'Could not update the item quantity.',
      groceryItem.id,
      1,
    ).subscribe();

    expect(component.groceryList()).toEqual([newerItem]);
  });

  it('should not clear rollback data when handling a stale quantity update failure', () => {
    const originalItem: GroceryListItem = {
      ...groceryItem,
      quantity: 2,
    };

    const newerItem: GroceryListItem = {
      ...groceryItem,
      quantity: 5,
    };

    component.groceryList.set([newerItem]);
    component['quantityUpdateRollbackMap'].set(groceryItem.id, originalItem);
    component['quantityUpdateVersionMap'].set(groceryItem.id, 2);

    component['handleQuantityUpdateError'](
      'Could not update the item quantity.',
      groceryItem.id,
      1,
    ).subscribe();

    expect(component['quantityUpdateRollbackMap'].get(groceryItem.id)).toEqual(originalItem);
  });
});
