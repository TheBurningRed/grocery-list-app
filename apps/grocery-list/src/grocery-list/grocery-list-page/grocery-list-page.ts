import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { GroceryListService } from '../grocery-list.service';

@Component({
  selector: 'app-grocery-list-page',
  imports: [MatCardModule],
  templateUrl: './grocery-list-page.html',
  styleUrl: './grocery-list-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GroceryListPageComponent implements OnInit {
  private readonly groceryListService = inject(GroceryListService);

  ngOnInit(): void {
    this.fetchGroceryList();
  }

  fetchGroceryList(): void {
    this.groceryListService.fetchGroceryList().subscribe();
  }
}
