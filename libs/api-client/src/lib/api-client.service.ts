import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';
import { API_URL } from './api-url.token';
import { GroceryListItem } from 'interfaces';

@Injectable()
export class ApiClientService {
  httpClient = inject(HttpClient);

  apiUrl = inject(API_URL);

  fetchGroceryList(): Observable<GroceryListItem[]> {
    return this.httpClient.get<GroceryListItem[]>(`${this.apiUrl}/products`);
  }
}
