import { ChangeDetectionStrategy, Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButton } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import { GroceryListItem, GroceryListItemDraft } from 'interfaces';
import { filter } from 'rxjs';

import { ConfirmDialogComponent } from '../../confirm-dialog/confirm-dialog.component';
import { GroceryListComponent, GroceryListLoadState } from '../grocery-list/grocery-list.component';
import { GroceryItemQuantityUpdate } from '../grocery-list-item-quantity-update.interface';
import { GroceryListItemEditDialogComponent } from '../grocery-list-item-edit-dialog/grocery-list-item-edit-dialog.component';
import { GroceryListPageFacade } from '../grocery-list-page-facade';

@Component({
  selector: 'app-grocery-list-page',
  imports: [MatCardModule, GroceryListComponent, MatButton, MatIcon],
  providers: [GroceryListPageFacade],
  templateUrl: './grocery-list-page.component.html',
  styleUrl: './grocery-list-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GroceryListPageComponent implements OnInit {
  private readonly dialog = inject(MatDialog);
  private readonly destroyRef = inject(DestroyRef);
  private readonly groceryListPageFacade = inject(GroceryListPageFacade);

  readonly groceryList = this.groceryListPageFacade.groceryList;
  readonly groceryListLoadState = this.groceryListPageFacade.groceryListLoadState;
  readonly GroceryListLoadState = GroceryListLoadState;

  ngOnInit(): void {
    this.groceryListPageFacade.loadGroceryList();
  }

  editItemDialog(groceryListItem: GroceryListItem): void {
    this.dialog
      .open(GroceryListItemEditDialogComponent, {
        data: { ...groceryListItem },
      })
      .afterClosed()
      .pipe(
        filter((res) => !!res),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((res: GroceryListItem) => this.groceryListPageFacade.updateItem(res));
  }

  createItemDialog(): void {
    this.dialog
      .open(GroceryListItemEditDialogComponent, {
        data: { name: '', quantity: 1, isBought: false },
      })
      .afterClosed()
      .pipe(
        filter((res) => !!res),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((res: GroceryListItemDraft) => this.groceryListPageFacade.createItem(res));
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
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => this.groceryListPageFacade.deleteItem(groceryListItem));
  }

  updateItemQuantity(update: GroceryItemQuantityUpdate): void {
    this.groceryListPageFacade.updateItemQuantity(update);
  }

  updateItemIsBought(groceryListItem: GroceryListItem): void {
    this.groceryListPageFacade.updateItem(groceryListItem);
  }
}
