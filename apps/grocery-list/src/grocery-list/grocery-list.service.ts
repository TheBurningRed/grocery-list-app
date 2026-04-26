import { inject, Injectable } from '@angular/core';
import { ApiClientService } from 'api-client';

@Injectable({
  providedIn: 'root',
})
export class GroceryListService {
  private readonly apiClient = inject(ApiClientService);

  fetchGroceryList() {
    return this.apiClient.fetchGroceryList();
  }
}
