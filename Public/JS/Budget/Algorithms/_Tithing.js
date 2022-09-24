import { myCalendar } from './../../Classes/FrontEnd-Calendar';
import * as Utility from './../../Application/Utility';

export const watch = () => {
  const tithingCheckboxes = document.querySelectorAll('.form__input--tithing');
  const tithingCheckboxLabels = document.querySelectorAll('.form__label--tithing');
  tithingCheckboxLabels.forEach((label, i) => {
    label.addEventListener(`click`, (e) => {
      e.preventDefault();
      tithingCheckboxes.forEach((box) => (box === tithingCheckboxes[i] ? (box.checked = true) : (box.checked = false)));
      tithingCheckboxLabels.forEach((checkLabel) => (checkLabel === label ? checkLabel.classList.add('checked') : checkLabel.classList.remove('checked')));
    });
  });
};

const getSurplusAmount = (bankAccount, totalNeededIncome) => {
  return bankAccount - totalNeededIncome;
};

const includeNewestIncome = (bankAccount, income) => {
  return (bankAccount += income);
};

const getFullCashAndAssetValue = (bankAccount, accounts) => {
  accounts.forEach((account, i) => {
    if (account[0] !== `debt` && account[0] !== `tithing`) {
      bankAccount += account[1].amount;
      if (account[0] === `investmentFund`) {
        bankAccount += account[1].investedAmount;
      }
    }
  });
  return bankAccount;
};

const addDebtToNeededIncome = (total, debt) => {
  return (total += debt);
};

const getEssentialPlannedTransactionIncomeNeeded = (transactions, total) => {
  transactions.forEach((transaction) => {
    if (transaction.account === `Expense Fund` || transaction.account === `Savings Fund`) {
      if (transaction.need !== `Surplus`) {
        transaction.timingOptions.paymentSchedule.forEach((date) => {
          if (myCalendar.compareEndOfYear(date) === true) {
            surplus += transaction.amount;
          }
          total += transaction.amount;
        });
      }
    }
  });
  return total;
};

const getRemainderOfYearNeededIncome = (total, months) => {
  return (total *= months);
};

const getCurrentMonthRemainingNeededIncome = (total, categories) => {
  categories.forEach((category) => {
    category.subCategories.forEach((subCategory) => {
      if (subCategory.surplus === false) {
        total += subCategory.amountRemaining;
      }
    });
  });
  return total;
};

export const calculateSurplus = (placeholderBudget, enteredIncome) => {
  let bankAccount = 0;
  let total = 0;
  let surplus = 0;

  total = getCurrentMonthRemainingNeededIncome(total, placeholderBudget.mainCategories);

  let numberOfMonths = myCalendar.getRemainingMonths();

  total = getRemainderOfYearNeededIncome(total, numberOfMonths);

  total = getEssentialPlannedTransactionIncomeNeeded(placeholderBudget.transactions.plannedTransactions, total);

  total = addDebtToNeededIncome(total, placeholderBudget.accounts.debt.debtAmount);

  bankAccount = getFullCashAndAssetValue(bankAccount, Object.entries(placeholderBudget.accounts));

  const currentDate = new Date();
  myCalendar.getYearRemaining(currentDate, `Bi-Weekly`);

  if (enteredIncome) {
    bankAccount = includeNewestIncome(bankAccount, Number(enteredIncome));
  }

  surplus = getSurplusAmount(bankAccount, total);
  return surplus;
};

export const initializeTithingPreview = (preview, utility) => {
  preview.textContent = utility.money.format(0);
};

export const calculate = (placeholderBudget, setting, grossIncome, netIncome, utility) => {
  utility.tithing = 0;

  // * IF TITHING SETTING IS NOT SURPLUS
  if (setting === `Gross`) {
    utility.tithing = grossIncome * 0.1;
  }

  if (setting === `Net`) {
    utility.tithing = netIncome * 0.1;
  }

  // * IF TITHING SETTING IS SURPLUS
  if (setting === `Surplus`) {
    let surplus = calculateSurplus(placeholderBudget, netIncome);
    if (surplus >= 0.1) {
      utility.surplus = surplus;
      let tithing = Math.round(surplus * 0.1 * 100) / 100;
      utility.tithing = tithing;
    }
    if (surplus < 0.1) {
      utility.tithing = 0;
      if (surplus < 0) {
        utility.surplus = 0;
      }
    }
  }
};
