import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { GroceryListItem } from 'interfaces';
import { MatIcon } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckbox } from '@angular/material/checkbox';

@Component({
  selector: 'app-grocery-list-item',
  imports: [MatIcon, MatButtonModule, MatCheckbox],
  templateUrl: './grocery-list-item.html',
  styleUrl: './grocery-list-item.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GroceryListItemComponent {
  readonly item = input.required<GroceryListItem>();

  itemEditClicked = output<GroceryListItem>();

  itemDeleteClicked = output<GroceryListItem>();

  itemQuantityChanged = output<number>();

  itemBoughtChanged = output<GroceryListItem>();

  isBoughtChanged(isBought: boolean): void {
    this.itemBoughtChanged.emit({
      ...this.item(),
      isBought,
    });
  }
}
