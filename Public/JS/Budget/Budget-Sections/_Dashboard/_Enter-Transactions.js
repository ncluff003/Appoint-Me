import * as Utility from './../../../Application/Utility';
import { Transaction } from './../../../Classes/Transaction';
import { DateTime } from 'luxon';

const handleTransaction = (paymentCycle, item, plan, savedAmount, placeholderBudget, utility, divisor) => {
  console.log(`Handling Transaction...`);
  // * BI-MONTHLY OR BI-ANNUAL
  console.log(paymentCycle);
  /*
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    *~~~~~~~~~~~                              ~~~~~~~~~~~~
    *~~~~~~~~~~~   BI-MONTHLY AND BI-ANNUAL   ~~~~~~~~~~~~
    *~~~~~~~~~~~                              ~~~~~~~~~~~~
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  */
  if (paymentCycle === `Bi-Monthly` || paymentCycle === `Bi-Annual`) {
    if (item.amount >= plan.amount / divisor && plan.amountSaved >= plan.amount / divisor) {
      savedAmount -= plan.amountSaved;
      let startOfCycle;

      // * GETTING THE DATE ARRAY INDEX OF THE SCHEDULED PAYMENT DATE.
      plan.timingOptions.paymentSchedule.forEach((dateArray, i) => {
        let index = i;
        dateArray.forEach((date) => {
          if (DateTime.fromISO(item.scheduledPayment).toLocaleString(DateTime.DATETIME_MED_WITH_WEEKDAY) === DateTime.fromISO(date).toLocaleString(DateTime.DATETIME_MED_WITH_WEEKDAY)) {
            startOfCycle = index;
          }
        });
      });

      // * GETTING THE DATE INDEX OF THE SCHEDULED PAYMENT DATE.
      let startingDate;
      plan.timingOptions.paymentSchedule[startOfCycle].forEach((date, i) => {
        if (DateTime.fromISO(item.scheduledPayment).toLocaleString(DateTime.DATETIME_MED_WITH_WEEKDAY) === DateTime.fromISO(date).toLocaleString(DateTime.DATETIME_MED_WITH_WEEKDAY)) {
          startingDate = i;
        }
      });
      let dateArrayIndex;

      // * What I am looking to do here and from the weekly payments onward is to get it to start at the scheduled payment's date and go forward from there to however many payments are needed to be removed.
      // ? What if the date selected is the latter half of the bi-annual array?
      plan.timingOptions.paymentSchedule.forEach((dateArray, i) => {
        if (dateArray.includes(item.scheduledPayment)) {
          dateArrayIndex = i;
        }
      });

      let numberOfPayments = Math.round(item.amount / (plan.amount / divisor));
      for (let startingPayment = 0; startingPayment < numberOfPayments; startingPayment++) {
        if (startingDate === 0) {
          if (plan.timingOptions.paymentSchedule[startOfCycle].length === 0) {
            startOfCycle++;
          }
          plan.timingOptions.paymentSchedule[startOfCycle] = plan.timingOptions.paymentSchedule[startOfCycle].filter((date) => {
            console.log(plan.timingOptions.paymentSchedule[startOfCycle]);
            return DateTime.fromISO(date).toLocaleString(DateTime.DATE_MED) !== DateTime.fromISO(plan.timingOptions.paymentSchedule[startOfCycle][startingDate]).toLocaleString(DateTime.DATE_MED);
          });
        }
        if (startingDate === 1) {
          plan.timingOptions.paymentSchedule[startOfCycle] = plan.timingOptions.paymentSchedule[startOfCycle].filter((date) => {
            console.log(plan.timingOptions.paymentSchedule[startOfCycle]);
            return DateTime.fromISO(date).toLocaleString(DateTime.DATE_MED) !== DateTime.fromISO(plan.timingOptions.paymentSchedule[startOfCycle][startingDate]).toLocaleString(DateTime.DATE_MED);
          });
          startingDate = 0;
          startOfCycle++;
        }
      }
      if (plan.amountSaved - item.amount < 0) {
        plan.amountSaved = 0;
      } else {
        plan.amountSaved -= item.amount;
      }

      plan.paidStatus = `Partially Paid`;
      plan.timingOptions.paymentSchedule = plan.timingOptions.paymentSchedule.filter((dateArray) => {
        return dateArray.length !== 0;
      });

      if (plan.timingOptions.paymentSchedule.length === 0) {
        placeholderBudget.transactions.plannedTransactions = placeholderBudget.transactions.plannedTransactions.filter((planCheck) => {
          plan.paidStatus = `Paid Off`;
          return planCheck !== plan;
        });
      }
      utility.amountSaved = savedAmount;
    } else if (item.amount >= plan.amount / divisor && plan.amountSaved < plan.amount / divisor) {
      savedAmount -= plan.amountSaved;
      let startOfCycle;

      // * GETTING THE DATE ARRAY INDEX OF THE SCHEDULED PAYMENT DATE.
      plan.timingOptions.paymentSchedule.forEach((dateArray, i) => {
        let index = i;
        dateArray.forEach((date) => {
          if (DateTime.fromISO(item.scheduledPayment).toLocaleString(DateTime.DATETIME_MED_WITH_WEEKDAY) === DateTime.fromISO(date).toLocaleString(DateTime.DATETIME_MED_WITH_WEEKDAY)) {
            startOfCycle = index;
          }
        });
      });

      // * GETTING THE DATE INDEX OF THE SCHEDULED PAYMENT DATE.
      let startingDate;
      plan.timingOptions.paymentSchedule[startOfCycle].forEach((date, i) => {
        if (DateTime.fromISO(item.scheduledPayment).toLocaleString(DateTime.DATETIME_MED_WITH_WEEKDAY) === DateTime.fromISO(date).toLocaleString(DateTime.DATETIME_MED_WITH_WEEKDAY)) {
          startingDate = i;
        }
      });
      let dateArrayIndex;

      // * What I am looking to do here and from the weekly payments onward is to get it to start at the scheduled payment's date and go forward from there to however many payments are needed to be removed.
      // ? What if the date selected is the latter half of the bi-annual array?
      plan.timingOptions.paymentSchedule.forEach((dateArray, i) => {
        if (dateArray.includes(item.scheduledPayment)) {
          dateArrayIndex === i;
        }
      });

      let numberOfPayments = Math.round(item.amount / (plan.amount / divisor));
      for (let startingPayment = 0; startingPayment < numberOfPayments; startingPayment++) {
        if (startingDate === 0) {
          if (plan.timingOptions.paymentSchedule[startOfCycle].length === 0) {
            startOfCycle++;
          }
          plan.timingOptions.paymentSchedule[startOfCycle] = plan.timingOptions.paymentSchedule[startOfCycle].filter((date) => {
            console.log(plan.timingOptions.paymentSchedule[startOfCycle]);
            return DateTime.fromISO(date).toLocaleString(DateTime.DATE_MED) !== DateTime.fromISO(plan.timingOptions.paymentSchedule[startOfCycle][startingDate]).toLocaleString(DateTime.DATE_MED);
          });
        }
        if (startingDate === 1) {
          plan.timingOptions.paymentSchedule[startOfCycle] = plan.timingOptions.paymentSchedule[startOfCycle].filter((date) => {
            console.log(plan.timingOptions.paymentSchedule[startOfCycle]);
            return DateTime.fromISO(date).toLocaleString(DateTime.DATE_MED) !== DateTime.fromISO(plan.timingOptions.paymentSchedule[startOfCycle][startingDate]).toLocaleString(DateTime.DATE_MED);
          });
          startingDate = 0;
          startOfCycle++;
        }
      }
      if (plan.amountSaved - item.amount < 0) {
        plan.amountSaved = 0;
      } else {
        plan.amountSaved -= item.amount;
      }

      plan.paidStatus = `Partially Paid`;
      plan.timingOptions.paymentSchedule = plan.timingOptions.paymentSchedule.filter((dateArray) => {
        return dateArray.length !== 0;
      });

      if (plan.timingOptions.paymentSchedule.length === 0) {
        placeholderBudget.transactions.plannedTransactions = placeholderBudget.transactions.plannedTransactions.filter((planCheck) => {
          plan.paidStatus = `Paid Off`;
          return planCheck !== plan;
        });
      }
      utility.amountSaved = savedAmount;
    } else if (item.amount < plan.amount / divisor && plan.amountSaved >= plan.amount / divisor) {
      if ((plan.amountSaved -= item.amount < 0)) {
        plan.amountSaved = 0;
      } else {
        plan.amountSaved -= item.amount;
      }
      plan.paidStatus = `Partially Paid`;
      utility.amountSaved = savedAmount;
    } else if (item.amount < plan.amount / divisor && plan.amountSaved < plan.amount / divisor) {
      if ((plan.amountSaved -= item.amount <= 0)) {
        plan.amountSaved = 0;
        if (plan.paidStatus === `Partially Paid` && plan.amountSaved === 0) {
          plan.timingOptions.paymentSchedule.forEach((dateArray) => {
            dateArray = dateArray.filter((date) => {
              return DateTime.fromISO(date).toLocaleString(DateTime.DATETIME_MED_WITH_WEEKDAY) !== DateTime.fromISO(item.scheduledPayment).toLocaleString(DateTime.DATETIME_MED_WITH_WEEKDAY);
            });
          });
        }
      } else {
        plan.amountSaved -= item.amount;
        if (plan.amountSaved === 0) {
        }
      }
      plan.paidStatus = `Partially Paid`;
      utility.amountSaved = savedAmount;
    }
  } else if (paymentCycle !== `Bi-Monthly` && paymentCycle !== `Bi-Annual`) {
    /*
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    *~~~~~~~~~~~                                  ~~~~~~~~~~~~
    *~~~~~~~~~~~   NOT BI-MONTHLY AND BI-ANNUAL   ~~~~~~~~~~~~
    *~~~~~~~~~~~                                  ~~~~~~~~~~~~
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  */

    let startOfCycle;
    if (item.amount >= plan.amount / divisor && plan.amountSaved >= plan.amount / divisor) {
      savedAmount -= plan.amountSaved;

      plan.timingOptions.paymentSchedule.forEach((date, i) => {
        if (DateTime.fromISO(item.scheduledPayment).toLocaleString(DateTime.DATETIME_MED_WITH_WEEKDAY) === DateTime.fromISO(date).toLocaleString(DateTime.DATETIME_MED_WITH_WEEKDAY)) {
          startOfCycle = i;
        }
      });

      let numberOfPayments = Math.round(item.amount / (plan.amount / divisor));
      for (let startingPayment = 0; startingPayment < numberOfPayments; startingPayment++) {
        plan.timingOptions.paymentSchedule = plan.timingOptions.paymentSchedule.filter((dateCheck) => {
          return DateTime.fromISO(dateCheck).toLocaleString(DateTime.DATE_MED) !== DateTime.fromISO(plan.timingOptions.paymentSchedule[startOfCycle]).toLocaleString(DateTime.DATE_MED);
        });
        startOfCycle++;
      }
      if (plan.amountSaved - item.amount < 0) {
        plan.amountSaved = 0;
      } else {
        plan.amountSaved -= item.amount;
      }
      plan.paidStatus = `Partially Paid`;

      if (plan.timingOptions.paymentSchedule.length === 0) {
        placeholderBudget.transactions.plannedTransactions = placeholderBudget.transactions.plannedTransactions.filter((planCheck) => {
          plan.paidStatus = `Paid Off`;
          return planCheck !== plan;
        });
      }

      utility.amountSaved = savedAmount;
    }
    if (item.amount >= plan.amount / divisor && plan.amountSaved < plan.amount / divisor) {
      savedAmount -= plan.amountSaved;

      plan.timingOptions.paymentSchedule.forEach((date, i) => {
        if (DateTime.fromISO(item.scheduledPayment).toLocaleString(DateTime.DATETIME_MED_WITH_WEEKDAY) === DateTime.fromISO(date).toLocaleString(DateTime.DATETIME_MED_WITH_WEEKDAY)) {
          startOfCycle = i;
        }
      });

      console.log(divisor, Math.round(item.amount / (plan.amount / divisor)));
      let numberOfPayments = Math.round(item.amount / (plan.amount / divisor));
      for (let startingPayment = 0; startingPayment < numberOfPayments; startingPayment++) {
        plan.timingOptions.paymentSchedule = plan.timingOptions.paymentSchedule.filter((dateCheck) => {
          return DateTime.fromISO(dateCheck).toLocaleString(DateTime.DATE_MED) !== DateTime.fromISO(plan.timingOptions.paymentSchedule[startOfCycle]).toLocaleString(DateTime.DATE_MED);
        });
        startOfCycle++;
      }
      if (plan.amountSaved - item.amount < 0) {
        plan.amountSaved = 0;
      } else {
        plan.amountSaved -= item.amount;
      }
      plan.paidStatus = `Partially Paid`;

      if (plan.timingOptions.paymentSchedule.length === 0) {
        placeholderBudget.transactions.plannedTransactions = placeholderBudget.transactions.plannedTransactions.filter((planCheck) => {
          plan.paidStatus = `Paid Off`;
          return planCheck !== plan;
        });
      }

      utility.amountSaved = savedAmount;
    }
    if (item.amount < plan.amount / divisor && plan.amountSaved >= plan.amount / divisor) {
      if ((plan.amountSaved -= item.amount < 0)) {
        plan.amountSaved = 0;
      } else {
        plan.amountSaved -= item.amount;
      }
      plan.paidStatus = `Partially Paid`;
      utility.amountSaved = savedAmount;
    }
    if (item.amount < plan.amount / divisor && plan.amountSaved < plan.amount / divisor) {
      if ((plan.amountSaved -= item.amount <= 0)) {
        plan.amountSaved = 0;
        if (plan.paidStatus === `Partially Paid` && plan.amountSaved === 0) {
          plan.timingOptions.paymentSchedule = plan.timingOptions.paymentSchedule.filter((date) => {
            return DateTime.fromISO(date).toLocaleString(DateTime.DATETIME_MED_WITH_WEEKDAY) !== DateTime.fromISO(item.scheduledPayment).toLocaleString(DateTime.DATETIME_MED_WITH_WEEKDAY);
          });
        }
      } else {
        if (plan.amountSaved - item.amount < 0) {
          console.log(`BELOW ZERO!`);
          plan.amountSaved = 0;
        } else {
          plan.amountSaved -= item.amount;
        }
      }
      plan.paidStatus = `Partially Paid`;
      if (plan.timingOptions.paymentSchedule.length === 0) {
        placeholderBudget.transactions.plannedTransactions = placeholderBudget.transactions.plannedTransactions.filter((planCheck) => {
          return planCheck !== plan;
        });
        plan.paidStatus = `Paid Off`;
      }
      utility.amountSaved = savedAmount;
    }
  }
};

const buildTransactionOptions = (options) => {
  let transactionOptions = [];
  options.forEach((option, i) => {
    if (option) {
      option.classList.add('closed');
      transactionOptions.push(option);
    }
  });
  return transactionOptions;
};

const resetTransactionOptions = (allOptions) => {
  allOptions.forEach((option) => {
    option.forEach((optionItem) => {
      optionItem.classList.remove('open');
      optionItem.classList.add('closed');
    });
  });
};

const getTranslations = (user, elements) => {
  elements.forEach(async (element) => {
    element.textContent = await Utility.getTranslation(user, element.textContent);
  });
};

const getCategoryFilteredPlans = (plans, category, subCategory) => {
  const mainCategoryPlans = plans.filter((plan) => plan.category === category);
  const subCategoryPlans = mainCategoryPlans.filter((plan) => plan.subCategory === subCategory);
};

const filterTransactionItems = (dueDates, timingArray) => {
  [...dueDates.childNodes].forEach((child) => child.remove());
  timingArray.forEach((plan) => {
    if ([...dueDates.childNodes][0] !== 'Select Date') {
      let option = document.createElement('option');
      Utility.addClasses(option, [`form__select--option`, `r__form__select--optioni`]);
      option.value = `Select Date`;
      option.textContent = `Select Date`;
      Utility.insertElement('beforeend', dueDates, option);
    }
    if (plan.timingOptions.paymentCycle !== `Bi-Monthly` && plan.timingOptions.paymentCycle !== `Bi-Annual`) {
      plan.timingOptions.paymentSchedule.forEach((date) => {
        let option = document.createElement('option');
        Utility.addClasses(option, [`form__select--option`, `r__form__select--option`]);
        option.value = DateTime.fromISO(date).toISO();
        option.textContent = DateTime.fromISO(date).toLocaleString(DateTime.DATE_MED);
        Utility.insertElement('beforeend', dueDates, option);
      });
    }
    if (plan.timingOptions.paymentCycle === `Bi-Monthly` || plan.timingOptions.paymentCycle === `Bi-Annual`) {
      plan.timingOptions.paymentSchedule.forEach((dateArray) => {
        dateArray.forEach((date) => {
          let option = document.createElement('option');
          Utility.addClasses(option, [`form__select--option`, `r__form__select--option`]);
          option.value = DateTime.fromISO(date).toISO();
          option.textContent = DateTime.fromISO(date).toLocaleString(DateTime.DATE_MED);
          Utility.insertElement('beforeend', dueDates, option);
        });
      });
    }
  });
};

const filterTransactionLenders = (transactionLenderArray, typeArray, dueDates, lenderSelection, items, optionText, planItemType) => {
  [...dueDates.childNodes].forEach((child) => child.remove());
  transactionLenderArray = typeArray.filter((plan) => plan.lender === lenderSelection.value);

  [...items.childNodes].forEach((child) => child.remove());
  if (transactionLenderArray[0] !== optionText) {
    let option = document.createElement('option');
    Utility.addClasses(option, [`form__select--option`, `r__form__select--optioni`]);
    option.value = optionText;
    option.textContent = optionText;
    Utility.insertElement('beforeend', items, option);
  }
  transactionLenderArray.forEach((plan) => {
    let option = document.createElement('option');
    Utility.addClasses(option, [`form__select--option`, `r__form__select--optioni`]);
    option.value = plan[planItemType];
    option.textContent = plan[planItemType];
    Utility.insertElement('beforeend', items, option);
  });

  return transactionLenderArray;
};

const filterTransactionTimings = (transactionTimingArray, typeArray, dueDates, timingSelection, items, optionText, planItemType) => {
  [...dueDates.childNodes].forEach((child) => child.remove());
  transactionTimingArray = typeArray.filter((plan) => plan.timingOptions.paymentCycle === timingSelection.value);

  [...items.childNodes].forEach((child) => child.remove());
  if (transactionTimingArray[0] !== optionText) {
    let option = document.createElement('option');
    Utility.addClasses(option, [`form__select--option`, `r__form__select--optioni`]);
    option.value = optionText;
    option.textContent = optionText;
    Utility.insertElement('beforeend', items, option);
  }
  transactionTimingArray.forEach((plan) => {
    let option = document.createElement('option');
    Utility.addClasses(option, [`form__select--option`, `r__form__select--optioni`]);
    option.value = plan[planItemType];
    option.textContent = plan[planItemType];
    Utility.insertElement('beforeend', items, option);
  });
  return transactionTimingArray;
};

const filterTransactionTypes = (account, accountArray, typeArray, dueDates, budget, typeSelection) => {
  [...dueDates.childNodes].forEach((child) => child.remove());
  accountArray = budget.transactions.plannedTransactions.filter((plan) => plan.account === account.value);
  typeArray = accountArray.filter((plan) => plan.subAccount === typeSelection.value);
  return typeArray;
};

const renderTransactionTypes = (typeSelection, types) => {
  [...typeSelection.childNodes].forEach((child) => child.remove());
  types.forEach((type) => {
    let option = document.createElement('option');
    Utility.addClasses(option, [`form__select--option`, `r__form__select--option`]);
    option.value = type;
    option.textContent = type;
    Utility.insertElement(`beforeend`, typeSelection, option);
  });

  if ([...typeSelection.childNodes][0] !== 'Select Type') {
    let option = document.createElement('option');
    Utility.addClasses(option, [`form__select--option`, `r__form__select--option`]);
    option.value = `Select Type`;
    option.textContent = `Select Type`;
    Utility.insertElement(`afterbegin`, typeSelection, option);
    [...typeSelection.childNodes][0].selected = `selected`;
  }
};

const setupAccount = (account, types, typeSelection, timingSelection, items, dueDates, budget, loweredItems) => {
  const dueDateSelectionSection = document.getElementById('dueDates').closest('.form__section--select');
  Utility.removeClasses(dueDateSelectionSection, [`raised`]);
  renderTransactionTypes(typeSelection, types);

  let accountFilteredPlans, typeFilteredPlans;
  typeSelection.addEventListener(`change`, (e) => {
    e.preventDefault();
    typeFilteredPlans = filterTransactionTypes(account, accountFilteredPlans, typeFilteredPlans, dueDates, budget, typeSelection);
  });

  let timingFilteredPlans;
  timingSelection.addEventListener(`change`, (e) => {
    timingFilteredPlans = filterTransactionTimings(timingFilteredPlans, typeFilteredPlans, dueDates, timingSelection, items, `Select Item`, `name`);
  });
  items.addEventListener('change', (e) => {
    e.preventDefault();
    filterTransactionItems(dueDates, timingFilteredPlans, loweredItems);
  });

  Utility.removeClasses(dueDates.closest('.form__section--select'), [`lowered`]);
  loweredItems.forEach((option) => {
    Utility.addClasses(option, [`lowered`]);
  });
};

const selectAccount = (accounts, account, transactionOptions, placeholderBudget) => {
  const transactionCreationContainer = document.querySelector('.form__section--transaction-item-creation');

  let index;
  accounts.forEach((accountCheck, i) => (accountCheck.value === account.value ? (index = i) : null));

  transactionOptions.forEach((array, i) => {
    array.forEach((arrayItem) => {
      arrayItem.classList.remove('open');
      arrayItem.classList.add('closed');
      arrayItem.firstChild.classList.remove('lowered');
    });
  });
  index = index - 1;
  transactionOptions[index].forEach((option) => {
    Utility.replaceClassName(option, `closed`, `open`);
  });

  if (account.value === `Monthly Budget`) {
    const mainCategorySelection = transactionOptions[0][0].firstChild.nextSibling;
    const subCategorySelection = transactionOptions[0][1].firstChild.nextSibling;
    let index;

    const remainingOptions = transactionOptions[0].slice(transactionOptions[0].length - 3);
    remainingOptions.forEach((option) => {
      Utility.removeClasses(option, [`lowered`]);
    });

    const dueDateSelectionSection = document.getElementById('dueDates').closest('.form__section--select');
    Utility.addClasses(dueDateSelectionSection, [`raised`]);

    if ([...mainCategorySelection.childNodes][0].textContent !== 'Select Category') {
      let option = document.createElement('option');
      Utility.addClasses(option, [`category-selection`, `r__category-selection`]);
      option.value = 'Select Category';
      option.textContent = 'Select Category';
      Utility.insertElement(`afterbegin`, mainCategorySelection, option);
      [...mainCategorySelection.childNodes][0].selected = `selected`;
    }
    if ([...subCategorySelection.childNodes][0].textContent !== '') {
      let option = document.createElement('option');
      Utility.addClasses(option, [`category-selection`, `r__category-selection`]);
      option.value = 'Select Category';
      option.textContent = 'Select Category';
      Utility.insertElement(`afterbegin`, subCategorySelection, option);
      [...subCategorySelection.childNodes][0].selected = `selected`;
    }
    mainCategorySelection.addEventListener(`change`, (e) => {
      e.preventDefault();
      [...mainCategorySelection.childNodes].forEach((child, i) => {
        if (child.textContent === mainCategorySelection.value) {
          index = i - 1;
        }
      });
      [...subCategorySelection.childNodes].forEach((child) => {
        Utility.replaceClassName(child, `open`, `closed`);
      });
      [...subCategorySelection.childNodes].forEach((child) => {
        if (Number(child.dataset.category) === index) {
          Utility.replaceClassName(child, `closed`, `open`);
        }
        let filteredSubCategories = [...subCategorySelection.childNodes].filter((child) => {
          return Number(child.dataset.category) === index;
        });

        filteredSubCategories[0].selected = `selected`;
      });
    });
    subCategorySelection.addEventListener(`change`, (e) => {
      e.preventDefault();
      const dueDateSelection = document.getElementById('dueDates');
      [...dueDateSelection.childNodes].forEach((child) => child.remove());
      Utility.addClasses(dueDateSelection.closest('.form__section--select'), [`raised`]);

      const filteredSubCategories = placeholderBudget.mainCategories[index].subCategories.filter((sc) => {
        return sc.title === subCategorySelection.value;
      });
      if (filteredSubCategories[0].timingOptions.paymentSchedule) {
        if (filteredSubCategories[0].timingOptions.paymentCycle !== `Bi-Monthly` && filteredSubCategories[0].timingOptions.paymentCycle !== `Bi-Annual`) {
          filteredSubCategories[0].timingOptions.paymentSchedule.forEach((date) => {
            let option = document.createElement('option');
            Utility.addClasses(option, [`form__select--option`, `r__form__select--option`]);
            option.value = DateTime.fromISO(date).toISO();
            option.textContent = DateTime.fromISO(date).toLocaleString(DateTime.DATE_MED);
            Utility.insertElement(`beforeend`, dueDateSelection, option);
          });
        }
        if (filteredSubCategories[0].timingOptions.paymentCycle === `Bi-Monthly` || filteredSubCategories[0].timingOptions.paymentCycle === `Bi-Annual`) {
          filteredSubCategories[0].timingOptions.paymentSchedule.forEach((dateArray) => {
            dateArray.forEach((date) => {
              let option = document.createElement('option');
              Utility.addClasses(option, [`form__select--option`, `r__form__select--option`]);
              option.value = DateTime.fromISO(date).toISO();
              option.textContent = DateTime.fromISO(date).toLocaleString(DateTime.DATE_MED);
              Utility.insertElement(`beforeend`, dueDateSelection, option);
            });
          });
        }
      }
    });
  }
  if (account.value === `Emergency Fund`) {
    transactionOptions[1].forEach((option) => {
      Utility.addClasses(option, [`lowered`]);
    });
  }
  if (account.value === `Savings Fund`) {
    let savingsTypes = [`Expense`, `Subscription`, `Vacation`, `Tuition`, `Other`];
    let savingsTypeSelection = transactionOptions[2][0].firstChild.nextSibling;
    let savingsTimingSelection = savingsTypeSelection.closest(`.form__section--select`).nextSibling.firstChild.nextSibling;
    let savingsItems = document.getElementById('savingsGoals');
    let savingsDueDates = document.getElementById('dueDates');

    setupAccount(account, savingsTypes, savingsTypeSelection, savingsTimingSelection, savingsItems, savingsDueDates, placeholderBudget, transactionOptions[2].slice(transactionOptions[2].length - 3));
  }
  if (account.value === `Expense Fund`) {
    let expenseTypes = [`Expense`, `Bill`, `Subscription`, `Other`];
    let expenseTypeSelection = transactionOptions[3][0].firstChild.nextSibling;
    let expenseTimingSelection = expenseTypeSelection.closest(`.form__section--select`).nextSibling.firstChild.nextSibling;
    let expenseItems = document.getElementById('savingsGoals');
    let expenseDueDates = document.getElementById('dueDates');

    setupAccount(account, expenseTypes, expenseTypeSelection, expenseTimingSelection, expenseItems, expenseDueDates, placeholderBudget, transactionOptions[3].slice(transactionOptions[3].length - 3));
  }
  if (account.value === `Surplus`) {
    let surplusTypes = [`Expense`, `Subscription`, `Discretionary`, `Food`, `Other`];
    let surplusTypeSelection = transactionOptions[4][0].firstChild.nextSibling;
    let surplusTimingSelection = surplusTypeSelection.closest(`.form__section--select`).nextSibling.firstChild.nextSibling;
    let surplusItems = document.getElementById('savingsGoals');
    let surplusDueDates = document.getElementById('dueDates');
    setupAccount(account, surplusTypes, surplusTypeSelection, surplusTimingSelection, surplusItems, surplusDueDates, placeholderBudget, transactionOptions[4].slice(transactionOptions[4].length - 3));
  }
  if (account.value === `Investment Fund`) {
    let investmentTypes = [`Stock Market`, `Real Estate`, `Timeshare`, `Other`];
    let investmentTypeSelection = transactionOptions[5][0].firstChild.nextSibling;
    let remainingOptions = transactionOptions[5].slice(transactionOptions[5].length - 4);
    const dueDateSelectionSection = document.getElementById('dueDates').closest('.form__section--select');
    Utility.removeClasses(dueDateSelectionSection, [`raised`]);
    renderTransactionTypes(investmentTypeSelection, investmentTypes);
    console.log(remainingOptions, transactionOptions);
    remainingOptions.forEach((option) => {
      Utility.addClasses(option, [`lowered`]);
    });
  }
  if (account.value === `Debt`) {
    let debtTypes = [`Credit Card`, `Loan`, `Taxes`, `Debt`, `Other`];
    let debtTypeSelection = transactionOptions[6][0].firstChild.nextSibling;
    let debtTimingSelection = debtTypeSelection.closest(`.form__section--select`).nextSibling.firstChild.nextSibling;
    let debtLenderSelection = document.getElementById('lender');
    let debtItems = document.getElementById('savingsGoals');
    let debtDueDates = document.getElementById('dueDates');
    const dueDateSelectionSection = document.getElementById('dueDates').closest('.form__section--select');
    Utility.removeClasses(dueDateSelectionSection, [`raised`]);
    let remainingOptions = transactionOptions[6].slice(transactionOptions[6].length - 3);
    renderTransactionTypes(debtTypeSelection, debtTypes);

    let accountFilteredPlans, typeFilteredPlans;

    debtTypeSelection.addEventListener(`change`, (e) => {
      e.preventDefault();
      typeFilteredPlans = filterTransactionTypes(account, accountFilteredPlans, typeFilteredPlans, debtDueDates, placeholderBudget, debtTypeSelection);
    });

    let timingFilteredPlans;
    debtTimingSelection.addEventListener(`change`, (e) => {
      timingFilteredPlans = filterTransactionTimings(timingFilteredPlans, typeFilteredPlans, debtDueDates, debtTimingSelection, debtLenderSelection, `Select Lender`, `lender`);
    });

    let lenderFilteredPlans;
    debtLenderSelection.addEventListener('change', (e) => {
      lenderFilteredPlans = filterTransactionLenders(lenderFilteredPlans, typeFilteredPlans, debtDueDates, debtLenderSelection, debtItems, `Select Item`, `name`);
    });

    debtItems.addEventListener('change', (e) => {
      e.preventDefault();
      filterTransactionItems(debtDueDates, lenderFilteredPlans);
    });

    Utility.removeClasses(dueDates.closest('.form__section--select'), [`lowered`]);
    remainingOptions.forEach((option) => {
      Utility.addClasses(option, [`lowered`]);
    });
  }
  if (account.value === `Tithing`) {
    transactionOptions[1].forEach((option) => {
      Utility.addClasses(option, [`lowered`]);
    });
  }
};

const startTransaction = (container, utility, transactionOptions, accountSelection, transactionSaveButton, budget, placeholderBudget, user) => {
  console.log(`Starting Transaction...`);
  const transactionHeaderInputs = document.querySelectorAll('.form__input--small-thinner');
  const transactionHeaderInputsTwo = document.querySelectorAll('.form__input--small-thinner__wide');
  Utility.toggleClasses(container, [`closed`, `open`]);
  let transaction;
  if (container.classList.contains('closed')) {
    resetTransactionOptions(transactionOptions);
  } else {
    transaction = new Transaction({ date: transactionHeaderInputs[0].value, location: transactionHeaderInputsTwo[0].value });
    console.log(transaction);
    utility.transaction = transaction;
  }
  console.log(user);
  let transactionTypeSelect = document.getElementById('transactionType');
  let transactionItemSelect = document.getElementById('savingsGoals');
  let transactionLenderSelect = document.getElementById('lender');
  [...transactionTypeSelect.childNodes].forEach((child) => {
    child.remove();
  });
  [...transactionItemSelect.childNodes].forEach((child) => {
    child.remove();
  });
  [...transactionLenderSelect.childNodes].forEach((child) => {
    child.remove();
  });

  let accounts = [...accountSelection.firstChild.nextSibling.childNodes];
  accounts[0].selected = `selected`;
  accountSelection.removeEventListener(`change`, selectAccount);
  accountSelection.addEventListener(`change`, selectAccount.bind(this, accounts, accountSelection.firstChild.nextSibling, transactionOptions, placeholderBudget));
};

export const _watchEnteringTransactions = async (budget, placeholderBudget, user, utility) => {
  const dashboard = document.querySelector('.budget-dashboard');
  const transactionContainers = document.querySelectorAll('.container--small');

  ////////////////////////////////////////////
  // ENTERING TRANSACTIONS

  const enterTransactionThinLabels = [...document.querySelectorAll('.form__label--small-thinner'), ...document.querySelectorAll('.form__label--small-thinner__wide')];
  const receiptHeader = document.querySelector('.receipt-header__text');
  const receiptSecondaryHeaders = document.querySelectorAll('.secondary-title');
  const formLabelSelects = document.querySelectorAll('.form__label--select');
  if (enterTransactionThinLabels[0]) {
    getTranslations(user, [...enterTransactionThinLabels, receiptHeader, ...receiptSecondaryHeaders, ...formLabelSelects]);
  }

  ////////////////////////////////////////////
  // INITIALIZE TRANSACTION OPTIONS

  if (transactionContainers[1]) {
    const smallContainerButtons = document.querySelectorAll('.button--small-container-header');
    const transactionSelects = document.querySelectorAll('.form__section--select');
    const transactionOptions = document.querySelectorAll('.form__section--transaction-option');
    const transactionButtons = document.querySelectorAll('.button--transaction-button');
    const transactionCreationContainer = document.querySelector('.form__section--transaction-item-creation');
    const transactionCost = document.querySelector('.container--small__transaction-total__amount');
    const transactionSubmitButton = smallContainerButtons[1];
    console.log(transactionSelects);

    const accountSelection = transactionSelects[0];
    //////////////////////////////////////////
    // UNIVERSAL TRANSACTION OPTIONS
    const addTransactionItemButton = transactionButtons[0];
    if (addTransactionItemButton) {
      addTransactionItemButton.textContent = await Utility.getTranslation(user, addTransactionItemButton.textContent);
    }
    const transactionDescription = transactionOptions[1];
    const transactionAmount = transactionOptions[2];
    const transactionName = transactionOptions[0];
    const transactionType = transactionSelects[3];
    const transactionTiming = transactionSelects[4];
    const transactionItem = transactionSelects[6];
    const transactionSaveButton = transactionButtons[1];

    //////////////////////////////////////////
    // MONTHLY BUDGET TRANSACTION OPTIONS
    const mainCategorySelect = transactionSelects[1];
    const subCategorySelect = transactionSelects[2];

    //////////////////////////////////////////
    // DEBT TRANSACTION OPTIONS
    const transactionLender = transactionSelects[5];

    //////////////////////////////////////////
    // TRANSACTION PLAN TRANSACTION OPTIONS
    const transactionPlanDates = transactionSelects[7];

    ///////////////////////////////////////////
    // TRANSLATING DIFFERENT TRANSACTION OPTIONS

    const transactionAmountLabel = transactionAmount.firstChild.nextSibling;
    const transactionDescriptionLabel = transactionDescription.firstChild.nextSibling;
    if (transactionDescription) {
      transactionDescriptionLabel.textContent = await Utility.getTranslation(user, transactionDescriptionLabel.textContent);
    }
    if (transactionAmountLabel) {
      transactionAmountLabel.textContent = await Utility.getTranslation(user, transactionAmountLabel.textContent);
    }
    if (transactionDescriptionLabel) {
      transactionDescription.firstChild.placeholder = await Utility.getTranslation(user, transactionDescription.firstChild.placeholder);
    }
    if (transactionAmount) {
      transactionAmount.firstChild.placeholder = Utility.formatPlaceholder(transactionAmount.firstChild.placeholder);
    }
    if (transactionTiming) {
      transactionTiming.firstChild.nextSibling.childNodes.forEach(async (child) => (child.textContent = await Utility.getTranslation(user, child.textContent)));
    }

    //////////////////////////////////////////
    // BUILD TRANSACTION OPTIONS
    const monthlyBudgetTransactionOptions = buildTransactionOptions([mainCategorySelect, subCategorySelect, transactionPlanDates, transactionDescription, transactionAmount, transactionSaveButton]);
    const emergencyFundTransactionsOptions = buildTransactionOptions([transactionDescription, transactionAmount, transactionSaveButton]);
    const savingsFundTransactionOptions = buildTransactionOptions([
      transactionType,
      transactionTiming,
      transactionItem,
      transactionPlanDates,
      transactionDescription,
      transactionAmount,
      transactionSaveButton,
    ]);
    const expenseFundTransactionOptions = buildTransactionOptions([
      transactionType,
      transactionTiming,
      transactionItem,
      transactionPlanDates,
      transactionDescription,
      transactionAmount,
      transactionSaveButton,
    ]);
    const surplusTransactionOptions = buildTransactionOptions([
      transactionType,
      transactionTiming,
      transactionItem,
      transactionPlanDates,
      transactionDescription,
      transactionAmount,
      transactionSaveButton,
    ]);
    const investmentTransactionOptions = buildTransactionOptions([transactionType, transactionName, transactionDescription, transactionAmount, transactionSaveButton]);
    const debtTransactionOptions = buildTransactionOptions([
      transactionType,
      transactionTiming,
      transactionLender,
      transactionItem,
      transactionPlanDates,
      transactionDescription,
      transactionAmount,
      transactionSaveButton,
    ]);
    const tithingTransactionsOptions = buildTransactionOptions([transactionAmount, transactionSaveButton]);

    const allTransactionOptions = [
      monthlyBudgetTransactionOptions,
      emergencyFundTransactionsOptions,
      savingsFundTransactionOptions,
      expenseFundTransactionOptions,
      surplusTransactionOptions,
      investmentTransactionOptions,
      debtTransactionOptions,
      tithingTransactionsOptions,
    ];
    if (addTransactionItemButton) {
      addTransactionItemButton.addEventListener(
        `click`,
        startTransaction.bind(this, transactionCreationContainer, utility, allTransactionOptions, accountSelection, transactionSaveButton, budget, placeholderBudget, user)
      );
    }

    const receiptItemContainer = document.querySelector('.receipt-item-container');
    let transaction;
    if (transactionSaveButton) {
      transactionSaveButton.addEventListener('click', async (e) => {
        e.preventDefault();
        console.log(`Saving...`);
        const fullTransactionCost = document.querySelectorAll('.container--small__transaction-total__amount')[0];

        transaction = utility.transaction;
        let account = accountSelection.firstChild.nextSibling.value;

        const receiptRow = document.createElement('section');
        Utility.addClasses(receiptRow, ['receipt-item-container__row', 'r__receipt-item-container__row']);
        Utility.insertElement('beforeend', receiptItemContainer, receiptRow);

        const transactionDetails = document.createElement('section');
        Utility.addClasses(transactionDetails, ['transaction-item-details', 'r__transaction-item-details']);
        Utility.insertElement('beforeend', receiptRow, transactionDetails);

        const transactionCostDetails = document.createElement('section');
        Utility.addClasses(transactionCostDetails, ['transaction-item-cost', 'r__transaction-item-cost']);
        Utility.insertElement('beforeend', receiptRow, transactionCostDetails);

        let detailCount = 1;
        let detailStart = 0;

        if (account === `Monthly Budget` || account === `Debt`) {
          detailCount = 2;
        }

        let mainCategory = mainCategorySelect.firstChild.nextSibling.value;
        let subCategory = subCategorySelect.firstChild.nextSibling.value;
        let description = transactionDescription.firstChild.value;
        let item = transactionItem.firstChild.nextSibling.value;
        let itemName = transactionName.firstChild.value;
        let lender = transactionLender.firstChild.nextSibling.value;
        let tithingAmount = accountSelection.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.firstChild.value;
        let transactionCost = transactionAmount.firstChild.value;
        let scheduledPayment = document.querySelector('#dueDates').value;

        while (detailStart < detailCount) {
          let receiptDetail = document.createElement('p');
          Utility.addClasses(receiptDetail, ['transaction-item-details__detail', 'r__transaction-item-details__detail']);

          if (account === `Monthly Budget`) {
            if (detailStart === 0) {
              receiptDetail.textContent = await Utility.getTranslation(user, mainCategory);
              receiptDetail.value = mainCategory;
            }
            if (detailStart === 1) {
              receiptDetail.textContent = await Utility.getTranslation(user, subCategory);
              receiptDetail.value = subCategory;
            }
          }

          if (account === `Emergency Fund`) {
            if (detailStart === 0) {
              receiptDetail.textContent = await Utility.getTranslation(user, description);
              receiptDetail.value = description;
            }
          }
          if (account === `Savings Fund` || account === `Expense Fund` || account === `Surplus`) {
            if (detailStart === 0) {
              receiptDetail.textContent = await Utility.getTranslation(user, item);
              receiptDetail.value = item;
            }
          }
          if (account === `Investment Fund`) {
            if (detailStart === 0) {
              receiptDetail.textContent = await Utility.getTranslation(user, itemName);
              receiptDetail.value = itemName;
            }
          }
          if (account === `Debt`) {
            if (detailStart === 0) {
              receiptDetail.textContent = await Utility.getTranslation(user, lender);
              receiptDetail.value = lender;
            }
            if (detailStart === 1) {
              receiptDetail.textContent = await Utility.getTranslation(user, item);
              receiptDetail.value = item;
            }
          }
          if (account === `Tithing`) {
            if (detailStart === 0) {
              receiptDetail.textContent = account;
              receiptDetail.value = tithingAmount;
            }
          }
          Utility.insertElement('beforeend', transactionDetails, receiptDetail);
          detailStart++;
        }

        const receiptDetailCost = document.createElement('p');
        Utility.addClasses(receiptDetailCost, ['transaction-item-cost__cost', 'r__transaction-item-cost__cost']);
        receiptDetailCost.textContent = utility.money.format(Number(transactionAmount.firstChild.value));
        Utility.insertElement('beforeend', transactionCostDetails, receiptDetailCost);

        const removeTransactionItemIcon = document.createElement('i');
        Utility.addClasses(removeTransactionItemIcon, [`fas`, `fa-trash-alt`, `remove-transaction`, `r__remove-transaction`, `closed`]);
        Utility.insertElement('beforeend', transactionCostDetails, removeTransactionItemIcon);

        removeTransactionItemIcon.addEventListener('click', (e) => {
          let removeTransactionIcons = document.querySelectorAll('.remove-transaction');
          let index = [...removeTransactionIcons].indexOf(e.target);
          let receiptTransactions = document.querySelectorAll('.receipt-item-container__row');
          receiptTransactions[index].remove();
          transaction.removeFromReceipt(index);
          let receiptTotal = transaction.receipt.reduce((total, receiptItem) => {
            return (total += receiptItem.amount);
          }, 0);
          fullTransactionCost.textContent = utility.money.format(receiptTotal);
        });

        receiptRow.addEventListener('mouseover', (e) => {
          e.preventDefault();
          Utility.toggleClasses(removeTransactionItemIcon, [`closed`, `open`]);
        });
        receiptRow.addEventListener('mouseout', (e) => {
          e.preventDefault();
          Utility.toggleClasses(removeTransactionItemIcon, [`closed`, `open`]);
        });

        if (account !== `Investment Fund`) {
          transaction.transactionType = `Withdrawal`;
        } else {
          if (transaction.transactionType) return;
          transaction.transactionType = `Deposit`;
        }

        if (account === `Monthly Budget`) {
          transaction.addToReceipt({
            mainCategory: mainCategory,
            subCategory: subCategory,
            description: description,
            amount: Number(transactionCost),
            accountSelected: account,
            scheduledPayment: scheduledPayment,
          });
        }
        if (account === `Emergency Fund`) {
          transaction.addToReceipt({
            description: description,
            amount: Number(transactionCost),
            accountSelected: account,
          });
        }
        if (account === `Savings Fund`) {
          console.log(account);
          transaction.addToReceipt({
            timing: transactionTiming.firstChild.nextSibling.value,
            type: transactionType.firstChild.nextSibling.value,
            expenditure: item,
            description: description,
            amount: Number(transactionCost),
            accountSelected: account,
            scheduledPayment: scheduledPayment,
          });
        }
        if (account === `Expense Fund`) {
          transaction.addToReceipt({
            transactionType: transactionType.firstChild.nextSibling.value,
            timing: transactionTiming.firstChild.nextSibling.value,
            expenditure: item,
            description: description,
            amount: Number(transactionCost),
            accountSelected: account,
            scheduledPayment: scheduledPayment,
          });
        }
        if (account === `Surplus`) {
          transaction.addToReceipt({
            transactionType: transactionType.firstChild.nextSibling.value,
            timing: transactionTiming.firstChild.nextSibling.value,
            expenditure: item,
            description: description,
            amount: Number(transactionCost),
            accountSelected: account,
            scheduledPayment: scheduledPayment,
          });
        }
        if (account === `Debt`) {
          transaction.addToReceipt({
            timing: transactionTiming.firstChild.nextSibling.value,
            lender: lender,
            type: transactionType.firstChild.nextSibling.value,
            expenditure: item,
            description: description,
            amount: Number(transactionCost),
            accountSelected: account,
            scheduledPayment: scheduledPayment,
          });
        }
        if (account === `Investment Fund`) {
          transaction.addToReceipt({
            user: user,
            transactionType: transactionType.firstChild.nextSibling.value,
            transactionName: itemName,
            description: description,
            amount: Number(transactionCost),
            accountSelected: account,
          });
        }
        if (account === `Tithing`) {
          transaction.addToReceipt({
            user: user,
            accountSelected: account,
            amount: Number(transactionCost),
          });
        }

        console.log(transaction, transaction.receipt);
        let receiptTotal = transaction.receipt.reduce((total, receiptItem) => {
          return (total += receiptItem.amount);
        }, 0);
        fullTransactionCost.textContent = utility.money.format(receiptTotal);
      });
    }

    if (transactionSubmitButton) {
      transactionSubmitButton.addEventListener('click', (e) => {
        e.preventDefault();
        // * The update object being created as well as the needed calculations for the placeholder budget.
        let budgetId = window.location.href.split('/')[7];
        let updateObject = {
          budgetId: budgetId,
          userId: user._id,
        };
        placeholderBudget.transactions.recentTransactions.push(transaction);
        updateObject.transactions = placeholderBudget.transactions;
        console.log(updateObject);
        updateObject.transactions.recentTransactions[updateObject.transactions.recentTransactions.length - 1].receipt.forEach((receiptItem, i) => {
          console.log(receiptItem);

          /*
          
            * How this is handling the user's transaction receipts:

            @ 1. Monthly Budget
              @ A. Bi-Monthly OR Bi-Annual
                @ 1. The conditions and how to handle them.
                
              @ B. Bi-Monthly OR Bi-Annual
                @ 1. The conditions and how to handle them.
              
              @ C. NOT Bi-Monthly & NOT Bi-Annual
                @ 1. Weekly
                  @ A. The conditions and how to handle them.
                  
                @ 2. Bi-Weekly
                  @ A. The conditions and how to handle them.

                @ 3. Monthly
                  @ A. The conditions and how to handle them.
              
          */

          if (receiptItem.account === `Monthly Budget`) {
            let accountFilteredPlans = placeholderBudget.transactions.plannedTransactions.filter((plan) => {
              return plan.account === receiptItem.account;
            });

            let amountSaved = accountFilteredPlans.reduce((saved, plan) => {
              return (saved += plan.amountSaved);
            }, 0);

            if (receiptItem.scheduledPayment) {
              let selectedPlans = placeholderBudget.transactions.plannedTransactions.filter((plan) => {
                return plan.category === receiptItem.category && plan.subCategory === receiptItem.subCategory;
              });

              let payment = receiptItem.scheduledPayment;
              let selectedPlan = selectedPlans[0];
              let paymentCycle = selectedPlan.timingOptions.paymentCycle;
              console.log(amountSaved);
              let divisor = utility.divisors[paymentCycle];
              console.log(divisor);
              handleTransaction(paymentCycle, receiptItem, selectedPlan, amountSaved, placeholderBudget, utility, divisor);
              console.log(selectedPlan);
            }

            if (placeholderBudget.accounts.monthlyBudget.amount - utility.amountSaved - Number(receiptItem.amount) < 0) {
              return console.error(`Error:  You don't have enough money for this transaction!`);
            }

            placeholderBudget.accounts.monthlyBudget.amount -= Number(receiptItem.amount);

            placeholderBudget.mainCategories.forEach((category, i) => {
              if (receiptItem.category === category.title) {
                let index = i;
                category.subCategories.forEach((subCategory, i) => {
                  if (receiptItem.subCategory === subCategory.title) {
                    subCategory.amountSpent += receiptItem.amount;
                    subCategory.amountRemaining = subCategory.goalAmount - subCategory.amountSpent;
                    subCategory.percentageSpent = Number((subCategory.amountSpent / subCategory.goalAmount) * 100);
                  }
                });
              }
            });
            updateObject.mainCategories = placeholderBudget.mainCategories;
          }

          if (receiptItem.account === `Emergency Fund`) {
            if (placeholderBudget.accounts.emergencyFund.amount - Number(receiptItem.amount) < 0) {
              return console.error(`Error:  You don't have enough money for this transaction!`);
            }
            placeholderBudget.accounts.emergencyFund.amount -= Number(receiptItem.amount);
          }

          // * I AM DONE WITH THE EMERGENCY FUND ACCOUNT FOR THE ENTER TRANSACTION FORM.

          if (receiptItem.account === `Savings Fund`) {
            let accountFilteredPlans = placeholderBudget.transactions.plannedTransactions.filter((plan) => {
              return plan.account === receiptItem.account;
            });
            let amountSaved = accountFilteredPlans.reduce((saved, plan) => {
              return (saved += plan.amountSaved);
            }, 0);

            if (receiptItem.scheduledPayment) {
              let finalFilteredPlan = accountFilteredPlans.filter((plan) => {
                return plan.timingOptions.paymentCycle === receiptItem.timing && plan.name === receiptItem.expenditure && plan.subAccount === receiptItem.transactionType;
                // * With using the name of the plan, I will need to make sure that it can ONLY be a unique name.
              });
              console.log(finalFilteredPlan); // ~ Should be a singular plan.
              let payment = receiptItem.scheduledPayment;
              let selectedPlan = finalFilteredPlan[0];
              let paymentCycle = selectedPlan.timingOptions.paymentCycle;
              let divisor = utility.divisors[paymentCycle];
              handleTransaction(paymentCycle, receiptItem, selectedPlan, amountSaved, placeholderBudget, utility, divisor);
            }

            if (placeholderBudget.accounts.savingsFund.amount - utility.amountSaved - Number(receiptItem.amount) < 0) {
              return console.log(`Error:  You don't have enough money for this transaction!`);
            }
            placeholderBudget.accounts.savingsFund.amount = placeholderBudget.accounts.savingsFund.amount - Number(receiptItem.amount);

            // * This is where I need to check on the transaction plans to remove one from the payment schedule.
          }
          /*
          
          */
          if (receiptItem.account === `Expense Fund`) {
            let accountFilteredPlans = placeholderBudget.transactions.plannedTransactions.filter((plan) => {
              return plan.account === receiptItem.account;
            });
            let amountSaved = accountFilteredPlans.reduce((saved, plan) => {
              return (saved += plan.amountSaved);
            }, 0);

            if (receiptItem.scheduledPayment) {
              let finalFilteredPlan = accountFilteredPlans.filter((plan) => {
                return plan.timingOptions.paymentCycle === receiptItem.timing && plan.name === receiptItem.expenditure && plan.subAccount === receiptItem.transactionType;
                // * With using the name of the plan, I will need to make sure that it can ONLY be a unique name.
              });
              console.log(finalFilteredPlan); // ~ Should be a singular plan.
              // * Filter to single plan.
              let payment = receiptItem.scheduledPayment;
              let selectedPlan = finalFilteredPlan[0];
              let paymentCycle = selectedPlan.timingOptions.paymentCycle;
              let divisor = utility.divisors[paymentCycle];
              handleTransaction(paymentCycle, receiptItem, selectedPlan, amountSaved, placeholderBudget, utility, divisor);
            }

            if (placeholderBudget.accounts.expenseFund.amount - utility.amountSaved - Number(receiptItem.amount) < 0) {
              return console.log(`Error:  You don't have enough money for this transaction!`);
            }
            placeholderBudget.accounts.expenseFund.amount = placeholderBudget.accounts.expenseFund.amount - Number(receiptItem.amount);

            // * This is where I need to check on the transaction plans to remove one from the payment schedule.
          }
          if (receiptItem.account === `Surplus`) {
            let accountFilteredPlans = placeholderBudget.transactions.plannedTransactions.filter((plan) => {
              return plan.account === receiptItem.account;
            });
            let amountSaved = accountFilteredPlans.reduce((saved, plan) => {
              return (saved += plan.amountSaved);
            }, 0);

            if (receiptItem.scheduledPayment) {
              let finalFilteredPlan = accountFilteredPlans.filter((plan) => {
                return plan.timingOptions.paymentCycle === receiptItem.timing && plan.name === receiptItem.expenditure && plan.subAccount === receiptItem.transactionType;
                // * With using the name of the plan, I will need to make sure that it can ONLY be a unique name.
              });
              console.log(finalFilteredPlan); // ~ Should be a singular plan.
              // * Filter to single plan.
              let payment = receiptItem.scheduledPayment;
              let selectedPlan = finalFilteredPlan[0];
              let paymentCycle = selectedPlan.timingOptions.paymentCycle;
              let divisor = utility.divisors[paymentCycle];
              handleTransaction(paymentCycle, receiptItem, selectedPlan, amountSaved, placeholderBudget, utility, divisor);
            }

            if (placeholderBudget.accounts.surplus.amount - utility.amountSaved - Number(receiptItem.amount) < 0) {
              return console.log(`Error:  You don't have enough money for this transaction!`);
            }
            placeholderBudget.accounts.surlus.amount = placeholderBudget.accounts.surplus.amount - Number(receiptItem.amount);

            // * This is where I need to check on the transaction plans to remove one from the payment schedule.
          }
          if (receiptItem.account === `Debt`) {
            let accountFilteredPlans = placeholderBudget.transactions.plannedTransactions.filter((plan) => {
              return plan.account === receiptItem.account;
            });
            let amountSaved = accountFilteredPlans.reduce((saved, plan) => {
              return (saved += plan.amountSaved);
            }, 0);
            let selectedPlan;
            if (receiptItem.scheduledPayment) {
              let finalFilteredPlan = accountFilteredPlans.filter((plan) => {
                return (
                  plan.timingOptions.paymentCycle === receiptItem.timing && plan.name === receiptItem.expenditure && plan.subAccount === receiptItem.debtType && plan.lender === receiptItem.lender
                );
                // * With using the name of the plan, I will need to make sure that it can ONLY be a unique name.
              });
              console.log(finalFilteredPlan); // ~ Should be a singular plan.
              // * Filter to single plan.
              let payment = receiptItem.scheduledPayment;
              selectedPlan = finalFilteredPlan[0];
              let paymentCycle = selectedPlan.timingOptions.paymentCycle;
              let divisor = utility.divisors[paymentCycle];
              handleTransaction(paymentCycle, receiptItem, selectedPlan, amountSaved, placeholderBudget, utility, divisor);
            }
            if (placeholderBudget.accounts.debt.amount - utility.amountSaved - Number(receiptItem.amount) < 0) {
              return console.log(`Error:  You don't have enough money for this transaction!`);
            }
            if (placeholderBudget.accounts.debt.amount - Number(receiptItem.amount) < 0) {
              return console.log(`Error:  You don't have enough money for this transaction!`);
            }

            let debt;
            let divisor = utility.divisors[selectedPlan.timingOptions.paymentCycle];
            placeholderBudget.debts.forEach((debtCheck) => {
              if (debtCheck.lender === selectedPlan.lender && debtCheck.debtType === selectedPlan.subAccount && selectedPlan.amount / divisor === debtCheck.regularPayment) {
                debt = debtCheck;
              }
            });
            console.log(debt);
            debt.amountOwed -= receiptItem.amount;
          }
          if (receiptItem.account === `Investment Fund`) {
            if (!placeholderBudget.accounts.investmentFund.investedAmount) placeholderBudget.accounts.investmentFund.investedAmount = 0;
            placeholderBudget.accounts.investmentFund.amount = placeholderBudget.accounts.investmentFund.amount - Number(receiptItem.amount);
            placeholderBudget.accounts.investmentFund.investedAmount = placeholderBudget.accounts.investmentFund.investedAmount + Number(receiptItem.amount);
            if (placeholderBudget.accounts.investmentFund.amount < 0) {
              placeholderBudget.accounts.investmentFund.amount = budget.accounts.investmentFund.amount;
              placeholderBudget.accounts.investmentFund.investedAmount = budget.accounts.investmentFund.investedAmount;
              return console.log(`Error:  You don't have enough money for this transaction!`);
            }
            let investmentObject = {
              investmentType: receiptItem.transactionType,
              investmentName: receiptItem.transactionName,
              investmentDescription: receiptItem.description,
              initialInvestment: receiptItem.amount,
              currentValue: receiptItem.amount,
              settled: false,
              valueDifference: 0,
            };
            placeholderBudget.investments.push(investmentObject);
            updateObject.investments = placeholderBudget.investments;
          }

          if (receiptItem.account === `Tithing`) {
            placeholderBudget.accounts.tithing.amount = placeholderBudget.accounts.tithing.amount - Number(receiptItem.amount);
            if (placeholderBudget.accounts.tithing.amount < 0) {
              placeholderBudget.accounts.tithing.amount = budget.accounts.tithing.amount;
              return console.log(`Error:  You don't have enough money for this transaction!`);
            }
          }
          updateObject.accounts = placeholderBudget.accounts;
          placeholderBudget._updateBudget({ updateObject: updateObject }, `Dashboard`);
          const fullTransactionCost = document.querySelectorAll('.container--small__transaction-total__amount')[0];
          fullTransactionCost.textContent = utility.money.format(0);
        });
      });
    }
  }
};
