import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButton } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { GroceryListItem, GroceryListItemDraft } from 'interfaces';

@Component({
  selector: 'app-grocery-list-item-edit-dialog',
  imports: [MatDialogModule, MatButton, MatInputModule, FormsModule],
  templateUrl: './grocery-list-item-edit-dialog.component.html',
  styleUrl: './grocery-list-item-edit-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GroceryListItemEditDialogComponent {
  private readonly groceryListItem = inject<GroceryListItem | GroceryListItemDraft>(
    MAT_DIALOG_DATA,
  );

  readonly formModel = {
    name: this.groceryListItem.name,
    quantity: this.groceryListItem.quantity,
  };

  get isNew(): boolean {
    return !('id' in this.groceryListItem);
  }

  get result(): GroceryListItem | GroceryListItemDraft {
    const normalizedItem = {
      name: this.formModel.name.trim(),
      quantity: Number(this.formModel.quantity),
      isBought: (this.groceryListItem as GroceryListItem).isBought,
    };

    return this.isNew
      ? normalizedItem
      : {
          ...normalizedItem,
          id: (this.groceryListItem as GroceryListItem).id,
        };
  }
}
