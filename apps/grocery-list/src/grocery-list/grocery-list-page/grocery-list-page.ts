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
import { GroceryListItem } from 'interfaces';
import { GroceryListComponent } from '../grocery-list/grocery-list';
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
  repeat,
  Subject,
  switchMap,
} from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ConfirmDialogComponent } from '../../confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-grocery-list-page',
  imports: [MatCardModule, GroceryListComponent, MatButton, MatIcon],
  providers: [],
  templateUrl: './grocery-list-page.html',
  styleUrl: './grocery-list-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GroceryListPageComponent implements OnInit {
  private readonly groceryListService = inject(GroceryListService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);
  private destroyRef = inject(DestroyRef);

  groceriesUpdated$ = new Subject<void>();
  private readonly groceryListItemQuantityUpdated$ = new Subject<GroceryListItem>();

  readonly groceryList = signal<GroceryListItem[]>([]);

  ngOnInit(): void {
    this.fetchGroceryList();
    this.saveQuantityUpdates();
  }

  fetchGroceryList(): void {
    this.groceryListService
      .fetchGroceryList()
      .pipe(
        repeat({ delay: () => this.groceriesUpdated$ }),
        catchError(() => this.handleError('Could not load the grocery list.')),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((groceryList) => {
        this.groceryList.set(groceryList);
      });
  }

  private saveQuantityUpdates(): void {
    this.groceryListItemQuantityUpdated$
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        groupBy((item) => item.id),
        mergeMap((itemUpdates$) =>
          itemUpdates$.pipe(
            debounceTime(500),
            switchMap((item) =>
              this.groceryListService
                .updateGroceryListItem(item)
                .pipe(catchError(() => this.handleError('Could not update the item quantity.'))),
            ),
          ),
        ),
      )
      .subscribe(() => this.groceriesUpdated$.next());
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
      )
      .subscribe(() => this.groceriesUpdated$.next());
  }

  createItemDialog(): void {
    this.dialog
      .open(GroceryListItemEditDialogComponent, {
        data: { name: '', quantity: 1 },
      })
      .afterClosed()
      .pipe(
        filter((res) => !!res),
        switchMap((res: GroceryListItem) =>
          this.groceryListService
            .createGroceryListItem(res)
            .pipe(catchError(() => this.handleError('Could not create the grocery item.'))),
        ),
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
      )
      .subscribe(() => {
        this.groceriesUpdated$.next();
      });
  }

  updateItemQuantity(update: GroceryItemQuantityUpdate): void {
    const updatedItem: GroceryListItem = {
      ...update.item,
      quantity: Math.max(1, update.quantity),
    };

    this.groceryList.update((value) =>
      value.map((item) => (item.id === update.item.id ? updatedItem : item)),
    );

    this.groceryListItemQuantityUpdated$.next(updatedItem);
  }

  updateItemIsBought(groceryListItem: GroceryListItem): void {
    this.groceryListService
      .updateGroceryListItem(groceryListItem)
      .pipe(catchError(() => this.handleError('Could not update the grocery item.')))
      .subscribe(() => this.groceriesUpdated$.next());
  }

  private handleError(message: string): Observable<never> {
    this.snackBar.open(message, 'Dismiss', {
      duration: 5000,
    });

    return EMPTY;
  }
}
