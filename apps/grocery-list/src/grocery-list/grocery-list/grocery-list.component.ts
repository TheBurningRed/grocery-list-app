import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { GroceryListItem } from 'interfaces';
import { GroceryListItemComponent } from '../grocery-list-item/grocery-list-item.component';
import { GroceryItemQuantityUpdate } from '../grocery-list-item-quantity-update.interface';

export type GroceryListLoadState = 'loading' | 'loaded' | 'error';

@Component({
  selector: 'app-grocery-list',
  imports: [GroceryListItemComponent],
  templateUrl: './grocery-list.component.html',
  styleUrl: './grocery-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GroceryListComponent {
  readonly groceryListItems = input.required<GroceryListItem[]>();
  readonly loadState = input.required<GroceryListLoadState>();

  itemEditClicked = output<GroceryListItem>();

  itemDeleteClicked = output<GroceryListItem>();

  itemQuantityChanged = output<GroceryItemQuantityUpdate>();

  itemBoughtChanged = output<GroceryListItem>();
}
