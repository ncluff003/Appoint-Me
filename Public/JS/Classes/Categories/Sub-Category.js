import { Category } from './Category';
import { DateTime } from 'luxon';

////////////////////////////////////////
// SUB CATEGORY -- CHILD CLASS
export class SubCategory extends Category {
  constructor(options) {
    const superOpts = { ...options };
    super(superOpts);
    this.timingOptions = {};
    this.goalAmount = 0;
    this.amountSaved = 0;
    this.amountSpent = 0;
    this.amountRemaining = 0;
    this.percentageSpent = 0;
    this.surplus = false;
    this.createdAt = DateTime.now().toBSON();
  }

  _makeSurplus() {
    this.surplus = !this.surplus;
  }
}
