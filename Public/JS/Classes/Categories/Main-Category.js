import { Category } from './Category';
import { DateTime } from 'luxon';

////////////////////////////////////////
// MAIN CATEGORY -- CHILD CLASS
export class MainCategory extends Category {
  constructor(options) {
    const superOpts = { ...options };
    super(superOpts);
    this.createdAt = DateTime.now().toBSON();
    this.subCategories = [];
  }

  _delete(budget, category) {
    // ~ REMOVE CATEGORY FROM BUDGET
    budget.mainCategories = budget.mainCategories.filter((mc) => mc.title !== this.title);
    // ~ REMOVE CATEGORY FROM USER INTERFACE
    category.remove();
  }

  _deleteSubCategory(index) {
    this.subCategories = this.subCategories.filter((sc) => {
      return sc != this.subCategories[index];
    });
  }
}
