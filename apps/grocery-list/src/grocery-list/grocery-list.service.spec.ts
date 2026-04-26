import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { ApiClientService } from 'api-client';
import { GroceryListItem, GroceryListItemDraft } from 'interfaces';

import { GroceryListService } from './grocery-list.service';

describe('GroceryListService', () => {
  let service: GroceryListService;
  let apiClient: {
    fetchGroceryList: ReturnType<typeof vi.fn>;
    updateGroceryListItem: ReturnType<typeof vi.fn>;
    createGroceryListItem: ReturnType<typeof vi.fn>;
    deleteGroceryListItem: ReturnType<typeof vi.fn>;
  };

  const groceryItem: GroceryListItem = {
    id: '1',
    name: 'Milk',
    quantity: 2,
    isBought: false,
  };

  beforeEach(() => {
    apiClient = {
      fetchGroceryList: vi.fn(),
      updateGroceryListItem: vi.fn(),
      createGroceryListItem: vi.fn(),
      deleteGroceryListItem: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [{ provide: ApiClientService, useValue: apiClient }],
    });

    service = TestBed.inject(GroceryListService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch grocery list using the API client', () => {
    const groceryList: GroceryListItem[] = [groceryItem];
    apiClient.fetchGroceryList.mockReturnValue(of(groceryList));

    service.fetchGroceryList().subscribe((result) => {
      expect(result).toEqual(groceryList);
    });

    expect(apiClient.fetchGroceryList).toHaveBeenCalledTimes(1);
    expect(apiClient.fetchGroceryList).toHaveBeenCalledWith();
  });

  it('should update a grocery list item using the API client', () => {
    apiClient.updateGroceryListItem.mockReturnValue(of(void 0));

    service.updateGroceryListItem(groceryItem).subscribe((result) => {
      expect(result).toBeUndefined();
    });

    expect(apiClient.updateGroceryListItem).toHaveBeenCalledTimes(1);
    expect(apiClient.updateGroceryListItem).toHaveBeenCalledWith(groceryItem);
  });

  it('should create a grocery list item using the API client', () => {
    const draft: GroceryListItemDraft = {
      name: 'Bread',
      quantity: 1,
    };

    apiClient.createGroceryListItem.mockReturnValue(of(void 0));

    service.createGroceryListItem(draft).subscribe((result) => {
      expect(result).toBeUndefined();
    });

    expect(apiClient.createGroceryListItem).toHaveBeenCalledTimes(1);
    expect(apiClient.createGroceryListItem).toHaveBeenCalledWith(draft);
  });

  it('should delete a grocery list item using the API client', () => {
    apiClient.deleteGroceryListItem.mockReturnValue(of(void 0));

    service.deleteGroceryListItem(groceryItem).subscribe((result) => {
      expect(result).toBeUndefined();
    });

    expect(apiClient.deleteGroceryListItem).toHaveBeenCalledTimes(1);
    expect(apiClient.deleteGroceryListItem).toHaveBeenCalledWith(groceryItem);
  });
});
