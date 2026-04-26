import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { GroceryListItem } from 'interfaces';

import { GroceryListItemEditDialogComponent } from './grocery-list-item-edit-dialog.component';

describe('GroceryListItemEditDialogComponent', () => {
  let component: GroceryListItemEditDialogComponent;
  let fixture: ComponentFixture<GroceryListItemEditDialogComponent>;

  const existingItem: GroceryListItem = {
    id: '1',
    name: 'Milk',
    quantity: 2,
    isBought: false,
  };

  async function createComponent(data: unknown): Promise<void> {
    await TestBed.configureTestingModule({
      imports: [GroceryListItemEditDialogComponent],
      providers: [{ provide: MAT_DIALOG_DATA, useValue: data }],
    }).compileComponents();

    fixture = TestBed.createComponent(GroceryListItemEditDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  describe('when editing an existing item', () => {
    beforeEach(async () => {
      await createComponent(existingItem);
    });

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize the form model from dialog data', () => {
      expect(component.formModel).toEqual({
        name: 'Milk',
        quantity: 2,
      });
    });

    it('should identify the item as existing', () => {
      expect(component.isNew).toBe(false);
    });

    it('should return a trimmed result with the existing id', () => {
      component.formModel.name = '  Oat milk  ';
      component.formModel.quantity = 4;

      expect(component.result).toEqual({
        id: '1',
        name: 'Oat milk',
        quantity: 4,
        isBought: false,
      });
    });
  });

  describe('when creating a new item', () => {
    beforeEach(async () => {
      await createComponent({
        name: '',
        quantity: 1,
      });
    });

    it('should identify the item as new', () => {
      expect(component.isNew).toBe(true);
    });

    it('should return a trimmed draft without an id', () => {
      component.formModel.name = '  Bananas  ';
      component.formModel.quantity = 6;

      expect(component.result).toEqual({
        name: 'Bananas',
        quantity: 6,
        isBought: undefined,
      });
    });
  });
});
