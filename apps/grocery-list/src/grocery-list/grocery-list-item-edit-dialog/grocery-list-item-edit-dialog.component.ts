import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButton } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import {
  FormControl,
  FormGroup,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { GroceryListItem, GroceryListItemDraft } from 'interfaces';

type GroceryListItemEditForm = FormGroup<{
  name: FormControl<string>;
  quantity: FormControl<number>;
}>;

@Component({
  selector: 'app-grocery-list-item-edit-dialog',
  imports: [MatDialogModule, MatButton, MatInputModule, ReactiveFormsModule],
  templateUrl: './grocery-list-item-edit-dialog.component.html',
  styleUrl: './grocery-list-item-edit-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GroceryListItemEditDialogComponent {
  private readonly groceryListItem = inject<GroceryListItem | GroceryListItemDraft>(
    MAT_DIALOG_DATA,
  );
  private readonly formBuilder = inject(NonNullableFormBuilder);

  readonly form: GroceryListItemEditForm = this.formBuilder.group({
    name: this.formBuilder.control(this.groceryListItem.name, {
      validators: [Validators.required, Validators.pattern(/.*\S.*/)],
    }),
    quantity: this.formBuilder.control(this.groceryListItem.quantity, {
      validators: [Validators.required, Validators.min(1)],
    }),
  });

  get isNew(): boolean {
    return !('id' in this.groceryListItem);
  }

  get result(): GroceryListItem | GroceryListItemDraft {
    const { name, quantity: rawQuantity } = this.form.getRawValue();
    const quantity = Math.trunc(Number(rawQuantity));

    const normalizedItem: GroceryListItemDraft = {
      name: name?.trim() || '',
      quantity: Number.isFinite(quantity) ? quantity : 0,
      isBought: this.isNew ? false : (this.groceryListItem as GroceryListItem).isBought,
    };

    return this.isNew
      ? normalizedItem
      : {
          ...normalizedItem,
          id: (this.groceryListItem as GroceryListItem).id,
        };
  }
}
