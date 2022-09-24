import * as Utility from './../Application/Utility';
import { DateTime } from 'luxon';

const getPaymentSchedule = (paymentArray, paymentCycle, dates) => {
  let payments;
  let paymentStart = 0;
  console.log(`Scheduling Payments...`);

  if (paymentCycle === `Once`) {
    paymentArray.push(DateTime.fromISO(dates[0]).toBSON());
    return paymentArray;
  }

  if (paymentCycle === `Weekly`) {
    payments = 51;
    paymentArray.push(DateTime.fromISO(dates[0]).toBSON());
    let date = DateTime.fromISO(dates[0]);
    while (paymentStart < payments) {
      paymentArray.push(date.plus({ days: 7 * (paymentStart + 1) }).toBSON());
      paymentStart++;
    }
    return paymentArray;
  }

  if (paymentCycle === `Bi-Weekly`) {
    payments = 25;
    paymentArray.push(DateTime.fromISO(dates[0]).toBSON());
    let date = DateTime.fromISO(dates[0]);
    while (paymentStart < payments) {
      paymentArray.push(date.plus({ days: 14 * (paymentStart + 1) }).toBSON());
      paymentStart++;
    }
    return paymentArray;
  }

  if (paymentCycle === `Bi-Monthly`) {
    payments = 11;
    paymentArray.push([DateTime.fromISO(dates[0]).toBSON(), DateTime.fromISO(dates[1]).toBSON()]);
    let date = DateTime.fromISO(dates[0]);
    let date2 = DateTime.fromISO(dates[1]);
    while (paymentStart < payments) {
      let monthArray = [];
      monthArray.push(date.plus({ months: 1 * (paymentStart + 1) }).toBSON());
      monthArray.push(date2.plus({ months: 1 * (paymentStart + 1) }).toBSON());
      paymentArray.push(monthArray);
      paymentStart++;
    }
    return paymentArray;
  }

  if (paymentCycle === `Monthly`) {
    payments = 11;
    paymentArray.push(DateTime.fromISO(dates[0]).toBSON());
    let date = DateTime.fromISO(dates[0]);
    while (paymentStart < payments) {
      paymentArray.push(date.plus({ months: 1 * (paymentStart + 1) }).toBSON());
      paymentStart++;
    }
    return paymentArray;
  }

  if (paymentCycle === `Quarterly`) {
    payments = 3;
    paymentArray.push(DateTime.fromISO(dates[0]).toBSON());
    let date = DateTime.fromISO(dates[0]);
    while (paymentStart < payments) {
      paymentArray.push(date.plus({ months: 3 * (paymentStart + 1) }).toBSON());
      paymentStart++;
    }
    return paymentArray;
  }
  if (paymentCycle === `Bi-Annual`) {
    payments = 6; // Gives them 7 years of payments ahead.
    paymentArray.push([DateTime.fromISO(dates[0]).toBSON(), DateTime.fromISO(dates[1]).toBSON()]);
    let date = DateTime.fromISO(dates[0]);
    let date2 = DateTime.fromISO(dates[1]);
    while (paymentStart < payments) {
      let monthArray = [];
      monthArray.push(date.plus({ years: 1 * (paymentStart + 1) }).toBSON());
      monthArray.push(date2.plus({ years: 1 * (paymentStart + 1) }).toBSON());
      paymentArray.push(monthArray);
      paymentStart++;
    }
    return paymentArray;
  }
  if (paymentCycle === `Annual`) {
    payments = 9; // Gives them 10 years of payments ahead.
    paymentArray.push(DateTime.fromISO(dates[0]).toBSON());
    let date = DateTime.fromISO(dates[0]);
    while (paymentStart < payments) {
      paymentArray.push(date.plus({ years: 1 * (paymentStart + 1) }).toBSON());
      paymentStart++;
    }
    return paymentArray;
  }
};

const finalizeTransactionPlan = (placeholderBudget, user, selects, smallInputs, mediumInputs) => {
  let budgetId = window.location.href.split('/')[7];
  let updateObject = {
    budgetId: budgetId,
    userId: user._id,
  };
  let plannedTransaction = {};
  updateObject.transactions = {};
  updateObject.transactions.recentTransactions = placeholderBudget.transactions.recentTransactions;
  updateObject.transactions.plannedTransactions = placeholderBudget.transactions.plannedTransactions;

  let transactionTiming = selects[5].value;

  plannedTransaction.date = DateTime.now().toISO();
  plannedTransaction.type = `Withdrawal`;
  plannedTransaction.location = smallInputs[0].value;
  plannedTransaction.account = selects[0].value;
  if (transactionTiming === `Once`) {
    plannedTransaction.amount = Number(smallInputs[2].value);
  } else if (transactionTiming === `Weekly`) {
    plannedTransaction.amount = Number(smallInputs[2].value) * 52;
  } else if (transactionTiming === `Bi-Weekly`) {
    plannedTransaction.amount = Number(smallInputs[2].value) * 26;
  } else if (transactionTiming === `Bi-Monthly`) {
    plannedTransaction.amount = Number(smallInputs[2].value) * 24;
  } else if (transactionTiming === `Monthly`) {
    plannedTransaction.amount = Number(smallInputs[2].value) * 12;
  } else if (transactionTiming === `Quarterly`) {
    plannedTransaction.amount = Number(smallInputs[2].value) * 4;
  } else if (transactionTiming === `Bi-Annual`) {
    plannedTransaction.amount = Number(smallInputs[2].value) * 14;
  } else if (transactionTiming === `Annual`) {
    plannedTransaction.amount = Number(smallInputs[2].value) * 10;
  }
  plannedTransaction.timingOptions = {};
  plannedTransaction.timingOptions.paymentCycle = transactionTiming;
  plannedTransaction.timingOptions.dueDates = [];
  if (plannedTransaction.timingOptions.paymentCycle !== `Bi-Monthly` && plannedTransaction.timingOptions.paymentCycle !== `Bi-Annual`) {
    plannedTransaction.timingOptions.dueDates.push(DateTime.fromISO(mediumInputs[0].value).toISO());
  }
  if (plannedTransaction.timingOptions.paymentCycle === `Bi-Monthly` || plannedTransaction.timingOptions.paymentCycle === `Bi-Annual`) {
    plannedTransaction.timingOptions.dueDates.push(DateTime.fromISO(mediumInputs[0].value).toISO());
    plannedTransaction.timingOptions.dueDates.push(DateTime.fromISO(mediumInputs[1].value).toISO());
  }
  plannedTransaction.timingOptions.paymentSchedule = [];
  // After the due dates, it is setting the payment schedule using the selected payment cycle.
  getPaymentSchedule(plannedTransaction.timingOptions.paymentSchedule, plannedTransaction.timingOptions.paymentCycle, plannedTransaction.timingOptions.dueDates);
  plannedTransaction.name = smallInputs[1].value;
  plannedTransaction.amountSaved = 0;
  plannedTransaction.paid = false;
  plannedTransaction.paidStatus = `Unpaid`;

  if (selects[0].value === `Expense Fund`) {
    plannedTransaction.subAccount = selects[1].value;

    const surplusSwitch = smallInputs[2].closest('.form__section--transaction-plan').nextSibling.nextSibling.nextSibling.firstChild.firstChild.nextSibling.nextSibling;
    plannedTransaction.need = `Need`;
    if (surplusSwitch.classList.contains('surplus-container__switch--switched')) {
      plannedTransaction.need = `Surplus`;
    }
  }
  if (selects[0].value === `Savings Fund`) {
    plannedTransaction.subAccount = selects[2].value;
    const surplusSwitch = smallInputs[2].closest('.form__section--transaction-plan').nextSibling.nextSibling.nextSibling.firstChild.firstChild.nextSibling.nextSibling;
    plannedTransaction.need = `Need`;
    if (surplusSwitch.classList.contains('surplus-container__switch--switched')) {
      plannedTransaction.need = `Surplus`;
    }
  }
  if (selects[0].value === `Debt`) {
    plannedTransaction.subAccount = selects[3].value;
    plannedTransaction.need = `Need`;
    plannedTransaction.lender = selects[6].value;
  }
  if (selects[0].value === `Surplus`) {
    plannedTransaction.subAccount = selects[4].value;
    plannedTransaction.need = `Surplus`;
  }

  updateObject.transactions.plannedTransactions.push(plannedTransaction);
  placeholderBudget._updateBudget({ updateObject: updateObject }, `Transaction-Planner`);
};

const buildTransactionPlan = (placeholderBudget, user, number, numberOfSections, plan, isDebt, twoDates, utility) => {
  // * This is where I am at.
  const transactionPlanSelects = document.querySelectorAll('.form__select--accounts');
  const smallShortTransactionPlanInputs = document.querySelectorAll('.form__input--small-short');
  const altMediumTransactionPlanInputs = document.querySelectorAll('.form__input--medium__alt');

  let expenseAppliedTotal = 0;
  let savingsAppliedTotal = 0;
  let debtAppliedTotal = 0;
  let surplusAppliedTotal = 0;
  placeholderBudget.transactions.plannedTransactions.forEach((transaction, i) => {
    if (transaction.account === `Expense Fund`) {
      expenseAppliedTotal += transaction.amountSaved;
    }
    if (transaction.account === `Savings Fund`) {
      savingsAppliedTotal += transaction.amountSaved;
    }
    if (transaction.account === `Debt`) {
      debtAppliedTotal += transaction.amountSaved;
    }
    if (transaction.account === `Surplus`) {
      surplusAppliedTotal += transaction.amountSaved;
    }
  });
  while (number < numberOfSections) {
    const transactionPlanPart = document.createElement('section');
    transactionPlanPart.style.width = `${100 / numberOfSections}%`;
    const transactionPlanPartHeader = document.createElement('header');
    const transactionPlanPartHeaderText = document.createElement('p');
    const transactionPlanPartText = document.createElement('p');

    Utility.addClasses(transactionPlanPart, [`transaction-plan__part`, `r__transaction-plan__part`]);
    Utility.addClasses(transactionPlanPartText, [`transaction-plan__part__text`, `r__transaction-plan__part__text`]);
    Utility.addClasses(transactionPlanPartHeader, [`transaction-plan__part__header`, `r__transaction-plan__part__header`]);
    Utility.addClasses(transactionPlanPartHeaderText, [`transaction-plan__part__header__text`, `r__transaction-plan__part__header__text`]);

    transactionPlanPartHeaderText.textContent = `Date`;
    transactionPlanPartText.textContent = DateTime.now().toLocaleString({ day: `numeric`, month: `long`, year: `numeric`, weekday: `short` });

    if (number === 0) {
      Utility.insertElement('beforeend', transactionPlanPart, transactionPlanPartHeader);
      Utility.insertElement('beforeend', transactionPlanPartHeader, transactionPlanPartHeaderText);
      Utility.insertElement('beforeend', transactionPlanPart, transactionPlanPartText);
    }
    if (number === 1) {
      transactionPlanPartHeaderText.textContent = `Account`;
      transactionPlanPartText.textContent = `${transactionPlanSelects[0].value}`;
      Utility.insertElement(`beforeend`, transactionPlanPart, transactionPlanPartHeader);
      Utility.insertElement(`beforeend`, transactionPlanPartHeader, transactionPlanPartHeaderText);
      Utility.insertElement(`beforeend`, transactionPlanPart, transactionPlanPartText);
    }
    if (number === 2) {
      transactionPlanPartHeaderText.textContent = `Transaction Type`;

      if (transactionPlanSelects[0].value === `Expense Fund`) {
        transactionPlanPartText.textContent = `${transactionPlanSelects[1].value}`;
      }
      if (transactionPlanSelects[0].value === `Savings Fund`) {
        transactionPlanPartText.textContent = `${transactionPlanSelects[2].value}`;
      }
      if (transactionPlanSelects[0].value === `Debt`) {
        transactionPlanPartText.textContent = `${transactionPlanSelects[3].value}`;
      }
      if (transactionPlanSelects[0].value === `Surplus`) {
        transactionPlanPartText.textContent = `${transactionPlanSelects[4].value}`;
      }
      Utility.insertElement(`beforeend`, transactionPlanPart, transactionPlanPartHeader);
      Utility.insertElement(`beforeend`, transactionPlanPartHeader, transactionPlanPartHeaderText);
      Utility.insertElement(`beforeend`, transactionPlanPart, transactionPlanPartText);
    }
    if (number === 3) {
      if (isDebt) {
        transactionPlanPartHeaderText.textContent = `Lender`;
        transactionPlanPartText.textContent = `${transactionPlanSelects[6].value}`;
        Utility.insertElement(`beforeend`, transactionPlanPart, transactionPlanPartHeader);
        Utility.insertElement(`beforeend`, transactionPlanPartHeader, transactionPlanPartHeaderText);
        Utility.insertElement(`beforeend`, transactionPlanPart, transactionPlanPartText);
      } else {
        transactionPlanPartHeaderText.textContent = `Transaction Name`;
        transactionPlanPartText.textContent = `${smallShortTransactionPlanInputs[1].value}`;
        Utility.insertElement(`beforeend`, transactionPlanPart, transactionPlanPartHeader);
        Utility.insertElement(`beforeend`, transactionPlanPartHeader, transactionPlanPartHeaderText);
        Utility.insertElement(`beforeend`, transactionPlanPart, transactionPlanPartText);
      }
    }
    if (number === 4) {
      if (isDebt) {
        transactionPlanPartHeaderText.textContent = `Transaction Name`;
        transactionPlanPartText.textContent = `${smallShortTransactionPlanInputs[1].value}`;
        Utility.insertElement(`beforeend`, transactionPlanPart, transactionPlanPartHeader);
        Utility.insertElement(`beforeend`, transactionPlanPartHeader, transactionPlanPartHeaderText);
        Utility.insertElement(`beforeend`, transactionPlanPart, transactionPlanPartText);
      } else {
        transactionPlanPartHeaderText.textContent = `Location`;
        transactionPlanPartText.textContent = `${smallShortTransactionPlanInputs[0].value}`;
        Utility.insertElement(`beforeend`, transactionPlanPart, transactionPlanPartHeader);
        Utility.insertElement(`beforeend`, transactionPlanPartHeader, transactionPlanPartHeaderText);
        Utility.insertElement(`beforeend`, transactionPlanPart, transactionPlanPartText);
      }
    }
    if (number === 5) {
      if (isDebt) {
        transactionPlanPartHeaderText.textContent = `Location`;
        transactionPlanPartText.textContent = `${smallShortTransactionPlanInputs[0].value}`;
        Utility.insertElement(`beforeend`, transactionPlanPart, transactionPlanPartHeader);
        Utility.insertElement(`beforeend`, transactionPlanPartHeader, transactionPlanPartHeaderText);
        Utility.insertElement(`beforeend`, transactionPlanPart, transactionPlanPartText);
      } else {
        let transactionTiming = transactionPlanSelects[5];
        transactionPlanPartHeaderText.textContent = `Amount`;
        if (transactionTiming === `Once`) {
          transactionPlanPartText.textContent = `${utility.money.format(Number(smallShortTransactionPlanInputs[2].value))}`;
        } else if (transactionTiming === `Weekly`) {
          transactionPlanPartText.textContent = `${utility.money.format(Number(smallShortTransactionPlanInputs[2].value) * 52)}`;
        } else if (transactionTiming === `Bi-Weekly`) {
          transactionPlanPartText.textContent = `${utility.money.format(Number(smallShortTransactionPlanInputs[2].value) * 26)}`;
        } else if (transactionTiming === `Bi-Monthly`) {
          transactionPlanPartText.textContent = `${utility.money.format(Number(smallShortTransactionPlanInputs[2].value) * 24)}`;
        } else if (transactionTiming === `Monthly`) {
          transactionPlanPartText.textContent = `${utility.money.format(Number(smallShortTransactionPlanInputs[2].value) * 12)}`;
        } else if (transactionTiming === `Quarterly`) {
          transactionPlanPartText.textContent = `${utility.money.format(Number(smallShortTransactionPlanInputs[2].value) * 4)}`;
        } else if (transactionTiming === `Bi-Annual`) {
          transactionPlanPartText.textContent = `${utility.money.format(Number(smallShortTransactionPlanInputs[2].value) * 14)}`;
        } else if (transactionTiming === `Annual`) {
          transactionPlanPartText.textContent = `${utility.money.format(Number(smallShortTransactionPlanInputs[2].value) * 10)}`;
        }
        Utility.insertElement(`beforeend`, transactionPlanPart, transactionPlanPartHeader);
        Utility.insertElement(`beforeend`, transactionPlanPartHeader, transactionPlanPartHeaderText);
        Utility.insertElement(`beforeend`, transactionPlanPart, transactionPlanPartText);
      }
    }
    if (number === 6) {
      if (isDebt) {
        let transactionTiming = transactionPlanSelects[5];
        transactionPlanPartHeaderText.textContent = `Amount`;
        if (transactionTiming === `Once`) {
          transactionPlanPartText.textContent = `${utility.money.format(Number(smallShortTransactionPlanInputs[2].value))}`;
        } else if (transactionTiming === `Weekly`) {
          transactionPlanPartText.textContent = `${utility.money.format(Number(smallShortTransactionPlanInputs[2].value) * 52)}`;
        } else if (transactionTiming === `Bi-Weekly`) {
          transactionPlanPartText.textContent = `${utility.money.format(Number(smallShortTransactionPlanInputs[2].value) * 26)}`;
        } else if (transactionTiming === `Bi-Monthly`) {
          transactionPlanPartText.textContent = `${utility.money.format(Number(smallShortTransactionPlanInputs[2].value) * 24)}`;
        } else if (transactionTiming === `Monthly`) {
          transactionPlanPartText.textContent = `${utility.money.format(Number(smallShortTransactionPlanInputs[2].value) * 12)}`;
        } else if (transactionTiming === `Quarterly`) {
          transactionPlanPartText.textContent = `${utility.money.format(Number(smallShortTransactionPlanInputs[2].value) * 4)}`;
        } else if (transactionTiming === `Bi-Annual`) {
          transactionPlanPartText.textContent = `${utility.money.format(Number(smallShortTransactionPlanInputs[2].value) * 14)}`;
        } else if (transactionTiming === `Annual`) {
          transactionPlanPartText.textContent = `${utility.money.format(Number(smallShortTransactionPlanInputs[2].value) * 10)}`;
        }
        Utility.insertElement(`beforeend`, transactionPlanPart, transactionPlanPartHeader);
        Utility.insertElement(`beforeend`, transactionPlanPartHeader, transactionPlanPartHeaderText);
        Utility.insertElement(`beforeend`, transactionPlanPart, transactionPlanPartText);
      } else {
        transactionPlanPartHeaderText.textContent = `Due Date One`;
        transactionPlanPartText.textContent = DateTime.fromISO(altMediumTransactionPlanInputs[0].value).toLocaleString({ day: `numeric`, month: `long`, year: `numeric`, weekday: `short` });
        Utility.insertElement(`beforeend`, transactionPlanPart, transactionPlanPartHeader);
        Utility.insertElement(`beforeend`, transactionPlanPartHeader, transactionPlanPartHeaderText);
        Utility.insertElement(`beforeend`, transactionPlanPart, transactionPlanPartText);
      }
    }
    if (number === 7) {
      if (isDebt) {
        transactionPlanPartHeaderText.textContent = `Due Date One`;
        transactionPlanPartText.textContent = DateTime.fromISO(altMediumTransactionPlanInputs[0].value).toLocaleString({ day: `numeric`, month: `long`, year: `numeric`, weekday: `short` });
        Utility.insertElement(`beforeend`, transactionPlanPart, transactionPlanPartHeader);
        Utility.insertElement(`beforeend`, transactionPlanPartHeader, transactionPlanPartHeaderText);
        Utility.insertElement(`beforeend`, transactionPlanPart, transactionPlanPartText);
      } else if (isDebt === false) {
        if (twoDates) {
          transactionPlanPartHeaderText.textContent = `Due Date Two`;
          transactionPlanPartText.textContent = DateTime.fromISO(altMediumTransactionPlanInputs[1].value).toLocaleString({ day: `numeric`, month: `long`, year: `numeric`, weekday: `short` });
          Utility.insertElement(`beforeend`, transactionPlanPart, transactionPlanPartHeader);
          Utility.insertElement(`beforeend`, transactionPlanPartHeader, transactionPlanPartHeaderText);
          Utility.insertElement(`beforeend`, transactionPlanPart, transactionPlanPartText);
        } else {
          transactionPlanPartHeaderText.textContent = `Timing`;
          transactionPlanPartText.textContent = `${transactionPlanSelects[5].value}`;
          Utility.insertElement(`beforeend`, transactionPlanPart, transactionPlanPartHeader);
          Utility.insertElement(`beforeend`, transactionPlanPartHeader, transactionPlanPartHeaderText);
          Utility.insertElement(`beforeend`, transactionPlanPart, transactionPlanPartText);
        }
      }
    }
    if (number === 8) {
      if (isDebt) {
        if (twoDates) {
          transactionPlanPartHeaderText.textContent = `Due Date Two`;
          transactionPlanPartText.textContent = DateTime.fromISO(altMediumTransactionPlanInputs[1].value).toLocaleString({ day: `numeric`, month: `long`, year: `numeric`, weekday: `short` });
          Utility.insertElement(`beforeend`, transactionPlanPart, transactionPlanPartHeader);
          Utility.insertElement(`beforeend`, transactionPlanPartHeader, transactionPlanPartHeaderText);
          Utility.insertElement(`beforeend`, transactionPlanPart, transactionPlanPartText);
        } else {
          transactionPlanPartHeaderText.textContent = `Timing`;
          transactionPlanPartText.textContent = `${transactionPlanSelects[5].value}`;
          Utility.insertElement(`beforeend`, transactionPlanPart, transactionPlanPartHeader);
          Utility.insertElement(`beforeend`, transactionPlanPartHeader, transactionPlanPartHeaderText);
          Utility.insertElement(`beforeend`, transactionPlanPart, transactionPlanPartText);
        }
      } else if (isDebt === false) {
        if (twoDates) {
          transactionPlanPartHeaderText.textContent = `Timing`;
          transactionPlanPartText.textContent = `${transactionPlanSelects[5].value}`;
          Utility.insertElement(`beforeend`, transactionPlanPart, transactionPlanPartHeader);
          Utility.insertElement(`beforeend`, transactionPlanPartHeader, transactionPlanPartHeaderText);
          Utility.insertElement(`beforeend`, transactionPlanPart, transactionPlanPartText);
        } else {
          transactionPlanPartHeaderText.textContent = `Amount Saved`;
          transactionPlanPartText.textContent = utility.money.format(0);
          Utility.insertElement(`beforeend`, transactionPlanPart, transactionPlanPartHeader);
          Utility.insertElement(`beforeend`, transactionPlanPartHeader, transactionPlanPartHeaderText);
          Utility.insertElement(`beforeend`, transactionPlanPart, transactionPlanPartText);
        }
      }
    }
    if (number === 9) {
      if (isDebt) {
        if (twoDates) {
          transactionPlanPartHeaderText.textContent = `Timing`;
          transactionPlanPartText.textContent = `${transactionPlanSelects[5].value}`;
          Utility.insertElement(`beforeend`, transactionPlanPart, transactionPlanPartHeader);
          Utility.insertElement(`beforeend`, transactionPlanPartHeader, transactionPlanPartHeaderText);
          Utility.insertElement(`beforeend`, transactionPlanPart, transactionPlanPartText);
        } else {
          transactionPlanPartHeaderText.textContent = `Amount Saved`;
          transactionPlanPartText.textContent = utility.money.format(0);
          Utility.insertElement(`beforeend`, transactionPlanPart, transactionPlanPartHeader);
          Utility.insertElement(`beforeend`, transactionPlanPartHeader, transactionPlanPartHeaderText);
          Utility.insertElement(`beforeend`, transactionPlanPart, transactionPlanPartText);
        }
      } else if (isDebt === false) {
        if (twoDates) {
          transactionPlanPartHeaderText.textContent = `Amount Saved`;
          transactionPlanPartText.textContent = utility.money.format(0);
          Utility.insertElement(`beforeend`, transactionPlanPart, transactionPlanPartHeader);
          Utility.insertElement(`beforeend`, transactionPlanPartHeader, transactionPlanPartHeaderText);
          Utility.insertElement(`beforeend`, transactionPlanPart, transactionPlanPartText);
        } else {
          Utility.insertElement(`beforeend`, transactionPlanPart, transactionPlanPartHeader);
          Utility.insertElement(`beforeend`, transactionPlanPartHeader, transactionPlanPartHeaderText);
          transactionPlanPartHeaderText.textContent = `Apply Money`;
          const transactionPlanInput = document.createElement('input');
          const transactionPlanButton = document.createElement('button');
          transactionPlanButton.textContent = `Apply`;
          Utility.addClasses(transactionPlanInput, ['form__input--transaction-plan', 'r__form__input--transaction-plan']);
          Utility.addClasses(transactionPlanButton, ['button--extra-extra-small__transaction-plan-small', 'r__button--extra-extra-small__transaction-plan-small']);
          transactionPlanInput.type = 'number';
          transactionPlanInput.min = 0;
          transactionPlanInput.placeholder = '$0.00';

          Utility.insertElement(`beforeend`, transactionPlanPart, transactionPlanInput);
          Utility.insertElement(`beforeend`, transactionPlanPart, transactionPlanButton);
        }
      }
    }
    if (number === 10) {
      if (isDebt) {
        if (twoDates) {
          transactionPlanPartHeaderText.textContent = `Amount Saved`;
          transactionPlanPartText.textContent = utility.money.format(0);
          Utility.insertElement(`beforeend`, transactionPlanPart, transactionPlanPartHeader);
          Utility.insertElement(`beforeend`, transactionPlanPartHeader, transactionPlanPartHeaderText);
          Utility.insertElement(`beforeend`, transactionPlanPart, transactionPlanPartText);
        } else {
          Utility.insertElement(`beforeend`, transactionPlanPart, transactionPlanPartHeader);
          Utility.insertElement(`beforeend`, transactionPlanPartHeader, transactionPlanPartHeaderText);
          transactionPlanPartHeaderText.textContent = `Apply Money`;
          const transactionPlanInput = document.createElement('input');
          const transactionPlanButton = document.createElement('button');
          transactionPlanButton.textContent = `Apply`;
          Utility.addClasses(transactionPlanInput, ['form__input--transaction-plan', 'r__form__input--transaction-plan']);
          Utility.addClasses(transactionPlanButton, ['button--extra-extra-small__transaction-plan-small', 'r__button--extra-extra-small__transaction-plan-small']);
          transactionPlanInput.type = 'number';
          transactionPlanInput.min = 0;
          transactionPlanInput.placeholder = '$0.00';

          Utility.insertElement(`beforeend`, transactionPlanPart, transactionPlanInput);
          Utility.insertElement(`beforeend`, transactionPlanPart, transactionPlanButton);
        }
      } else if (isDebt === false) {
        if (twoDates) {
          Utility.insertElement(`beforeend`, transactionPlanPart, transactionPlanPartHeader);
          Utility.insertElement(`beforeend`, transactionPlanPartHeader, transactionPlanPartHeaderText);
          transactionPlanPartHeaderText.textContent = `Apply Money`;
          const transactionPlanInput = document.createElement('input');
          const transactionPlanButton = document.createElement('button');
          transactionPlanButton.textContent = `Apply`;
          Utility.addClasses(transactionPlanInput, ['form__input--transaction-plan', 'r__form__input--transaction-plan']);
          Utility.addClasses(transactionPlanButton, ['button--extra-extra-small__transaction-plan-small', 'r__button--extra-extra-small__transaction-plan-small']);
          transactionPlanInput.type = 'number';
          transactionPlanInput.min = 0;
          transactionPlanInput.placeholder = '$0.00';

          Utility.insertElement(`beforeend`, transactionPlanPart, transactionPlanInput);
          Utility.insertElement(`beforeend`, transactionPlanPart, transactionPlanButton);
        } else {
          Utility.insertElement(`beforeend`, transactionPlanPart, transactionPlanPartHeader);
          Utility.insertElement(`beforeend`, transactionPlanPartHeader, transactionPlanPartHeaderText);
          transactionPlanPartHeaderText.textContent = `Paid In Full?`;
          const transactionPlanButton = document.createElement('button');
          transactionPlanButton.textContent = `Paid`;
          Utility.addClasses(transactionPlanButton, ['button--extra-extra-small__transaction-plan-small', 'r__button--extra-extra-small__transaction-plan-small']);

          Utility.insertElement(`beforeend`, transactionPlanPart, transactionPlanButton);
          transactionPlanButton.addEventListener(`click`, (e) => {
            e.preventDefault();
            console.log(transaction);
          });
        }
      }
    }
    if (number === 11) {
      if (isDebt) {
        if (twoDates) {
          Utility.insertElement(`beforeend`, transactionPlanPart, transactionPlanPartHeader);
          Utility.insertElement(`beforeend`, transactionPlanPartHeader, transactionPlanPartHeaderText);
          transactionPlanPartHeaderText.textContent = `Apply Money`;
          const transactionPlanInput = document.createElement('input');
          const transactionPlanButton = document.createElement('button');
          transactionPlanButton.textContent = `Apply`;
          Utility.addClasses(transactionPlanInput, ['form__input--transaction-plan', 'r__form__input--transaction-plan']);
          Utility.addClasses(transactionPlanButton, ['button--extra-extra-small__transaction-plan-small', 'r__button--extra-extra-small__transaction-plan-small']);
          transactionPlanInput.type = 'number';
          transactionPlanInput.min = 0;
          transactionPlanInput.placeholder = '$0.00';

          Utility.insertElement(`beforeend`, transactionPlanPart, transactionPlanInput);
          Utility.insertElement(`beforeend`, transactionPlanPart, transactionPlanButton);
        } else {
          Utility.insertElement(`beforeend`, transactionPlanPart, transactionPlanPartHeader);
          Utility.insertElement(`beforeend`, transactionPlanPartHeader, transactionPlanPartHeaderText);
          transactionPlanPartHeaderText.textContent = `Paid In Full?`;
          const transactionPlanButton = document.createElement('button');
          transactionPlanButton.textContent = `Paid`;
          Utility.addClasses(transactionPlanButton, ['button--extra-extra-small__transaction-plan-small', 'r__button--extra-extra-small__transaction-plan-small']);

          Utility.insertElement(`beforeend`, transactionPlanPart, transactionPlanButton);
          transactionPlanButton.addEventListener(`click`, (e) => {
            e.preventDefault();
            console.log(transaction);
          });
        }
      } else if (isDebt === false) {
        if (twoDates) {
          Utility.insertElement(`beforeend`, transactionPlanPart, transactionPlanPartHeader);
          Utility.insertElement(`beforeend`, transactionPlanPartHeader, transactionPlanPartHeaderText);
          transactionPlanPartHeaderText.textContent = `Paid In Full?`;
          const transactionPlanButton = document.createElement('button');
          transactionPlanButton.textContent = `Paid`;
          Utility.addClasses(transactionPlanButton, ['button--extra-extra-small__transaction-plan-small', 'r__button--extra-extra-small__transaction-plan-small']);

          Utility.insertElement(`beforeend`, transactionPlanPart, transactionPlanButton);
          transactionPlanButton.addEventListener(`click`, (e) => {
            e.preventDefault();
            console.log(transaction);
          });
        } else {
          // * END OF THE NORMAL PLAN
          Utility.insertElement(`beforeend`, transactionPlanPart, transactionPlanPartHeader);
          Utility.insertElement(`beforeend`, transactionPlanPartHeader, transactionPlanPartHeaderText);
          transactionPlanPartHeaderText.textContent = `Status`;
          transactionPlanPartText.textContent = `Unpaid`;

          Utility.insertElement(`beforeend`, transactionPlanPart, transactionPlanPartText);
        }
      }
    }
    if (number === 12) {
      if (isDebt) {
        if (twoDates) {
          Utility.insertElement(`beforeend`, transactionPlanPart, transactionPlanPartHeader);
          Utility.insertElement(`beforeend`, transactionPlanPartHeader, transactionPlanPartHeaderText);
          transactionPlanPartHeaderText.textContent = `Paid In Full?`;
          const transactionPlanButton = document.createElement('button');
          transactionPlanButton.textContent = `Paid`;
          Utility.addClasses(transactionPlanButton, ['button--extra-extra-small__transaction-plan-small', 'r__button--extra-extra-small__transaction-plan-small']);

          Utility.insertElement(`beforeend`, transactionPlanPart, transactionPlanButton);

          transactionPlanButton.addEventListener(`click`, (e) => {
            e.preventDefault();
            console.log(transaction);
          });
        } else {
          Utility.insertElement(`beforeend`, transactionPlanPart, transactionPlanPartHeader);
          Utility.insertElement(`beforeend`, transactionPlanPartHeader, transactionPlanPartHeaderText);
          transactionPlanPartHeaderText.textContent = `Status`;
          transactionPlanPartText.textContent = `Unpaid`;

          Utility.insertElement(`beforeend`, transactionPlanPart, transactionPlanPartText);
        }
      } else if (isDebt === false) {
        if (twoDates) {
          Utility.insertElement(`beforeend`, transactionPlanPart, transactionPlanPartHeader);
          Utility.insertElement(`beforeend`, transactionPlanPartHeader, transactionPlanPartHeaderText);
          transactionPlanPartHeaderText.textContent = `Status`;
          transactionPlanPartText.textContent = `Unpaid`;

          Utility.insertElement(`beforeend`, transactionPlanPart, transactionPlanPartText);
        }
      }
    }
    if (number === 13) {
      if (isDebt) {
        if (twoDates) {
          Utility.insertElement(`beforeend`, transactionPlanPart, transactionPlanPartHeader);
          Utility.insertElement(`beforeend`, transactionPlanPartHeader, transactionPlanPartHeaderText);
          transactionPlanPartHeaderText.textContent = `Status`;
          transactionPlanPartText.textContent = `Unpaid`;

          Utility.insertElement(`beforeend`, transactionPlanPart, transactionPlanPartText);
        }
      }
    }
    Utility.insertElement(`beforeend`, plan, transactionPlanPart);
    number++;
  }
  finalizeTransactionPlan(placeholderBudget, user, transactionPlanSelects, smallShortTransactionPlanInputs, altMediumTransactionPlanInputs);
  Utility.reloadPage();
};

const createPlannedTransaction = (accountSelect, placeholderBudget, user, creationContainer, utility) => {
  console.log(`Creating Plan...`);
  const transactionPlanSelects = document.querySelectorAll('.form__select--accounts');
  let numSections = 12;
  let sectionStart = 0;
  let isDebt = false,
    twoDueDates = false;
  const transactionPlan = document.createElement('section');
  Utility.addClasses(transactionPlan, [`transaction-plan`, `r__transaction-plan`]);

  if (accountSelect.value === `Expense Fund` || accountSelect.value === `Savings Fund` || accountSelect.value === `Surplus`) {
    if (transactionPlanSelects[5].value === `Bi-Monthly` || transactionPlanSelects[5].value === `Bi-Annual`) {
      numSections = 13;
      twoDueDates = true;
    }
    buildTransactionPlan(placeholderBudget, user, sectionStart, numSections, transactionPlan, isDebt, twoDueDates, utility);
    Utility.insertElement(`beforebegin`, creationContainer, transactionPlan);
  }
  if (accountSelect.value === `Debt`) {
    isDebt = true;
    if (transactionPlanSelects[5].value === `Bi-Monthly` || transactionPlanSelects[5].value === `Bi-Annual`) {
      numSections = 14;
      twoDueDates = true;
    }
    buildTransactionPlan(placeholderBudget, user, sectionStart, numSections, transactionPlan, isDebt, twoDueDates, utility);
    Utility.insertElement(`beforebegin`, creationContainer, transactionPlan);
  }
};

const checkSelectedTiming = () => {
  const transactionPlanSections = document.querySelectorAll('.form__section--transaction-plan');
  const formSelectSections = document.querySelectorAll('.form__section--select');
  // form__section--transaction-plan__alt--two
  const extendedTransactionPlanSections = [transactionPlanSections[0], transactionPlanSections[1], transactionPlanSections[2], transactionPlanSections[3], transactionPlanSections[4]];

  if (formSelectSections[2].firstChild.nextSibling.nextSibling.value === `Bi-Monthly` || formSelectSections[2].firstChild.nextSibling.nextSibling.value === `Bi-Annual`) {
    Utility.replaceClassName(transactionPlanSections[4], `closed`, `open`);
    extendedTransactionPlanSections.forEach((section) => {
      Utility.addClasses(section, [`form__section--transaction-plan__alt--two`]);
    });
  }
  if (formSelectSections[2].firstChild.nextSibling.nextSibling.value !== `Bi-Monthly` && formSelectSections[2].firstChild.nextSibling.nextSibling.value !== `Bi-Annual`) {
    Utility.replaceClassName(transactionPlanSections[4], `open`, `closed`);
    extendedTransactionPlanSections.forEach((section) => {
      Utility.removeClasses(section, [`form__section--transaction-plan__alt--two`]);
    });
  }
};

const showTransactionPlanOptions = (array, allOptions) => {
  const altMediumTransactionPlanInputs = document.querySelectorAll('.form__input--medium__alt');
  const transactionPlanSelects = document.querySelectorAll('.form__select--accounts');
  if (altMediumTransactionPlanInputs[1]) {
    console.log(altMediumTransactionPlanInputs[1]);
    if (altMediumTransactionPlanInputs[1].classList.contains('open')) {
      altMediumTransactionPlanInputs[1].classList.remove('open');
      altMediumTransactionPlanInputs[1].classList.add('closed');
    }
    transactionPlanSelects[5].value = transactionPlanSelects[5].firstChild.nextSibling.value;
    allOptions.forEach((optionArray, i) => {
      optionArray.forEach((arrayItem, i) => {
        arrayItem.classList.remove('open');
        arrayItem.classList.add('closed');
      });
    });
    array.forEach((arrayItem, i) => {
      if (i === 0) return;
      arrayItem.classList.remove('closed');
      arrayItem.classList.add('open');
      if (i === 1) {
        arrayItem.removeEventListener('click', checkSelectedTiming);
        arrayItem.addEventListener('click', checkSelectedTiming);
      }
    });
  }
};

const updateTransactionPlanningAccountDisplays = (placeholderBudget, user, utility) => {
  console.log(`Updating...`);
  const appliedMoney = document.querySelectorAll('.container--extra-small-evenly-spaced__content__applied-container__applied');
  const unAppliedMoney = document.querySelectorAll('.container--extra-small-evenly-spaced__content__un-applied-container__un-applied');
  const accountTotals = document.querySelectorAll('.container--extra-small-evenly-spaced__content__account-total');

  let expenseAppliedTotal = 0;
  let savingsAppliedTotal = 0;
  let debtAppliedTotal = 0;
  let surplusAppliedTotal = 0;
  placeholderBudget.transactions.plannedTransactions.forEach((transaction, i) => {
    if (transaction.account === `Expense Fund`) {
      expenseAppliedTotal += transaction.amountSaved;
    }
    if (transaction.account === `Savings Fund`) {
      savingsAppliedTotal += transaction.amountSaved;
    }
    if (transaction.account === `Debt`) {
      debtAppliedTotal += transaction.amountSaved;
    }
    if (transaction.account === `Surplus`) {
      surplusAppliedTotal += transaction.amountSaved;
    }
  });

  // ACCOUNT TOTALS
  accountTotals[0].textContent = utility.money.format(placeholderBudget.accounts.expenseFund.amount);
  accountTotals[1].textContent = utility.money.format(placeholderBudget.accounts.savingsFund.amount);
  accountTotals[2].textContent = utility.money.format(placeholderBudget.accounts.debt.amount);
  accountTotals[3].textContent = utility.money.format(placeholderBudget.accounts.surplus.amount);

  // APPLIED TOTALS
  appliedMoney[0].textContent = utility.money.format(expenseAppliedTotal);
  appliedMoney[1].textContent = utility.money.format(savingsAppliedTotal);
  appliedMoney[2].textContent = utility.money.format(debtAppliedTotal);
  appliedMoney[3].textContent = utility.money.format(surplusAppliedTotal);

  // UNAPPLIED TOTALS
  unAppliedMoney[0].textContent = utility.money.format(placeholderBudget.accounts.expenseFund.amount - expenseAppliedTotal);
  unAppliedMoney[1].textContent = utility.money.format(placeholderBudget.accounts.savingsFund.amount - savingsAppliedTotal);
  unAppliedMoney[2].textContent = utility.money.format(placeholderBudget.accounts.debt.amount - debtAppliedTotal);
  unAppliedMoney[3].textContent = utility.money.format(placeholderBudget.accounts.surplus.amount - surplusAppliedTotal);
};

const displayExistingTransactionPlans = (placeholderBudget, user, utility) => {
  const transactionPlanCreation = document.querySelector('.transaction-plan-creation');
  const transactionPlans = [];
  placeholderBudget.transactions.plannedTransactions.forEach((transaction, i) => {
    transactionPlans.push(transaction);
    transactionPlans.sort((a, b) => new Date(a.date) - new Date(b.date));
  });

  transactionPlans.forEach((transaction, i) => {
    let numSections = 12;
    let sectionStart = 0;
    let isDebt = false,
      twoDueDates = false;
    const transactionPlan = document.createElement('section');
    Utility.addClasses(transactionPlan, ['transaction-plan', 'r__transaction-plan']);

    if (transaction.account === `Debt`) {
      isDebt = true;
      numSections = 13;
      if (transaction.timingOptions.paymentCycle === `Bi-Monthly` || transaction.timingOptions.paymentCycle === `Bi-Monthly`) {
        twoDueDates = true;
        numSections = 14;
      }
    } else if (transaction.account !== `Debt`) {
      if (transaction.timingOptions.paymentCycle === `Bi-Monthly` || transaction.timingOptions.paymentCycle === `Bi-Monthly`) {
        twoDueDates = true;
        numSections = 13;
      }
    }

    while (sectionStart < numSections) {
      const transactionPlanPart = document.createElement('section');
      transactionPlanPart.style.width = `${100 / numSections}%`;
      console.log(utility.screen.largeTabPort[0].matches);
      if (utility.screen.largeTabPort[0].matches) {
        transactionPlanPart.style.width = `${100 / (numSections / 1.85)}%`;
      }
      Utility.insertElement(`beforeend`, transactionPlan, transactionPlanPart);

      const transactionPlanPartHeader = document.createElement('header');
      const transactionPlanPartHeaderText = document.createElement('p');
      const transactionPlanPartText = document.createElement('p');
      Utility.addClasses(transactionPlanPart, [`transaction-plan__part`, `r__transaction-plan__part`]);
      Utility.addClasses(transactionPlanPartText, [`transaction-plan__part__text`, `r__transaction-plan__part__text`]);
      Utility.addClasses(transactionPlanPartHeader, ['transaction-plan__part__header', 'r__transaction-plan__part__header']);
      Utility.addClasses(transactionPlanPartHeaderText, [`transaction-plan__part__header__text`, `r__transaction-plan__part__header__text`]);

      if (sectionStart === 0) {
        transactionPlanPartHeaderText.textContent = `Date`;
        transactionPlanPartText.textContent = DateTime.fromISO(transaction.date).toLocaleString({ day: `numeric`, month: `long`, year: `numeric`, weekday: `short` });

        Utility.insertElement(`beforeend`, transactionPlanPart, transactionPlanPartHeader);
        Utility.insertElement(`beforeend`, transactionPlanPartHeader, transactionPlanPartHeaderText);
        Utility.insertElement(`beforeend`, transactionPlanPart, transactionPlanPartText);
      }
      if (sectionStart === 1) {
        transactionPlanPartHeaderText.textContent = `Account`;
        transactionPlanPartText.textContent = `${transaction.account}`;
        Utility.insertElement(`beforeend`, transactionPlanPart, transactionPlanPartHeader);
        Utility.insertElement(`beforeend`, transactionPlanPartHeader, transactionPlanPartHeaderText);
        Utility.insertElement(`beforeend`, transactionPlanPart, transactionPlanPartText);
      }
      if (sectionStart === 2) {
        transactionPlanPartHeaderText.textContent = `Transaction Type`;
        transactionPlanPartText.textContent = `${transaction.subAccount}`;
        Utility.insertElement(`beforeend`, transactionPlanPart, transactionPlanPartHeader);
        Utility.insertElement(`beforeend`, transactionPlanPartHeader, transactionPlanPartHeaderText);
        Utility.insertElement(`beforeend`, transactionPlanPart, transactionPlanPartText);
      }
      if (sectionStart === 3) {
        if (isDebt) {
          transactionPlanPartHeaderText.textContent = `Lender`;
          transactionPlanPartText.textContent = `${transaction.lender}`;
          Utility.insertElement(`beforeend`, transactionPlanPart, transactionPlanPartHeader);
          Utility.insertElement(`beforeend`, transactionPlanPartHeader, transactionPlanPartHeaderText);
          Utility.insertElement(`beforeend`, transactionPlanPart, transactionPlanPartText);
        } else if (isDebt === false) {
          transactionPlanPartHeaderText.textContent = `Transaction Name`;
          transactionPlanPartText.textContent = `${transaction.name}`;
          Utility.insertElement(`beforeend`, transactionPlanPart, transactionPlanPartHeader);
          Utility.insertElement(`beforeend`, transactionPlanPartHeader, transactionPlanPartHeaderText);
          Utility.insertElement(`beforeend`, transactionPlanPart, transactionPlanPartText);
        }
      }
      if (sectionStart === 4) {
        if (isDebt) {
          transactionPlanPartHeaderText.textContent = `Transaction Name`;
          transactionPlanPartText.textContent = `${transaction.name}`;
          Utility.insertElement(`beforeend`, transactionPlanPart, transactionPlanPartHeader);
          Utility.insertElement(`beforeend`, transactionPlanPartHeader, transactionPlanPartHeaderText);
          Utility.insertElement(`beforeend`, transactionPlanPart, transactionPlanPartText);
        } else if (isDebt === false) {
          transactionPlanPartHeaderText.textContent = `Location`;
          transactionPlanPartText.textContent = `${transaction.location}`;
          Utility.insertElement(`beforeend`, transactionPlanPart, transactionPlanPartHeader);
          Utility.insertElement(`beforeend`, transactionPlanPartHeader, transactionPlanPartHeaderText);
          Utility.insertElement(`beforeend`, transactionPlanPart, transactionPlanPartText);
        }
      }
      if (sectionStart === 5) {
        if (isDebt) {
          transactionPlanPartHeaderText.textContent = `Location`;
          transactionPlanPartText.textContent = `${transaction.location}`;
          Utility.insertElement(`beforeend`, transactionPlanPart, transactionPlanPartHeader);
          Utility.insertElement(`beforeend`, transactionPlanPartHeader, transactionPlanPartHeaderText);
          Utility.insertElement(`beforeend`, transactionPlanPart, transactionPlanPartText);
        } else if (isDebt === false) {
          transactionPlanPartHeaderText.textContent = `Amount`;
          transactionPlanPartText.textContent = utility.money.format(transaction.amount);
          Utility.insertElement(`beforeend`, transactionPlanPart, transactionPlanPartHeader);
          Utility.insertElement(`beforeend`, transactionPlanPartHeader, transactionPlanPartHeaderText);
          Utility.insertElement(`beforeend`, transactionPlanPart, transactionPlanPartText);
        }
      }
      if (sectionStart === 6) {
        if (isDebt) {
          transactionPlanPartHeaderText.textContent = `Amount`;
          transactionPlanPartText.textContent = utility.money.format(transaction.amount);
          Utility.insertElement(`beforeend`, transactionPlanPart, transactionPlanPartHeader);
          Utility.insertElement(`beforeend`, transactionPlanPartHeader, transactionPlanPartHeaderText);
          Utility.insertElement(`beforeend`, transactionPlanPart, transactionPlanPartText);
        } else if (isDebt === false) {
          if (twoDueDates) {
            transactionPlanPartHeaderText.textContent = `Due Date One`;
            transactionPlanPartText.textContent = DateTime.fromISO(transaction.timingOptions.paymentSchedule[0][0]).toLocaleString({
              day: `numeric`,
              month: `long`,
              year: `numeric`,
              weekday: `short`,
            });
            Utility.insertElement(`beforeend`, transactionPlanPart, transactionPlanPartHeader);
            Utility.insertElement(`beforeend`, transactionPlanPartHeader, transactionPlanPartHeaderText);
            Utility.insertElement(`beforeend`, transactionPlanPart, transactionPlanPartText);
          } else if (twoDueDates === false) {
            transactionPlanPartHeaderText.textContent = `Due Date One`;
            transactionPlanPartText.textContent = DateTime.fromISO(transaction.timingOptions.paymentSchedule[0]).toLocaleString({ day: `numeric`, month: `long`, year: `numeric`, weekday: `short` });
            Utility.insertElement(`beforeend`, transactionPlanPart, transactionPlanPartHeader);
            Utility.insertElement(`beforeend`, transactionPlanPartHeader, transactionPlanPartHeaderText);
            Utility.insertElement(`beforeend`, transactionPlanPart, transactionPlanPartText);
          }
        }
      }
      if (sectionStart === 7) {
        if (isDebt) {
          transactionPlanPartHeaderText.textContent = `Due Date One`;
          transactionPlanPartText.textContent = DateTime.fromISO(transaction.timingOptions.paymentSchedule[0]).toLocaleString({ day: `numeric`, month: `long`, year: `numeric`, weekday: `short` });
          Utility.insertElement(`beforeend`, transactionPlanPart, transactionPlanPartHeader);
          Utility.insertElement(`beforeend`, transactionPlanPartHeader, transactionPlanPartHeaderText);
          Utility.insertElement(`beforeend`, transactionPlanPart, transactionPlanPartText);
        } else if (isDebt === false) {
          if (twoDueDates) {
            transactionPlanPartHeaderText.textContent = `Due Date Two`;
            if (transaction.timingOptions.paymentSchedule[0][1]) {
              transactionPlanPartText.textContent = DateTime.fromISO(transaction.timingOptions.paymentSchedule[0][1]).toLocaleString({
                day: `numeric`,
                month: `long`,
                year: `numeric`,
                weekday: `short`,
              });
            } else {
              transactionPlanPartText.textContent = DateTime.fromISO(transaction.timingOptions.paymentSchedule[1][0]).toLocaleString({
                day: `numeric`,
                month: `long`,
                year: `numeric`,
                weekday: `short`,
              });
            }
            Utility.insertElement(`beforeend`, transactionPlanPart, transactionPlanPartHeader);
            Utility.insertElement(`beforeend`, transactionPlanPartHeader, transactionPlanPartHeaderText);
            Utility.insertElement(`beforeend`, transactionPlanPart, transactionPlanPartText);
          } else if (twoDueDates === false) {
            transactionPlanPartHeaderText.textContent = `Timing`;
            transactionPlanPartText.textContent = `${transaction.timingOptions.paymentCycle}`;
            Utility.insertElement(`beforeend`, transactionPlanPart, transactionPlanPartHeader);
            Utility.insertElement(`beforeend`, transactionPlanPartHeader, transactionPlanPartHeaderText);
            Utility.insertElement(`beforeend`, transactionPlanPart, transactionPlanPartText);
          }
        }
      }
      if (sectionStart === 8) {
        if (isDebt) {
          if (twoDueDates) {
            transactionPlanPartHeaderText.textContent = `Due Date Two`;
            if (transaction.timingOptions.paymentSchedule[0][1]) {
              transactionPlanPartText.textContent = DateTime.fromISO(transaction.timingOptions.paymentSchedule[0][1]).toLocaleString({
                day: `numeric`,
                month: `long`,
                year: `numeric`,
                weekday: `short`,
              });
            } else {
              transactionPlanPartText.textContent = DateTime.fromISO(transaction.timingOptions.paymentSchedule[1][0]).toLocaleString({
                day: `numeric`,
                month: `long`,
                year: `numeric`,
                weekday: `short`,
              });
            }
            Utility.insertElement(`beforeend`, transactionPlanPart, transactionPlanPartHeader);
            Utility.insertElement(`beforeend`, transactionPlanPartHeader, transactionPlanPartHeaderText);
            Utility.insertElement(`beforeend`, transactionPlanPart, transactionPlanPartText);
          } else if (twoDueDates === false) {
            transactionPlanPartHeaderText.textContent = `Timing`;
            transactionPlanPartText.textContent = `${transaction.timingOptions.paymentCycle}`;
            Utility.insertElement(`beforeend`, transactionPlanPart, transactionPlanPartHeader);
            Utility.insertElement(`beforeend`, transactionPlanPartHeader, transactionPlanPartHeaderText);
            Utility.insertElement(`beforeend`, transactionPlanPart, transactionPlanPartText);
          }
        } else if (isDebt === false) {
          if (twoDueDates) {
            transactionPlanPartHeaderText.textContent = `Timing`;
            transactionPlanPartText.textContent = `${transaction.timingOptions.paymentCycle}`;
            Utility.insertElement(`beforeend`, transactionPlanPart, transactionPlanPartHeader);
            Utility.insertElement(`beforeend`, transactionPlanPartHeader, transactionPlanPartHeaderText);
            Utility.insertElement(`beforeend`, transactionPlanPart, transactionPlanPartText);
          } else if (twoDueDates === false) {
            transactionPlanPartHeaderText.textContent = `Amount Saved`;
            transactionPlanPartText.textContent = utility.money.format(transaction.amountSaved);
            Utility.insertElement(`beforeend`, transactionPlanPart, transactionPlanPartHeader);
            Utility.insertElement(`beforeend`, transactionPlanPartHeader, transactionPlanPartHeaderText);
            Utility.insertElement(`beforeend`, transactionPlanPart, transactionPlanPartText);
          }
        }
      }
      if (sectionStart === 9) {
        if (isDebt) {
          if (twoDueDates) {
            transactionPlanPartHeaderText.textContent = `Timing`;
            transactionPlanPartText.textContent = `${transaction.timingOptions.paymentCycle}`;
            Utility.insertElement(`beforeend`, transactionPlanPart, transactionPlanPartHeader);
            Utility.insertElement(`beforeend`, transactionPlanPartHeader, transactionPlanPartHeaderText);
            Utility.insertElement(`beforeend`, transactionPlanPart, transactionPlanPartText);
          } else if (twoDueDates === false) {
            transactionPlanPartHeaderText.textContent = `Amount Saved`;
            transactionPlanPartText.textContent = utility.money.format(transaction.amountSaved);
            Utility.insertElement(`beforeend`, transactionPlanPart, transactionPlanPartHeader);
            Utility.insertElement(`beforeend`, transactionPlanPartHeader, transactionPlanPartHeaderText);
            Utility.insertElement(`beforeend`, transactionPlanPart, transactionPlanPartText);
          }
        } else if (isDebt === false) {
          if (twoDueDates) {
            transactionPlanPartHeaderText.textContent = `Amount Saved`;
            transactionPlanPartText.textContent = utility.money.format(transaction.amountSaved);
            Utility.insertElement(`beforeend`, transactionPlanPart, transactionPlanPartHeader);
            Utility.insertElement(`beforeend`, transactionPlanPartHeader, transactionPlanPartHeaderText);
            Utility.insertElement(`beforeend`, transactionPlanPart, transactionPlanPartText);
          } else if (twoDueDates === false) {
            transactionPlanPartHeaderText.textContent = `Apply Money`;
            const transactionPlanInput = document.createElement('input');
            const transactionPlanButton = document.createElement('button');
            transactionPlanButton.textContent = `Apply`;
            Utility.addClasses(transactionPlanInput, ['form__input--transaction-plan', 'r__form__input--transaction-plan']);
            Utility.addClasses(transactionPlanButton, ['button--extra-extra-small__transaction-plan-small', 'r__button--extra-extra-small__transaction-plan-small']);
            transactionPlanInput.type = 'number';
            transactionPlanInput.min = 0;
            transactionPlanInput.placeholder = '$0.00';
            transactionPlanInput.step = `.01`;
            if (utility.permissions.admin === true) {
              transactionPlanButton.addEventListener('click', (e) => {
                const currentlySaved = transaction.amountSaved; // Saving the currently saved amount.
                let databaseAccount = `${transaction.account.split(' ').join('')[0].toLowerCase()}${transaction.account.split(' ').join('').slice(1)}`;
                let accountFilteredPlans = placeholderBudget.transactions.plannedTransactions.filter((plan) => {
                  return plan.account === transaction.account;
                });
                let amountSaved = accountFilteredPlans.reduce((saved, plan) => {
                  return (saved += plan.amountSaved);
                }, 0);
                console.log(amountSaved);
                console.log(placeholderBudget.accounts[databaseAccount].amount - amountSaved - Number(transactionPlanInput.value) < 0);
                if (placeholderBudget.accounts[databaseAccount].amount - amountSaved - Number(transactionPlanInput.value) < 0) {
                  return alert(`You do not have enough to apply that amount to that plan.`);
                }
                transaction.amountSaved += Number(transactionPlanInput.value);
                transactionPlanButton.parentElement.previousSibling.firstChild.nextSibling.textContent = utility.money.format(transaction.amountSaved);

                let budgetId = window.location.href.split('/')[7];
                let updateObject = {
                  budgetId: budgetId,
                  userId: user._id,
                };
                updateObject.transactions = {
                  recentTransactions: placeholderBudget.transactions.recentTransactions,
                  plannedTransactions: transactionPlans,
                };
                placeholderBudget._updateBudget({ updateObject: updateObject }, `Transaction-Planner`);
                updateTransactionPlanningAccountDisplays(placeholderBudget, user, utility);
              });
            } else {
              transactionPlanButton.disabled = true;
              transactionPlanInput.readOnly = true;
              Utility.addClasses(transactionPlanButton, [`disabled`]);
            }
            Utility.insertElement(`beforeend`, transactionPlanPart, transactionPlanPartHeader);
            Utility.insertElement(`beforeend`, transactionPlanPartHeader, transactionPlanPartHeaderText);
            Utility.insertElement(`beforeend`, transactionPlanPart, transactionPlanInput);
            Utility.insertElement(`beforeend`, transactionPlanPart, transactionPlanButton);
          }
        }
      }
      if (sectionStart === 10) {
        if (isDebt) {
          if (twoDueDates) {
            transactionPlanPartHeaderText.textContent = `Amount Saved`;
            transactionPlanPartText.textContent = utility.money.format(transaction.amountSaved);
            Utility.insertElement(`beforeend`, transactionPlanPart, transactionPlanPartHeader);
            Utility.insertElement(`beforeend`, transactionPlanPartHeader, transactionPlanPartHeaderText);
            Utility.insertElement(`beforeend`, transactionPlanPart, transactionPlanPartText);
          } else if (twoDueDates === false) {
            transactionPlanPartHeaderText.textContent = `Apply Money`;
            const transactionPlanInput = document.createElement('input');
            const transactionPlanButton = document.createElement('button');
            transactionPlanButton.textContent = `Apply`;
            Utility.addClasses(transactionPlanInput, ['form__input--transaction-plan', 'r__form__input--transaction-plan']);
            Utility.addClasses(transactionPlanButton, ['button--extra-extra-small__transaction-plan-small', 'r__button--extra-extra-small__transaction-plan-small']);
            transactionPlanInput.type = 'number';
            transactionPlanInput.min = 0;
            transactionPlanInput.placeholder = '$0.00';
            if (utility.permissions.admin === true) {
              transactionPlanButton.addEventListener('click', (e) => {
                const currentlySaved = transaction.amountSaved; // Saving the currently saved amount.
                let databaseAccount = `${transaction.account.split(' ').join('')[0].toLowerCase()}${transaction.account.split(' ').join('').slice(1)}`;
                let accountFilteredPlans = placeholderBudget.transactions.plannedTransactions.filter((plan) => {
                  return plan.account === transaction.account;
                });
                let amountSaved = accountFilteredPlans.reduce((saved, plan) => {
                  return (saved += plan.amountSaved);
                }, 0);
                console.log(placeholderBudget.accounts[databaseAccount].amount - amountSaved - Number(transactionPlanInput.value) < 0);
                if (placeholderBudget.accounts[databaseAccount].amount - amountSaved - Number(transactionPlanInput.value) < 0) {
                  return alert(`You do not have enough to apply that amount to that plan.`);
                }
                transaction.amountSaved += Number(transactionPlanInput.value);
                transactionPlanButton.parentElement.previousSibling.firstChild.nextSibling.textContent = utility.money.format(transaction.amountSaved);

                let budgetId = window.location.href.split('/')[7];
                let updateObject = {
                  budgetId: budgetId,
                  userId: user._id,
                };
                updateObject.transactions = {
                  recentTransactions: placeholderBudget.transactions.recentTransactions,
                  plannedTransactions: transactionPlans,
                };
                placeholderBudget._updateBudget({ updateObject: updateObject }, `Transaction-Planner`);
                updateTransactionPlanningAccountDisplays(placeholderBudget, user, utility);
              });
            } else {
              transactionPlanButton.disabled = true;
              transactionPlanInput.readOnly = true;
              Utility.addClasses(transactionPlanButton, [`disabled`]);
            }
            Utility.insertElement(`beforeend`, transactionPlanPart, transactionPlanPartHeader);
            Utility.insertElement(`beforeend`, transactionPlanPartHeader, transactionPlanPartHeaderText);
            Utility.insertElement(`beforeend`, transactionPlanPart, transactionPlanInput);
            Utility.insertElement(`beforeend`, transactionPlanPart, transactionPlanButton);
          }
        }
        if (isDebt === false) {
          if (twoDueDates) {
            transactionPlanPartHeaderText.textContent = `Apply Money`;
            const transactionPlanInput = document.createElement('input');
            const transactionPlanButton = document.createElement('button');
            transactionPlanButton.textContent = `Apply`;
            Utility.addClasses(transactionPlanInput, ['form__input--transaction-plan', 'r__form__input--transaction-plan']);
            Utility.addClasses(transactionPlanButton, ['button--extra-extra-small__transaction-plan-small', 'r__button--extra-extra-small__transaction-plan-small']);
            transactionPlanInput.type = 'number';
            transactionPlanInput.min = 0;
            transactionPlanInput.placeholder = '$0.00';
            if (utility.permissions.admin === true) {
              transactionPlanButton.addEventListener('click', (e) => {
                const currentlySaved = transaction.amountSaved; // Saving the currently saved amount.
                let databaseAccount = `${transaction.account.split(' ').join('')[0].toLowerCase()}${transaction.account.split(' ').join('').slice(1)}`;
                let accountFilteredPlans = placeholderBudget.transactions.plannedTransactions.filter((plan) => {
                  return plan.account === transaction.account;
                });
                let amountSaved = accountFilteredPlans.reduce((saved, plan) => {
                  return (saved += plan.amountSaved);
                }, 0);
                console.log(placeholderBudget.accounts[databaseAccount].amount - amountSaved - Number(transactionPlanInput.value) < 0);
                if (placeholderBudget.accounts[databaseAccount].amount - amountSaved - Number(transactionPlanInput.value) < 0) {
                  return alert(`You do not have enough to apply that amount to that plan.`);
                }
                transaction.amountSaved += Number(transactionPlanInput.value);
                transactionPlanButton.parentElement.previousSibling.firstChild.nextSibling.textContent = utility.money.format(transaction.amountSaved);

                let budgetId = window.location.href.split('/')[7];
                let updateObject = {
                  budgetId: budgetId,
                  userId: user._id,
                };
                updateObject.transactions = {
                  recentTransactions: placeholderBudget.transactions.recentTransactions,
                  plannedTransactions: transactionPlans,
                };
                placeholderBudget._updateBudget({ updateObject: updateObject }, `Transaction-Planner`);
                updateTransactionPlanningAccountDisplays(placeholderBudget, user, utility);
              });
            } else {
              transactionPlanButton.disabled = true;
              transactionPlanInput.readOnly = true;
              Utility.addClasses(transactionPlanButton, [`disabled`]);
            }
            Utility.insertElement(`beforeend`, transactionPlanPart, transactionPlanPartHeader);
            Utility.insertElement(`beforeend`, transactionPlanPartHeader, transactionPlanPartHeaderText);
            Utility.insertElement(`beforeend`, transactionPlanPart, transactionPlanInput);
            Utility.insertElement(`beforeend`, transactionPlanPart, transactionPlanButton);
          } else if (twoDueDates === false) {
            transactionPlanPartHeaderText.textContent = `Paid In Full?`;
            // * This button is one of the last things to need to be done.
            const transactionPlanButton = document.createElement('button');
            transactionPlanButton.textContent = `Paid`;
            Utility.addClasses(transactionPlanButton, ['button--extra-extra-small__transaction-plan-small', 'r__button--extra-extra-small__transaction-plan-small']);
            Utility.insertElement(`beforeend`, transactionPlanPart, transactionPlanPartHeader);
            Utility.insertElement(`beforeend`, transactionPlanPartHeader, transactionPlanPartHeaderText);
            Utility.insertElement(`beforeend`, transactionPlanPart, transactionPlanButton);
            // ? What needs to be done when this button is clicked?
            /*
              ~ Steps of the paid button being clicked
              @ 1. Check if it is a Monthly Budget plan or not.
              @ 2. If Monthly Budget plan, just remove it from both the DOM, Planned Transactions, AND the correct sub category's payment schedule.
              @ 3. If NOT Monthly Budget plan, Make sure it is NOT Bi-Monthly or Bi-Annual
              @ 4. 
            */
            if (utility.permissions.admin === true) {
              transactionPlanButton.addEventListener(`click`, (e) => {
                e.preventDefault();
                console.log(transaction);
                let transactionPlans = document.querySelectorAll('.transaction-plan');
                console.log(placeholderBudget.transactions.plannedTransactions);
                transaction.paidStatus = `Paid`;
                let index;
                placeholderBudget.transactions.plannedTransactions = placeholderBudget.transactions.plannedTransactions.filter((transactionCheck, i) => {
                  if (transactionCheck === transaction) index = i;
                  return transactionCheck !== transaction;
                });
                transactionPlans[index].remove();
                console.log(placeholderBudget.transactions.plannedTransactions);
                let budgetId = window.location.href.split('/')[7];
                let updateObject = {
                  budgetId: budgetId,
                  userId: user._id,
                };
                updateObject.transactions = placeholderBudget.transactions;
                placeholderBudget._updateBudget({ updateObject: updateObject }, `Transaction-Planner`);
              });
            } else {
              transactionPlanButton.disabled = true;
              Utility.addClasses(transactionPlanButton, [`disabled`]);
            }
          }
        }
      }
      // * This is where I am at in re-fixing this.
      if (sectionStart === 11) {
        if (isDebt) {
          if (twoDueDates) {
            transactionPlanPartHeaderText.textContent = `Apply Money`;
            const transactionPlanInput = document.createElement('input');
            const transactionPlanButton = document.createElement('button');
            transactionPlanButton.textContent = `Apply`;
            Utility.addClasses(transactionPlanInput, ['form__input--transaction-plan', 'r__form__input--transaction-plan']);
            Utility.addClasses(transactionPlanButton, ['button--extra-extra-small__transaction-plan-small', 'r__button--extra-extra-small__transaction-plan-small']);
            transactionPlanInput.type = 'number';
            transactionPlanInput.min = 0;
            transactionPlanInput.placeholder = '$0.00';
            if (utility.permissions.admin === true) {
              transactionPlanButton.addEventListener('click', (e) => {
                const currentlySaved = transaction.amountSaved; // Saving the currently saved amount.
                let databaseAccount = `${transaction.account.split(' ').join('')[0].toLowerCase()}${transaction.account.split(' ').join('').slice(1)}`;
                let accountFilteredPlans = placeholderBudget.transactions.plannedTransactions.filter((plan) => {
                  return plan.account === transaction.account;
                });
                let amountSaved = accountFilteredPlans.reduce((saved, plan) => {
                  return (saved += plan.amountSaved);
                }, 0);
                console.log(placeholderBudget.accounts[databaseAccount].amount - amountSaved - Number(transactionPlanInput.value) < 0);
                if (placeholderBudget.accounts[databaseAccount].amount - amountSaved - Number(transactionPlanInput.value) < 0) {
                  return alert(`You do not have enough to apply that amount to that plan.`);
                }
                transaction.amountSaved += Number(transactionPlanInput.value);
                transactionPlanButton.parentElement.previousSibling.firstChild.nextSibling.textContent = utility.money.format(transaction.amountSaved);

                let budgetId = window.location.href.split('/')[7];
                let updateObject = {
                  budgetId: budgetId,
                  userId: user._id,
                };
                updateObject.transactions = {
                  recentTransactions: placeholderBudget.transactions.recentTransactions,
                  plannedTransactions: transactionPlans,
                };
                placeholderBudget._updateBudget({ updateObject: updateObject }, `Transaction-Planner`);
                updateTransactionPlanningAccountDisplays(placeholderBudget, user, utility);
              });
            } else {
              transactionPlanButton.disabled = true;
              transactionPlanInput.readOnly = true;
              Utility.addClasses(transactionPlanButton, [`disabled`]);
            }
            Utility.insertElement(`beforeend`, transactionPlanPart, transactionPlanPartHeader);
            Utility.insertElement(`beforeend`, transactionPlanPartHeader, transactionPlanPartHeaderText);
            Utility.insertElement(`beforeend`, transactionPlanPart, transactionPlanInput);
            Utility.insertElement(`beforeend`, transactionPlanPart, transactionPlanButton);
          } else if (twoDueDates === false) {
            transactionPlanPartHeaderText.textContent = `Paid In Full?`;
            const transactionPlanButton = document.createElement('button');
            transactionPlanButton.textContent = `Paid`;
            Utility.addClasses(transactionPlanButton, ['button--extra-extra-small__transaction-plan-small', 'r__button--extra-extra-small__transaction-plan-small']);
            Utility.insertElement(`beforeend`, transactionPlanPart, transactionPlanPartHeader);
            Utility.insertElement(`beforeend`, transactionPlanPartHeader, transactionPlanPartHeaderText);
            Utility.insertElement(`beforeend`, transactionPlanPart, transactionPlanButton);
            if (utility.permissions.admin === true) {
              transactionPlanButton.addEventListener(`click`, (e) => {
                e.preventDefault();
                console.log(transaction);
                let transactionPlans = document.querySelectorAll('.transaction-plan');
                console.log(placeholderBudget.transactions.plannedTransactions);
                transaction.paidStatus = `Paid`;
                let index;
                placeholderBudget.transactions.plannedTransactions = placeholderBudget.transactions.plannedTransactions.filter((transactionCheck, i) => {
                  if (transactionCheck === transaction) index = i;
                  return transactionCheck !== transaction;
                });
                transactionPlans[index].remove();
                console.log(placeholderBudget.transactions.plannedTransactions);
                let budgetId = window.location.href.split('/')[7];
                let updateObject = {
                  budgetId: budgetId,
                  userId: user._id,
                };
                updateObject.transactions = placeholderBudget.transactions;
                placeholderBudget._updateBudget({ updateObject: updateObject }, `Transaction-Planner`);
              });
            } else {
              transactionPlanButton.disabled = true;
              Utility.addClasses(transactionPlanButton, [`disabled`]);
            }
          }
        } else if (isDebt === false) {
          if (twoDueDates) {
            transactionPlanPartHeaderText.textContent = `Paid In Full?`;
            const transactionPlanButton = document.createElement('button');
            transactionPlanButton.textContent = `Paid`;
            Utility.addClasses(transactionPlanButton, ['button--extra-extra-small__transaction-plan-small', 'r__button--extra-extra-small__transaction-plan-small']);
            Utility.insertElement(`beforeend`, transactionPlanPart, transactionPlanPartHeader);
            Utility.insertElement(`beforeend`, transactionPlanPartHeader, transactionPlanPartHeaderText);
            Utility.insertElement(`beforeend`, transactionPlanPart, transactionPlanButton);
            if (utility.permissions.admin === true) {
              transactionPlanButton.addEventListener(`click`, (e) => {
                e.preventDefault();
                console.log(transaction);
                let transactionPlans = document.querySelectorAll('.transaction-plan');
                console.log(placeholderBudget.transactions.plannedTransactions);
                transaction.paidStatus = `Paid`;
                let index;
                placeholderBudget.transactions.plannedTransactions = placeholderBudget.transactions.plannedTransactions.filter((transactionCheck, i) => {
                  if (transactionCheck === transaction) index = i;
                  return transactionCheck !== transaction;
                });
                transactionPlans[index].remove();
                console.log(placeholderBudget.transactions.plannedTransactions);
                let budgetId = window.location.href.split('/')[7];
                let updateObject = {
                  budgetId: budgetId,
                  userId: user._id,
                };
                updateObject.transactions = placeholderBudget.transactions;
                placeholderBudget._updateBudget({ updateObject: updateObject }, `Transaction-Planner`);
              });
            } else {
              transactionPlanButton.disabled = true;
              Utility.addClasses(transactionPlanButton, [`disabled`]);
            }
          } else if (twoDueDates === false) {
            transactionPlanPartHeaderText.textContent = `Status`;
            transactionPlanPartText.textContent = `${transaction.paidStatus}`;
            Utility.insertElement(`beforeend`, transactionPlanPart, transactionPlanPartHeader);
            Utility.insertElement(`beforeend`, transactionPlanPartHeader, transactionPlanPartHeaderText);
            Utility.insertElement(`beforeend`, transactionPlanPart, transactionPlanPartText);
          }
        }
      }
      if (sectionStart === 12) {
        if (isDebt) {
          if (twoDueDates) {
            transactionPlanPartHeaderText.textContent = `Paid In Full?`;
            const transactionPlanButton = document.createElement('button');
            transactionPlanButton.textContent = `Paid`;
            Utility.addClasses(transactionPlanButton, ['button--extra-extra-small__transaction-plan-small', 'r__button--extra-extra-small__transaction-plan-small']);
            Utility.insertElement(`beforeend`, transactionPlanPart, transactionPlanPartHeader);
            Utility.insertElement(`beforeend`, transactionPlanPartHeader, transactionPlanPartHeaderText);
            Utility.insertElement(`beforeend`, transactionPlanPart, transactionPlanButton);
            if (utility.permissions.admin === true) {
              transactionPlanButton.addEventListener(`click`, (e) => {
                e.preventDefault();
                console.log(transaction);
                let transactionPlans = document.querySelectorAll('.transaction-plan');
                console.log(placeholderBudget.transactions.plannedTransactions);
                transaction.paidStatus = `Paid`;
                let index;
                placeholderBudget.transactions.plannedTransactions = placeholderBudget.transactions.plannedTransactions.filter((transactionCheck, i) => {
                  if (transactionCheck === transaction) index = i;
                  return transactionCheck !== transaction;
                });
                transactionPlans[index].remove();
                console.log(placeholderBudget.transactions.plannedTransactions);
                let budgetId = window.location.href.split('/')[7];
                let updateObject = {
                  budgetId: budgetId,
                  userId: user._id,
                };
                updateObject.transactions = placeholderBudget.transactions;
                placeholderBudget._updateBudget({ updateObject: updateObject }, `Transaction-Planner`);
              });
            } else {
              transactionPlanButton.disabled = true;
              Utility.addClasses(transactionPlanButton, [`disabled`]);
            }
          } else if (twoDueDates === false) {
            transactionPlanPartHeaderText.textContent = `Status`;
            transactionPlanPartText.textContent = `${transaction.paidStatus}`;
            Utility.insertElement(`beforeend`, transactionPlanPart, transactionPlanPartHeader);
            Utility.insertElement(`beforeend`, transactionPlanPartHeader, transactionPlanPartHeaderText);
            Utility.insertElement(`beforeend`, transactionPlanPart, transactionPlanPartText);
          }
        } else if (isDebt === false) {
          if (twoDueDates) {
            transactionPlanPartHeaderText.textContent = `Status`;
            transactionPlanPartText.textContent = `${transaction.paidStatus}`;
            Utility.insertElement(`beforeend`, transactionPlanPart, transactionPlanPartHeader);
            Utility.insertElement(`beforeend`, transactionPlanPartHeader, transactionPlanPartHeaderText);
            Utility.insertElement(`beforeend`, transactionPlanPart, transactionPlanPartText);
          }
        }
      }
      if (sectionStart === 13) {
        if (isDebt) {
          transactionPlanPartHeaderText.textContent = `Status`;
          transactionPlanPartText.textContent = `${transaction.paidStatus}`;
          Utility.insertElement(`beforeend`, transactionPlanPart, transactionPlanPartHeader);
          Utility.insertElement(`beforeend`, transactionPlanPartHeader, transactionPlanPartHeaderText);
          Utility.insertElement(`beforeend`, transactionPlanPart, transactionPlanPartText);
        }
      }
      if (transactionPlanCreation) {
        transactionPlanCreation.insertAdjacentElement('beforebegin', transactionPlan);
      }
      sectionStart++;
    }
  });
};

const setupTransactionPlanning = (placeholderBudget, user, utility) => {
  const transactionPlanCreationContainer = document.querySelector('.transaction-plan-creation');
  const transactionPlanContainer = document.querySelectorAll('.container--large');
  const transactionPlanContainerTitle = document.querySelector('.r__container--large__header__title');
  console.log(transactionPlanContainer);
  console.log(transactionPlanContainer && utility.screen.smallTabPort[0].matches && transactionPlanContainerTitle.textContent === `Planned Transactions`);
  if (transactionPlanContainer[0] && utility.screen.smallTabPort[0].matches && transactionPlanContainerTitle.textContent === `Planned Transactions`) {
    transactionPlanContainer[0].style.width = `${95}%`;
  }

  const expenseTransactionOptionsArray = [];
  const savingsTransactionOptionsArray = [];
  const debtTransactionOptionsArray = [];
  const surplusTransactionOptionsArray = [];
  const commonTransactionOptionsArray = [expenseTransactionOptionsArray, savingsTransactionOptionsArray, debtTransactionOptionsArray, surplusTransactionOptionsArray];

  const accountSelection = document.querySelectorAll('.form__select--accounts')[0];
  const accountOptions = document.querySelectorAll('.form__select__option');
  const transactionPlanAccountOptions = [accountOptions[0], accountOptions[1], accountOptions[2], accountOptions[3]];

  const transactionPlanSections = document.querySelectorAll('.form__section--transaction-plan');
  const accountSelectionContainers = document.querySelectorAll('.form__select--accounts');
  const formSelectSections = document.querySelectorAll('.form__section--select');

  displayExistingTransactionPlans(placeholderBudget, user, utility);
  const submitPlanButton = document.querySelector('.button--extra-extra-small__transaction-plan');

  commonTransactionOptionsArray.forEach((array) => {
    Utility.pushIntoArray(
      [
        transactionPlanSections[4],
        formSelectSections[2],
        transactionPlanSections[0],
        transactionPlanSections[1],
        transactionPlanSections[2],
        transactionPlanSections[3],
        transactionPlanSections[6],
        formSelectSections[1],
        accountSelectionContainers[5],
      ],
      array
    );
  });

  Utility.pushIntoArray([accountSelectionContainers[1], transactionPlanSections[5]], expenseTransactionOptionsArray);
  Utility.pushIntoArray([accountSelectionContainers[2], transactionPlanSections[5]], savingsTransactionOptionsArray);
  Utility.pushIntoArray([accountSelectionContainers[3], formSelectSections[3], accountSelectionContainers[6]], debtTransactionOptionsArray);
  Utility.pushIntoArray([accountSelectionContainers[4]], surplusTransactionOptionsArray);

  if (accountSelection) {
    accountSelection.addEventListener(`change`, (e) => {
      e.preventDefault();
      if (accountSelection.value === `Expense Fund`) {
        showTransactionPlanOptions(expenseTransactionOptionsArray, commonTransactionOptionsArray);
        if (!transactionPlanCreationContainer.classList.contains('extend-transaction-plan')) {
          transactionPlanCreationContainer.classList.toggle('extend-transaction-plan');
        }
      }
      if (accountSelection.value === `Savings Fund`) {
        showTransactionPlanOptions(savingsTransactionOptionsArray, commonTransactionOptionsArray);
        if (!transactionPlanCreationContainer.classList.contains('extend-transaction-plan')) {
          transactionPlanCreationContainer.classList.toggle('extend-transaction-plan');
        }
      }
      if (accountSelection.value === `Debt`) {
        showTransactionPlanOptions(debtTransactionOptionsArray, commonTransactionOptionsArray);
        if (transactionPlanCreationContainer) {
          if (!transactionPlanCreationContainer.classList.contains('extend-transaction-plan')) {
            transactionPlanCreationContainer.classList.toggle('extend-transaction-plan');
          }
        }
      }
      if (accountSelection.value === `Surplus`) {
        showTransactionPlanOptions(surplusTransactionOptionsArray, commonTransactionOptionsArray);
        if (!transactionPlanCreationContainer.classList.contains('extend-transaction-plan')) {
          transactionPlanCreationContainer.classList.toggle('extend-transaction-plan');
        }
      }
    });
  }

  let expenseAppliedTotal = 0;
  let savingsAppliedTotal = 0;
  let debtAppliedTotal = 0;
  let surplusAppliedTotal = 0;
  placeholderBudget.transactions.plannedTransactions.forEach((transaction, i) => {
    if (transaction.account === `Expense Fund`) {
      expenseAppliedTotal += transaction.amountSaved;
    }
    if (transaction.account === `Savings Fund`) {
      savingsAppliedTotal += transaction.amountSaved;
    }
    if (transaction.account === `Debt`) {
      debtAppliedTotal += transaction.amountSaved;
    }
    if (transaction.account === `Surplus`) {
      surplusAppliedTotal += transaction.amountSaved;
    }
  });

  const smallShortTransactionPlanInputs = document.querySelectorAll('.form__input--small-short');
  if (smallShortTransactionPlanInputs[0]) {
    if (smallShortTransactionPlanInputs[2]) {
      const surplusSwitch = smallShortTransactionPlanInputs[2].closest('.form__section--transaction-plan').nextSibling.nextSibling.nextSibling.firstChild.firstChild.nextSibling.nextSibling;
      console.log(surplusSwitch);
      const surplusSwitchIcon = surplusSwitch.firstChild.nextSibling.firstChild.nextSibling;
      if (surplusSwitch) {
        surplusSwitch.addEventListener('click', (e) => {
          e.preventDefault();
          surplusSwitch.classList.toggle('surplus-container__switch--switched');
          Utility.toggleClasses(surplusSwitchIcon, [`fa-times`, `fa-check`]);
        });
      }
      if (submitPlanButton) {
        submitPlanButton.addEventListener('click', (e) => {
          createPlannedTransaction(accountSelectionContainers[0], placeholderBudget, user, transactionPlanCreationContainer, utility);
          surplusSwitch.classList.remove('surplus-container__switch--switched');
          Utility.replaceClassName(surplusSwitchIcon, `fa-check`, `fa-times`);
          Utility.replaceClassName(transactionPlanCreationContainer, `open`, `closed`);
        });
      }

      const appliedMoney = document.querySelectorAll('.container--extra-small-evenly-spaced__content__applied-container__applied');
      const unAppliedMoney = document.querySelectorAll('.container--extra-small-evenly-spaced__content__un-applied-container__un-applied');
      const accountTotals = document.querySelectorAll('.container--extra-small-evenly-spaced__content__account-total');

      // ACCOUNT TOTALS
      accountTotals[0].textContent = utility.money.format(placeholderBudget.accounts.expenseFund.amount);
      accountTotals[1].textContent = utility.money.format(placeholderBudget.accounts.savingsFund.amount);
      accountTotals[2].textContent = utility.money.format(placeholderBudget.accounts.debt.amount);
      accountTotals[3].textContent = utility.money.format(placeholderBudget.accounts.surplus.amount);

      // APPLIED TOTALS
      appliedMoney[0].textContent = utility.money.format(expenseAppliedTotal);
      appliedMoney[1].textContent = utility.money.format(savingsAppliedTotal);
      appliedMoney[2].textContent = utility.money.format(debtAppliedTotal);
      appliedMoney[3].textContent = utility.money.format(surplusAppliedTotal);

      // UNAPPLIED TOTALS
      unAppliedMoney[0].textContent = utility.money.format(placeholderBudget.accounts.expenseFund.amount - expenseAppliedTotal);
      unAppliedMoney[1].textContent = utility.money.format(placeholderBudget.accounts.savingsFund.amount - savingsAppliedTotal);
      unAppliedMoney[2].textContent = utility.money.format(placeholderBudget.accounts.debt.amount - debtAppliedTotal);
      unAppliedMoney[3].textContent = utility.money.format(placeholderBudget.accounts.surplus.amount - surplusAppliedTotal);
    }
  }
};

const startPlanning = () => {
  const transactionPlanCreationContainer = document.querySelector('.transaction-plan-creation');
  transactionPlanCreationContainer.classList.toggle('closed');
  transactionPlanCreationContainer.classList.toggle('open');
  const transactionPlanSelects = document.querySelectorAll('.form__select--accounts');
  transactionPlanSelects[5].value = transactionPlanSelects[5].firstChild.nextSibling.value;
};

export const watch = (placeholderBudget, user, utility) => {
  const borderlessButtons = document.querySelectorAll('.button--borderless');
  const startPlanningButton = borderlessButtons[2];
  const transactionPlanCreationContainer = document.querySelector('.transaction-plan-creation');

  if (utility.permissions.admin === true) {
    if (startPlanningButton) {
      startPlanningButton.addEventListener('click', (e) => {
        e.preventDefault();
        startPlanning();
      });
    }
  } else {
    if (startPlanningButton) {
      Utility.replaceClassName(startPlanningButton, 'open', 'closed');
    }
  }
  console.log(placeholderBudget.debts);
  if (transactionPlanCreationContainer) {
    setupTransactionPlanning(placeholderBudget, user, utility);
  }

  const altMediumInputs = document.querySelectorAll('.form__input--medium__alt');
  const currentDate = altMediumInputs[0];
  if (currentDate) currentDate.value = new Date();
};
