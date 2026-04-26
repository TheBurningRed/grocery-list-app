import { Route } from '@angular/router';
import { LayoutComponent } from '../layout/layout';

export const appRoutes: Route[] = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      {
        path: 'grocery-list',
        loadComponent: () =>
          import('../grocery-list/grocery-list-page/grocery-list-page').then(
            (m) => m.GroceryListPageComponent,
          ),
      },
    ],
  },
  {
    path: '',
    redirectTo: 'grocery-list',
    pathMatch: 'full',
  },
];
