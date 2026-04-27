import { TestBed } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ApiClientService } from 'api-client';
import { GroceryListItem } from 'interfaces';
import { of, throwError } from 'rxjs';

import { GroceryListPageFacade } from './grocery-list-page-facade';
import { GroceryListLoadState } from './grocery-list/grocery-list.component';

describe('GroceryListPageFacade', () => {
  let facade: GroceryListPageFacade;

  let apiClient: {
    fetchGroceryList: ReturnType<typeof vi.fn>;
    updateGroceryListItem: ReturnType<typeof vi.fn>;
    createGroceryListItem: ReturnType<typeof vi.fn>;
    deleteGroceryListItem: ReturnType<typeof vi.fn>;
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

  beforeEach(() => {
    apiClient = {
      fetchGroceryList: vi.fn().mockReturnValue(of([groceryItem])),
      updateGroceryListItem: vi.fn().mockReturnValue(of(void 0)),
      createGroceryListItem: vi.fn().mockReturnValue(of(void 0)),
      deleteGroceryListItem: vi.fn().mockReturnValue(of(void 0)),
    };

    snackBar = {
      open: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        GroceryListPageFacade,
        { provide: ApiClientService, useValue: apiClient },
        { provide: MatSnackBar, useValue: snackBar },
      ],
    });

    facade = TestBed.inject(GroceryListPageFacade);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should be created', () => {
    expect(facade).toBeTruthy();
  });

  it('should fetch grocery list on load', () => {
    facade.loadGroceryList();

    expect(apiClient.fetchGroceryList).toHaveBeenCalled();
    expect(facade.groceryList()).toEqual([groceryItem]);
    expect(facade.groceryListLoadState()).toBe('loaded');
  });

  it('should not duplicate refresh subscriptions when loadGroceryList is called twice', () => {
    facade.loadGroceryList();
    facade.loadGroceryList();

    apiClient.fetchGroceryList.mockClear();

    facade.createItem({
      name: 'Bread',
      quantity: 1,
      isBought: false,
    });

    expect(apiClient.fetchGroceryList).toHaveBeenCalledTimes(1);
  });

  it('should show an error and set error load state when fetching grocery list fails', () => {
    apiClient.fetchGroceryList.mockReturnValue(throwError(() => new Error('Failed')));

    facade.loadGroceryList();

    expect(facade.groceryListLoadState()).toBe('error');
    expect(snackBar.open).toHaveBeenCalledTimes(1);
    expect(snackBar.open).toHaveBeenCalledWith('Could not load the grocery list.', 'Dismiss', {
      duration: 5000,
    });
  });

  it('should allow refreshing again after a grocery list load failure', () => {
    apiClient.fetchGroceryList
      .mockReturnValueOnce(throwError(() => new Error('Failed')))
      .mockReturnValueOnce(of([groceryItem]));

    facade.loadGroceryList();

    expect(facade.groceryListLoadState()).toBe(GroceryListLoadState.ERROR);

    facade.loadGroceryList();

    expect(facade.groceryList()).toEqual([groceryItem]);
    expect(facade.groceryListLoadState()).toBe(GroceryListLoadState.LOADED);
  });

  it('should create item and trigger grocery list refresh', () => {
    const newItem = {
      name: 'Bread',
      quantity: 1,
      isBought: false,
    };

    facade.loadGroceryList();

    apiClient.fetchGroceryList.mockClear();

    facade.createItem(newItem);

    expect(apiClient.createGroceryListItem).toHaveBeenCalledTimes(1);
    expect(apiClient.createGroceryListItem).toHaveBeenCalledWith(newItem);
    expect(apiClient.fetchGroceryList).toHaveBeenCalledTimes(1);
  });

  it('should update grocery list signal with newly fetched data after creating an item', () => {
    const newItem = {
      name: 'Bread',
      quantity: 1,
      isBought: false,
    };

    const refreshedItem: GroceryListItem = {
      id: '2',
      name: 'Bread',
      quantity: 1,
      isBought: false,
    };

    apiClient.fetchGroceryList
      .mockReturnValueOnce(of([groceryItem]))
      .mockReturnValueOnce(of([groceryItem, refreshedItem]));

    facade.loadGroceryList();

    facade.createItem(newItem);

    expect(facade.groceryList()).toEqual([groceryItem, refreshedItem]);
  });

  it('should show correct snackbar when creating an item fails', () => {
    const newItem = {
      name: 'Bread',
      quantity: 1,
      isBought: false,
    };

    apiClient.createGroceryListItem.mockReturnValue(throwError(() => new Error('Failed')));

    facade.loadGroceryList();

    apiClient.fetchGroceryList.mockClear();

    facade.createItem(newItem);

    expect(snackBar.open).toHaveBeenCalledTimes(1);
    expect(snackBar.open).toHaveBeenCalledWith('Could not create the grocery item.', 'Dismiss', {
      duration: 5000,
    });
    expect(apiClient.fetchGroceryList).toHaveBeenCalledTimes(1);
  });

  it('should update item and trigger grocery list refresh', () => {
    const updatedItem: GroceryListItem = {
      ...groceryItem,
      name: 'Oat milk',
    };

    facade.loadGroceryList();

    apiClient.fetchGroceryList.mockClear();

    facade.updateItem(updatedItem);

    expect(apiClient.updateGroceryListItem).toHaveBeenCalledTimes(1);
    expect(apiClient.updateGroceryListItem).toHaveBeenCalledWith(updatedItem);
    expect(apiClient.fetchGroceryList).toHaveBeenCalledTimes(1);
  });

  it('should delete item and trigger grocery list refresh', () => {
    facade.loadGroceryList();

    apiClient.fetchGroceryList.mockClear();

    facade.deleteItem(groceryItem);

    expect(apiClient.deleteGroceryListItem).toHaveBeenCalledTimes(1);
    expect(apiClient.deleteGroceryListItem).toHaveBeenCalledWith(groceryItem);
    expect(apiClient.fetchGroceryList).toHaveBeenCalledTimes(1);
  });

  it('should update grocery list signal with newly fetched data after deleting an item', () => {
    apiClient.fetchGroceryList.mockReturnValueOnce(of([groceryItem])).mockReturnValueOnce(of([]));

    facade.loadGroceryList();

    facade.deleteItem(groceryItem);

    expect(facade.groceryList()).toEqual([]);
  });

  it('should show correct snackbar when deleting an item fails', () => {
    apiClient.deleteGroceryListItem.mockReturnValue(throwError(() => new Error('Failed')));

    facade.loadGroceryList();

    apiClient.fetchGroceryList.mockClear();

    facade.deleteItem(groceryItem);

    expect(snackBar.open).toHaveBeenCalledTimes(1);
    expect(snackBar.open).toHaveBeenCalledWith('Could not delete the grocery item.', 'Dismiss', {
      duration: 5000,
    });
    expect(apiClient.fetchGroceryList).toHaveBeenCalledTimes(1);
  });

  it('should not retain stale state across component-scoped facade instances', () => {
    const firstInstanceItem: GroceryListItem = {
      id: '1',
      name: 'Milk',
      quantity: 1,
      isBought: false,
    };

    const secondInstanceItem: GroceryListItem = {
      id: '2',
      name: 'Bread',
      quantity: 2,
      isBought: false,
    };

    apiClient.fetchGroceryList.mockReturnValueOnce(of([firstInstanceItem]));

    const firstFacade = TestBed.inject(GroceryListPageFacade);

    firstFacade.loadGroceryList();

    expect(firstFacade.groceryList()).toEqual([firstInstanceItem]);

    TestBed.resetTestingModule();

    const secondApiClient = {
      fetchGroceryList: vi.fn().mockReturnValue(of([secondInstanceItem])),
      updateGroceryListItem: vi.fn().mockReturnValue(of(void 0)),
      createGroceryListItem: vi.fn().mockReturnValue(of(void 0)),
      deleteGroceryListItem: vi.fn().mockReturnValue(of(void 0)),
    };

    const secondSnackBar = {
      open: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        GroceryListPageFacade,
        { provide: ApiClientService, useValue: secondApiClient },
        { provide: MatSnackBar, useValue: secondSnackBar },
      ],
    });

    const secondFacade = TestBed.inject(GroceryListPageFacade);

    expect(secondFacade.groceryList()).toEqual([]);

    secondFacade.loadGroceryList();

    expect(secondFacade.groceryList()).toEqual([secondInstanceItem]);
    expect(secondFacade.groceryList()).not.toEqual([firstInstanceItem]);
  });

  it('should update item quantity optimistically and debounce save', async () => {
    vi.useFakeTimers();

    facade.loadGroceryList();

    facade.updateItemQuantity({
      item: groceryItem,
      quantity: 5,
    });

    expect(facade.groceryList()).toEqual([
      {
        ...groceryItem,
        quantity: 5,
      },
    ]);

    await vi.advanceTimersByTimeAsync(500);

    expect(apiClient.updateGroceryListItem).toHaveBeenCalledWith({
      ...groceryItem,
      quantity: 5,
    });
  });

  it('should not allow item quantity below one', async () => {
    vi.useFakeTimers();

    facade.loadGroceryList();

    facade.updateItemQuantity({
      item: groceryItem,
      quantity: 0,
    });

    await vi.advanceTimersByTimeAsync(500);

    expect(facade.groceryList()).toEqual([
      {
        ...groceryItem,
        quantity: 1,
      },
    ]);
    expect(apiClient.updateGroceryListItem).toHaveBeenCalledWith({
      ...groceryItem,
      quantity: 1,
    });
  });

  it('should rollback quantity to the previous item state when latest quantity save fails', async () => {
    vi.useFakeTimers();

    const originalItem: GroceryListItem = {
      ...groceryItem,
      quantity: 2,
    };

    apiClient.fetchGroceryList.mockReturnValue(of([originalItem]));
    apiClient.updateGroceryListItem.mockReturnValue(throwError(() => new Error('Failed')));

    facade.loadGroceryList();

    facade.updateItemQuantity({
      item: originalItem,
      quantity: 5,
    });

    expect(facade.groceryList()).toEqual([
      {
        ...originalItem,
        quantity: 5,
      },
    ]);

    await vi.advanceTimersByTimeAsync(500);

    expect(facade.groceryList()).toEqual([originalItem]);
    expect(snackBar.open).toHaveBeenCalledWith('Could not update the item quantity.', 'Dismiss', {
      duration: 5000,
    });
  });

  it('should not trigger full grocery list refresh when quantity rollback data exists', async () => {
    vi.useFakeTimers();

    apiClient.updateGroceryListItem.mockReturnValue(throwError(() => new Error('Failed')));

    facade.loadGroceryList();

    apiClient.fetchGroceryList.mockClear();

    facade.updateItemQuantity({
      item: groceryItem,
      quantity: 5,
    });

    await vi.advanceTimersByTimeAsync(500);

    expect(apiClient.fetchGroceryList).not.toHaveBeenCalled();
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

    apiClient.fetchGroceryList.mockReturnValue(of([originalItem]));

    facade.loadGroceryList();

    facade.updateItemQuantity({
      item: originalItem,
      quantity: 3,
    });

    facade.updateItemQuantity({
      item: {
        ...originalItem,
        quantity: 3,
      },
      quantity: 4,
    });

    facade.updateItemQuantity({
      item: {
        ...originalItem,
        quantity: 4,
      },
      quantity: 5,
    });

    await vi.advanceTimersByTimeAsync(500);

    expect(apiClient.updateGroceryListItem).toHaveBeenCalledTimes(1);
    expect(apiClient.updateGroceryListItem).toHaveBeenCalledWith({
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

    apiClient.fetchGroceryList.mockReturnValue(of([groceryItem, breadItem]));

    facade.loadGroceryList();

    facade.updateItemQuantity({
      item: groceryItem,
      quantity: 3,
    });

    facade.updateItemQuantity({
      item: breadItem,
      quantity: 4,
    });

    await vi.advanceTimersByTimeAsync(500);

    expect(apiClient.updateGroceryListItem).toHaveBeenCalledTimes(2);
    expect(apiClient.updateGroceryListItem).toHaveBeenCalledWith({
      ...groceryItem,
      quantity: 3,
    });
    expect(apiClient.updateGroceryListItem).toHaveBeenCalledWith({
      ...breadItem,
      quantity: 4,
    });
  });

  it('should ignore stale quantity update failures', async () => {
    vi.useFakeTimers();

    const originalItem: GroceryListItem = {
      ...groceryItem,
      quantity: 2,
    };

    apiClient.fetchGroceryList.mockReturnValue(of([originalItem]));
    apiClient.updateGroceryListItem
      .mockReturnValueOnce(throwError(() => new Error('Failed')))
      .mockReturnValueOnce(of(void 0));

    facade.loadGroceryList();

    facade.updateItemQuantity({
      item: originalItem,
      quantity: 3,
    });

    await vi.advanceTimersByTimeAsync(500);

    facade.updateItemQuantity({
      item: {
        ...originalItem,
        quantity: 3,
      },
      quantity: 5,
    });

    await vi.advanceTimersByTimeAsync(500);

    expect(facade.groceryList()).toEqual([
      {
        ...originalItem,
        quantity: 5,
      },
    ]);
  });
});
