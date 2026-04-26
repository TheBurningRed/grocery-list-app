import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { GroceryListItem } from 'interfaces';
import { GroceryListItemComponent } from '../grocery-list-item/grocery-list-item';
import { GroceryItemQuantityUpdate } from '../grocery-list-item-quantity-update.interface';

@Component({
  selector: 'app-grocery-list',
  imports: [GroceryListItemComponent],
  templateUrl: './grocery-list.html',
  styleUrl: './grocery-list.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GroceryListComponent {
  readonly groceryListItems = input.required<GroceryListItem[]>();

  itemEditClicked = output<GroceryListItem>();

  itemDeleteClicked = output<GroceryListItem>();

  itemQuantityChanged = output<GroceryItemQuantityUpdate>();

  itemBoughtChanged = output<GroceryListItem>();
}
