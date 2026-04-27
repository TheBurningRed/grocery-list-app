import { DestroyRef, Injectable, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ApiClientService } from 'api-client';
import { GroceryListItem, GroceryListItemDraft } from 'interfaces';
import {
  EMPTY,
  Observable,
  Subject,
  catchError,
  debounceTime,
  groupBy,
  mergeMap,
  startWith,
  switchMap,
  tap,
} from 'rxjs';

import { GroceryListLoadState } from './grocery-list/grocery-list.component';
import { GroceryItemQuantityUpdate } from './grocery-list-item-quantity-update.interface';

@Injectable()
export class GroceryListPageFacade {
  private readonly apiClient = inject(ApiClientService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly destroyRef = inject(DestroyRef);

  private readonly groceriesUpdated$ = new Subject<void>();
  private readonly groceryListItemQuantityUpdated$ = new Subject<{
    item: GroceryListItem;
    version: number;
  }>();

  private readonly quantityUpdateRollbackMap = new Map<string, GroceryListItem>();
  private readonly quantityUpdateVersionMap = new Map<string, number>();

  private groceryListRefreshInitialized = false;
  private quantityUpdatesInitialized = false;

  readonly groceryList = signal<GroceryListItem[]>([]);
  readonly groceryListLoadState = signal<GroceryListLoadState>(GroceryListLoadState.LOADING);

  loadGroceryList(): void {
    this.groceryListLoadState.set(GroceryListLoadState.LOADING);
    this.initializeQuantityUpdates();
    this.initializeGroceryListRefresh();
  }

  createItem(item: GroceryListItemDraft): void {
    this.apiClient
      .createGroceryListItem(item)
      .pipe(
        catchError(() => this.handleError('Could not create the grocery item.')),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => this.refreshGroceryList());
  }

  updateItem(item: GroceryListItem): void {
    this.apiClient
      .updateGroceryListItem(item)
      .pipe(
        catchError(() => this.handleError('Could not update the grocery item.')),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => this.refreshGroceryList());
  }

  deleteItem(item: GroceryListItem): void {
    this.apiClient
      .deleteGroceryListItem(item)
      .pipe(
        catchError(() => this.handleError('Could not delete the grocery item.')),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => this.refreshGroceryList());
  }

  updateItemQuantity(update: GroceryItemQuantityUpdate): void {
    const itemId = update.item.id;

    if (!this.quantityUpdateRollbackMap.has(itemId)) {
      this.quantityUpdateRollbackMap.set(itemId, { ...update.item });
    }

    const version = (this.quantityUpdateVersionMap.get(itemId) ?? 0) + 1;
    this.quantityUpdateVersionMap.set(itemId, version);

    const updatedItem: GroceryListItem = {
      ...update.item,
      quantity: Math.max(1, update.quantity),
    };

    this.groceryList.update((value) =>
      value.map((item) => (item.id === itemId ? updatedItem : item)),
    );

    this.groceryListItemQuantityUpdated$.next({ item: updatedItem, version });
  }

  private initializeQuantityUpdates(): void {
    if (this.quantityUpdatesInitialized) {
      return;
    }

    this.quantityUpdatesInitialized = true;

    this.groceryListItemQuantityUpdated$
      .pipe(
        groupBy((update) => update.item.id),
        mergeMap((itemUpdates$) =>
          itemUpdates$.pipe(
            debounceTime(500),
            switchMap(({ item, version }) =>
              this.apiClient.updateGroceryListItem(item).pipe(
                tap(() => this.clearQuantityRollbackIfLatest(item.id, version)),
                catchError(() =>
                  this.handleQuantityUpdateError(
                    'Could not update the item quantity.',
                    item.id,
                    version,
                  ),
                ),
              ),
            ),
          ),
        ),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe();
  }

  private initializeGroceryListRefresh(): void {
    if (this.groceryListRefreshInitialized) {
      this.refreshGroceryList();
      return;
    }

    this.groceryListRefreshInitialized = true;

    this.groceriesUpdated$
      .pipe(
        startWith(undefined),
        switchMap(() =>
          this.apiClient
            .fetchGroceryList()
            .pipe(catchError(() => this.handleLoadError('Could not load the grocery list.'))),
        ),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((groceryList) => {
        this.groceryList.set(groceryList);
        this.groceryListLoadState.set(GroceryListLoadState.LOADED);
      });
  }

  private refreshGroceryList(): void {
    this.groceriesUpdated$.next();
  }

  private handleLoadError(message: string): Observable<never> {
    this.groceryListLoadState.set(GroceryListLoadState.ERROR);
    this.showError(message);

    return EMPTY;
  }

  private handleError(message: string): Observable<never> {
    this.showError(message);

    // refetch and rollback state in case of failure
    this.refreshGroceryList();

    return EMPTY;
  }

  private clearQuantityRollbackIfLatest(itemId: string, version: number): void {
    if (this.quantityUpdateVersionMap.get(itemId) !== version) {
      return;
    }

    this.quantityUpdateRollbackMap.delete(itemId);
  }

  private handleQuantityUpdateError(
    message: string,
    itemId: string,
    version: number,
  ): Observable<never> {
    if (this.quantityUpdateVersionMap.get(itemId) !== version) {
      return EMPTY;
    }

    const rollbackItem = this.quantityUpdateRollbackMap.get(itemId);

    if (!rollbackItem) {
      return this.handleError(message);
    }

    this.groceryList.update((value) =>
      value.map((item) => (item.id === itemId ? rollbackItem : item)),
    );

    this.quantityUpdateRollbackMap.delete(itemId);
    this.quantityUpdateVersionMap.delete(itemId);

    this.showError(message);

    return EMPTY;
  }

  private showError(message: string): void {
    this.snackBar.open(message, 'Dismiss', {
      duration: 5000,
    });
  }
}
