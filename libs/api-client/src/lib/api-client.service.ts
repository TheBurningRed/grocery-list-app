import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';
import { API_URL } from './api-url.token';
import { GroceryListItem, GroceryListItemDraft } from 'interfaces';

@Injectable({
  providedIn: 'root',
})
export class ApiClientService {
  private readonly httpClient = inject(HttpClient);

  private readonly apiUrl = inject(API_URL);

  fetchGroceryList(): Observable<GroceryListItem[]> {
    return this.httpClient.get<GroceryListItem[]>(`${this.apiUrl}/grocery-list`);
  }

  updateGroceryListItem(item: GroceryListItem): Observable<GroceryListItem> {
    return this.httpClient.put<GroceryListItem>(`${this.apiUrl}/grocery-list/${item.id}`, item);
  }

  createGroceryListItem(item: GroceryListItemDraft): Observable<GroceryListItem> {
    return this.httpClient.post<GroceryListItem>(`${this.apiUrl}/grocery-list`, item);
  }

  deleteGroceryListItem(item: GroceryListItem): Observable<void> {
    return this.httpClient.delete<void>(`${this.apiUrl}/grocery-list/${item.id}`);
  }
}
