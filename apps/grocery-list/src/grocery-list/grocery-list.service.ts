import { inject, Injectable } from '@angular/core';
import { ApiClientService } from 'api-client';
import { Observable } from 'rxjs';
import { GroceryListItem, GroceryListItemDraft } from 'interfaces';

@Injectable({
  providedIn: 'root',
})
export class GroceryListService {
  private readonly apiClient = inject(ApiClientService);

  fetchGroceryList(): Observable<GroceryListItem[]> {
    return this.apiClient.fetchGroceryList();
  }

  updateGroceryListItem(item: GroceryListItem): Observable<void> {
    return this.apiClient.updateGroceryListItem(item);
  }

  createGroceryListItem(item: GroceryListItemDraft): Observable<void> {
    return this.apiClient.createGroceryListItem(item);
  }

  deleteGroceryListItem(item: GroceryListItem): Observable<void> {
    return this.apiClient.deleteGroceryListItem(item);
  }
}
