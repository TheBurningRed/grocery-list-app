import { TestBed } from '@angular/core/testing';

import { GroceryList } from './grocery-list';

describe('GroceryList', () => {
  let service: GroceryList;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GroceryList);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
