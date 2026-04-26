import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { GroceryListService } from '../grocery-list.service';
import { GroceryListItem, GroceryListItemDraft } from 'interfaces';
import { GroceryListComponent, GroceryListLoadState } from '../grocery-list/grocery-list.component';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { GroceryItemQuantityUpdate } from '../grocery-list-item-quantity-update.interface';
import { GroceryListItemEditDialogComponent } from '../grocery-list-item-edit-dialog/grocery-list-item-edit-dialog.component';
import {
  catchError,
  debounceTime,
  EMPTY,
  filter,
  groupBy,
  mergeMap,
  Observable,
  startWith,
  Subject,
  switchMap,
  tap,
} from 'rxjs';

import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ConfirmDialogComponent } from '../../confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-grocery-list-page',
  imports: [MatCardModule, GroceryListComponent, MatButton, MatIcon],
  templateUrl: './grocery-list-page.component.html',
  styleUrl: './grocery-list-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GroceryListPageComponent implements OnInit {
  private readonly groceryListService = inject(GroceryListService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);
  private destroyRef = inject(DestroyRef);

  private readonly groceriesUpdated$ = new Subject<void>();
  private readonly groceryListItemQuantityUpdated$ = new Subject<{
    item: GroceryListItem;
    version: number;
  }>();
  private readonly quantityUpdateRollbackMap = new Map<string, GroceryListItem>();
  private readonly quantityUpdateVersionMap = new Map<string, number>();

  readonly groceryList = signal<GroceryListItem[]>([]);
  readonly groceryListLoadState = signal<GroceryListLoadState>('loading');

  ngOnInit(): void {
    this.fetchGroceryList();
    this.saveQuantityUpdates();
  }

  fetchGroceryList(): void {
    this.groceryListLoadState.set('loading');

    this.groceriesUpdated$
      .pipe(
        startWith(''),
        switchMap(() => this.groceryListService.fetchGroceryList()),
        catchError(() => this.handleLoadError('Could not load the grocery list.')),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((groceryList) => {
        this.groceryList.set(groceryList);
        this.groceryListLoadState.set('loaded');
      });
  }

  private saveQuantityUpdates(): void {
    this.groceryListItemQuantityUpdated$
      .pipe(
        groupBy((update) => update.item.id),
        mergeMap((itemUpdates$) =>
          itemUpdates$.pipe(
            debounceTime(500),
            switchMap(({ item, version }) =>
              this.groceryListService.updateGroceryListItem(item).pipe(
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

  editItemDialog(groceryListItem: GroceryListItem): void {
    this.dialog
      .open(GroceryListItemEditDialogComponent, {
        data: { ...groceryListItem },
      })
      .afterClosed()
      .pipe(
        filter((res) => !!res),
        switchMap((res: GroceryListItem) =>
          this.groceryListService
            .updateGroceryListItem(res)
            .pipe(catchError(() => this.handleError('Could not update the grocery item.'))),
        ),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => this.groceriesUpdated$.next());
  }

  createItemDialog(): void {
    this.dialog
      .open(GroceryListItemEditDialogComponent, {
        data: { name: '', quantity: 1, isBought: false },
      })
      .afterClosed()
      .pipe(
        filter((res) => !!res),
        switchMap((res: GroceryListItemDraft) =>
          this.groceryListService
            .createGroceryListItem(res)
            .pipe(catchError(() => this.handleError('Could not create the grocery item.'))),
        ),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => {
        this.groceriesUpdated$.next();
      });
  }

  deleteItemDialog(groceryListItem: GroceryListItem): void {
    this.dialog
      .open(ConfirmDialogComponent, {
        data: {
          title: 'Delete item',
          message: `Are you sure you want to delete "${groceryListItem.name}"?`,
          confirmText: 'Delete',
          cancelText: 'Cancel',
        },
      })
      .afterClosed()
      .pipe(
        filter((confirmed) => confirmed),
        switchMap(() =>
          this.groceryListService
            .deleteGroceryListItem(groceryListItem)
            .pipe(catchError(() => this.handleError('Could not delete the grocery item.'))),
        ),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => {
        this.groceriesUpdated$.next();
      });
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

  updateItemIsBought(groceryListItem: GroceryListItem): void {
    this.groceryListService
      .updateGroceryListItem(groceryListItem)
      .pipe(
        catchError(() => this.handleError('Could not update the grocery item.')),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => this.groceriesUpdated$.next());
  }

  private handleLoadError(message: string): Observable<never> {
    this.groceryListLoadState.set('error');

    this.showError(message);

    return EMPTY;
  }

  private handleError(message: string): Observable<never> {
    this.showError(message);

    // refetch and rollback state in case of failure
    this.groceriesUpdated$.next();

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
