import translate from 'translate';
import { DateTime } from 'luxon';
import * as Utility from './../Application/Utility';

export class Transaction {
  constructor(options) {
    this.transactionDate = new Date(new Date(options.date).setHours(new Date(options.date).getHours() + new Date().getTimezoneOffset() / 60));
    if (!this.transactionType) {
      this.transactionType = options.type;
    }
    this.location = options.location;
    this.receipt = [];
  }
  async addToReceipt(options) {
    let receiptObject = {};
    if (this.transactionType === `Deposit`) {
      console.log(this);
      if (options.accountSelected === `Un-Allocated`) {
        receiptObject.account = options.account;
        receiptObject.grossAmount = options.grossAmount;
        receiptObject.netAmount = options.netAmount;
        receiptObject.amount = options.deposited;
        receiptObject.description = `Paycheck`;
        if (options.description) {
          receiptObject.description = options.description;
        }
        if (options.user.latterDaySaint === true) {
          if (options.budget.accounts.tithing.tithingSetting !== `Surplus`) {
            receiptObject.tithed = options.tithed;
          }
        }
      }
      if (options.accountSelected === `Investment Fund`) {
        if (this.transactionType === `Withdrawal`) return;
        receiptObject.transactionType = options.transactionType;
        receiptObject.transactionName = options.transactionName;
        receiptObject.description = options.description;
        receiptObject.amount = options.amount;
        receiptObject.account = options.accountSelected;
      }
      return this.receipt.push(receiptObject);
    }
    if (this.transactionType === `Withdrawal`) {
      if (options.accountSelected === `Monthly Budget`) {
        receiptObject.category = options.mainCategory;
        receiptObject.subCategory = options.subCategory;
        receiptObject.amount = options.amount;
        receiptObject.account = options.accountSelected;
        console.log(receiptObject.amount);
        if (options.description) {
          receiptObject.description = options.description;
        }
        if (options.scheduledPayment && options.scheduledPayment !== undefined && options.scheduledPayment !== '') {
          receiptObject.scheduledPayment = options.scheduledPayment;
        }
      }
      if (options.accountSelected === `Emergency Fund`) {
        receiptObject.amount = options.amount;
        receiptObject.description = options.description;
        receiptObject.account = options.accountSelected;
      }
      if (options.accountSelected === `Savings Fund`) {
        receiptObject.timing = options.timing;
        receiptObject.transactionType = options.type;
        receiptObject.expenditure = options.expenditure;
        receiptObject.amount = options.amount;
        receiptObject.description = options.description;
        receiptObject.account = options.accountSelected;
        if (options.scheduledPayment && options.scheduledPayment !== undefined) {
          receiptObject.scheduledPayment = options.scheduledPayment;
        }
      }
      if (options.accountSelected === `Expense Fund`) {
        receiptObject.transactionType = options.transactionType;
        receiptObject.timing = options.timing;
        receiptObject.expenditure = options.expenditure;
        receiptObject.description = options.description;
        receiptObject.amount = options.amount;
        receiptObject.account = options.accountSelected;
        if (options.scheduledPayment && options.scheduledPayment !== undefined) {
          receiptObject.scheduledPayment = options.scheduledPayment;
        }
      }
      if (options.accountSelected === `Surplus`) {
        receiptObject.transactionType = options.transactionType;
        receiptObject.timing = options.timing;
        receiptObject.expenditure = options.expenditure;
        receiptObject.description = options.description;
        receiptObject.amount = options.amount;
        receiptObject.account = options.accountSelected;
        if (options.scheduledPayment && options.scheduledPayment !== undefined) {
          receiptObject.scheduledPayment = options.scheduledPayment;
        }
      }
      if (options.accountSelected === `Debt`) {
        receiptObject.timing = options.timing;
        receiptObject.lender = options.lender;
        receiptObject.debtType = options.type;
        receiptObject.expenditure = options.expenditure;
        receiptObject.description = options.description;
        receiptObject.amount = options.amount;
        receiptObject.account = options.accountSelected;
        if (options.scheduledPayment && options.scheduledPayment !== undefined) {
          receiptObject.scheduledPayment = options.scheduledPayment;
        }
      }
      if (options.accountSelected === `Tithing`) {
        receiptObject.amount = options.amount;
        receiptObject.account = options.accountSelected;
      }
    }
    console.log(receiptObject);
    return this.receipt.push(receiptObject);
  }
  removeFromReceipt(index) {
    this.receipt = this.receipt.filter((item, i) => {
      if (item !== this.receipt[index]) return item;
    });
  }
}
