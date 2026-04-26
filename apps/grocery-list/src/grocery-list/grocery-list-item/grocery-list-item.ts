import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-grocery-list-item',
  imports: [],
  templateUrl: './grocery-list-item.html',
  styleUrl: './grocery-list-item.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GroceryListItemComponent {}
