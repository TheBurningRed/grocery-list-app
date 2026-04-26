import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-grocery-list',
  imports: [],
  templateUrl: './grocery-list.html',
  styleUrl: './grocery-list.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GroceryListComponent {}
