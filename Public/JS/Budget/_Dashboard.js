import * as Utility from './../Application/Utility';
import { myCalendar } from './../Classes/FrontEnd-Calendar';
import * as Transactions from './Budget-Sections/_Dashboard/_Enter-Transactions';
import * as Navigation from './Budget-Navigation';
import * as TransactionCalendar from './_Transaction-Calendar';
import { DateTime } from 'luxon';
import * as Income from './Budget-Sections/_Dashboard/_Enter-Income';

const cycleMainCategories = (direction, index, subCats, budget) => {
  const categoryIcon = document.querySelector('.main-category-display__category-display__icon');
  const categoryTitle = document.querySelector('.main-category-display__category-display__title');
  if (direction === `left`) {
    categoryIcon.classList.remove(categoryIcon.classList[2]);
    categoryIcon.classList.add(`${budget.mainCategories[index].icon}`);
    categoryTitle.textContent = budget.mainCategories[index].title;

    subCats.forEach((sc) => {
      sc.classList.add('closed');
      if (Number(sc.dataset.subcategory) === index) sc.classList.remove('closed');
      if (Number(sc.dataset.subcategory) === index) sc.classList.add('open');
    });
  }
  if (direction === `right`) {
    categoryIcon.classList.remove(categoryIcon.classList[2]);
    categoryIcon.classList.add(`${budget.mainCategories[index].icon}`);
    categoryTitle.textContent = budget.mainCategories[index].title;
    subCats.forEach((sc) => {
      sc.classList.add('closed');
      if (Number(sc.dataset.subcategory) === index) sc.classList.remove('closed');
      if (Number(sc.dataset.subcategory) === index) sc.classList.add('open');
    });
  }
};

const _setupCurrentMonth = (placeholderBudget, user, utility) => {
  let subCategories = document.querySelectorAll('.sub-category-display__sub-category');
  const leftButton = document.querySelector('.left');
  const rightButton = document.querySelector('.right');
  let currentMonth = myCalendar.getMonth();
  console.log(placeholderBudget);
  if (currentMonth !== placeholderBudget.currentMonth) {
    placeholderBudget.previousMonth = placeholderBudget.currentMonth;
    placeholderBudget.currentMonth = currentMonth;
    placeholderBudget.mainCategories.forEach((mc) => {
      mc.lastUpdated = new Date();
      mc.subCategories.forEach((sc) => {
        sc.lastUpdated = new Date();
        sc.amountSpent = 0;
        sc.amountRemaining = Number(sc.goalAmount - sc.amountSpent);
        sc.percentageSpent = Number(sc.amountSpent / sc.goalAmount);
        if (isNaN(sc.percentageSpent)) {
          sc.percentageSpent = 0;
        }
      });
    });
    let budgetId = window.location.href.split('/')[7];
    let updateObject = {
      budgetId: budgetId,
      userId: user._id,
      currentMonth: currentMonth,
      previousMonth: placeholderBudget.previousMonth,
      mainCategories: placeholderBudget.mainCategories,
    };
    placeholderBudget._updateBudget({ updateObject: updateObject }, `Dashboard`);
    Utility.reloadPage();
  }
  if (utility.screen.largeMobileLand[0].matches || utility.screen.largeMobilePort[0].matches || utility.screen.smallMobileLand[0].matches || utility.screen.smallMobilePort[0].matches) {
    if (window.location.href.split('/')[8] !== `Manage-Categories`) {
      subCategories.forEach((sc) => sc.remove());
      /////////////////////////////////////////
      // SELECT SUB CATEGORY DISPLAY
      const container = document.querySelector('.r__sub-category-display');

      placeholderBudget.mainCategories.forEach((mc, i) => {
        let secondaryIndex = i;
        mc.subCategories.forEach((sc, i) => {
          const subCategory = document.createElement('section');
          Utility.addClasses(subCategory, ['sub-category-display__sub-category', 'r__sub-category-display__sub-category', 'closed']);
          subCategory.dataset.subcategory = `${secondaryIndex}`;
          Utility.insertElement(`beforeend`, container, subCategory);

          const subCategoryHeader = document.createElement('header');
          Utility.addClasses(subCategoryHeader, ['sub-category-display__sub-category__header', 'r__sub-category-display__sub-category__header']);
          Utility.insertElement(`beforeend`, subCategory, subCategoryHeader);

          const subCategoryContent = document.createElement('section');
          Utility.addClasses(subCategoryContent, ['sub-category-display__sub-category__content', 'r__sub-category-display__sub-category__content']);
          Utility.insertElement(`beforeend`, subCategory, subCategoryContent);

          ///////////////////////////////////////////
          // CREATE SUB CATEGORY NAME
          const subCategoryName = document.createElement('p');
          Utility.addClasses(subCategoryName, ['sub-category-display__sub-category__header__category-name', 'r__sub-category-display__sub-category__header__category-name']);
          Utility.insertElement(`beforeend`, subCategoryHeader, subCategoryName);
          subCategoryName.textContent = sc.title;

          if (window.location.href.split('/')[8] === `Edit-Category-Goals`) {
            const subCategoryInput = document.createElement('input');
            Utility.addClasses(subCategoryInput, [
              'sub-category-display__sub-category__header__input',
              'r__sub-category-display__sub-category__header__input',
              'individual-payment',
              'r__individual-payment',
            ]);
            subCategoryInput.type = `number`;
            subCategoryInput.min = 0;
            subCategoryInput.step = '.01';
            subCategoryInput.placeholder = `Enter Monthly Goal Amount`;
            Utility.insertElement('beforeend', subCategoryHeader, subCategoryInput);

            subCategoryInput.addEventListener('keyup', (e) => {
              e.preventDefault();
              const budgetMonthTotals = document.querySelectorAll('.month-container__overall-budget-summary-container--single-summary__amount');
              const individualPayments = document.querySelectorAll('.individual-payment');
              let spent = subCategoryInput.closest('section').firstChild.nextSibling.firstChild;
              let remaining = subCategoryInput.closest('section').firstChild.nextSibling.firstChild.nextSibling;
              let percentageSpent = subCategoryInput.closest('section').firstChild.nextSibling.firstChild.nextSibling.nextSibling;
              let overallBudget = budgetMonthTotals[0];
              let overallSpent = budgetMonthTotals[1];
              let overallRemaining = budgetMonthTotals[2];
              let overallPercentageSpent = budgetMonthTotals[3];

              sc.goalAmount = Number(subCategoryInput.value);
              sc.amountRemaining = sc.goalAmount - sc.amountSpent;
              sc.percentageSpent = sc.amountSpent / sc.goalAmount;
              sc.percentageSpent === NaN ? (sc.percentageSpent = 0) : (sc.percentageSpent = sc.percentageSpent);

              spent.textContent = utility.money.format(sc.amountSpent);
              remaining.textContent = utility.money.format(sc.amountRemaining);
              percentageSpent.textContent = `${sc.percentageSpent.toFixed(2)}%`;

              let total = 0,
                totalSpent = 0;
              this.mainCategories.forEach((mc) => mc.subCategories.forEach((sc) => (total += sc.goalAmount)));
              this.mainCategories.forEach((mc) => mc.subCategories.forEach((sc) => (totalSpent += sc.amountSpent)));
              overallBudget.textContent = utility.money.format(total);
              overallSpent.textContent = utility.money.format(totalSpent);
              overallRemaining.textContent = utility.money.format(total - totalSpent);
              let totalPercentageSpent = totalSpent / total;
              totalPercentageSpent === NaN ? (totalPercentageSpent = 0) : (totalPercentageSpent = totalPercentageSpent);
              overallPercentageSpent.textContent = `${totalPercentageSpent.toFixed(2)}%`;
            });

            ////////////////////////////////////////
            // CREATE SUB CATEGORY TIMING BUTTON
            const subCategoryTimingButton = document.createElement('button');
            Utility.addClasses(subCategoryTimingButton, ['button--borderless-set-timing-button', 'r__button--borderless-set-timing-button']);
            subCategoryTimingButton.textContent = `+ Timing`;
            Utility.insertElement(`beforeend`, subCategoryHeader, subCategoryTimingButton);
          } else {
            const subCategoryContentInfo = document.createElement('p');
            Utility.addClasses(subCategoryContentInfo, ['sub-category-display__sub-category__header__info', 'r__sub-category-display__sub-category__header__info']);
            Utility.insertElement('beforeend', subCategoryHeader, subCategoryContentInfo);
            subCategoryContentInfo.textContent = utility.money.format(sc.goalAmount);
          }

          let numberOfInfo = 3;
          let startInfo = 0;
          let subCategoryInfo = [sc.amountSpent, sc.amountRemaining, sc.percentageSpent];
          while (startInfo < numberOfInfo) {
            const subCategoryContentInfo = document.createElement('p');
            Utility.addClasses(subCategoryContentInfo, ['sub-category-display__sub-category__content__info', 'r__sub-category-display__sub-category__content__info']);
            Utility.insertElement('beforeend', subCategoryContent, subCategoryContentInfo);
            if (startInfo !== 2) {
              subCategoryContentInfo.textContent = utility.money.format(subCategoryInfo[startInfo]);
            } else {
              subCategoryContentInfo.textContent = `${subCategoryInfo[startInfo].toFixed(2)}%`;
            }
            startInfo++;
          }
        });
      });
      subCategories = document.querySelectorAll('.r__sub-category-display__sub-category');
    }
  }
  let categoryIndex = 0;
  console.log(subCategories);
  subCategories.forEach((sc, i) => {
    sc.classList.add('closed');
    if (Number(sc.dataset.subcategory) === 0) sc.classList.remove('closed');
    if (Number(sc.dataset.subcategory) === 0) sc.classList.add('open');
  });
  if (leftButton) {
    Utility.addClasses(leftButton, [`left__end`]);
  }
  if (leftButton) {
    leftButton.addEventListener('click', (e) => {
      e.preventDefault();
      categoryIndex--;
      Utility.removeClasses(rightButton, [`right__end`]);
      if (categoryIndex <= 0) categoryIndex = 0;
      if (categoryIndex === 0) {
        Utility.addClasses(leftButton, [`left__end`]);
      }
      cycleMainCategories('left', categoryIndex, subCategories, placeholderBudget);
    });
  }
  if (rightButton) {
    rightButton.addEventListener('click', (e) => {
      e.preventDefault();
      categoryIndex++;
      Utility.removeClasses(leftButton, [`left__end`]);
      if (categoryIndex >= placeholderBudget.mainCategories.length - 1) categoryIndex = placeholderBudget.mainCategories.length - 1;
      if (categoryIndex === placeholderBudget.mainCategories.length - 1) {
        Utility.addClasses(rightButton, [`right__end`]);
      }
      cycleMainCategories('right', categoryIndex, subCategories, placeholderBudget);
    });
  }
};

const calculateTotal = async (accountType, budget, utility, user, debtAccount) => {
  const accountHeaders = document.querySelectorAll('.container--extra-small__header__text');
  const accountSections = document.querySelectorAll('.container--extra-small__content__account-total');
  const budgetAccounts = budget.accounts;
  let amountOfDebt = 0;
  let budgetAccountTotals = [];
  Object.entries(budgetAccounts).forEach((account, i) => {
    return budgetAccountTotals.push(account[1].amount);
  });
  Object.entries(budgetAccounts).forEach((account) => {
    if (account[0] === `debt`) {
      if (debtAccount) {
        debtAccount.forEach((debt, i) => {
          if (debt.status !== `Paid Off`) {
            amountOfDebt += debt.amountOwed;
          }
        });
      }
    }
    return amountOfDebt;
  });

  if (budget) {
    if (accountHeaders[0] || accountHeaders[1] || accountHeaders[2]) {
      if (accountHeaders[0]) {
        if (accountType === `Bank Account`) {
          const budgetDashboard = document.querySelector('.budget-dashboard');
          if (budgetDashboard) {
            accountHeaders[0].textContent = await Utility.getTranslation(user, accountType);
          }
          let initialDeposit = 0;
          const bankVaultTotal = budgetAccountTotals.reduce((previous, current) => previous + current, initialDeposit);
          const bankAccountSection = accountSections[0];
          let bankAccount = utility.money.format(bankVaultTotal);
          if (bankAccountSection) bankAccountSection.textContent = `${bankAccount}`;
        }
      }

      if (accountHeaders[1]) {
        if (accountType === `Debt`) {
          accountHeaders[1].textContent = await Utility.getTranslation(user, accountType);
          const debtAccount = accountSections[1];
          let debt = utility.money.format(amountOfDebt);

          if (debtAccount) {
            amountOfDebt === 0 ? (debtAccount.textContent = debt) : (debtAccount.textContent = `-${debt}`);
          }
        }
      }

      if (accountHeaders[2]) {
        if (accountType === `Net Value`) {
          accountHeaders[2].textContent = await Utility.getTranslation(user, accountType);
          let initialDeposit = 0;
          const bankVaultTotal = budgetAccountTotals.reduce((previous, current) => previous + current, initialDeposit);
          const netValueAccount = accountSections[2];
          let netValue = utility.money.format(bankVaultTotal - amountOfDebt);
          if (netValueAccount) netValueAccount.textContent = netValue;
        }
      }
    }
  }
};

const getDashboardAccountTotals = async (placeholderBudget, user, utility) => {
  await calculateTotal(`Bank Account`, placeholderBudget, utility, user);
  await calculateTotal(`Debt`, placeholderBudget, utility, user, placeholderBudget.debts);
  await calculateTotal(`Net Value`, placeholderBudget, utility, user, placeholderBudget.debts);
};

const createMonthlyBudgetTransactionPlans = (placeholderBudget, user) => {
  // * This function is for creating the planned transactions for the sub categories with payment schedules.
  const budgetId = window.location.href.split('/')[7];
  let updateObject = { budgetId: budgetId, userId: user._id };
  if (placeholderBudget) {
    placeholderBudget.mainCategories.forEach((mc, i) => {
      mc.subCategories.forEach((sc, i) => {
        if (sc.timingOptions.paymentSchedule) {
          let found = false;
          let paymentCycle = sc.timingOptions.paymentCycle;
          placeholderBudget.transactions.plannedTransactions.forEach((plan, i) => {
            if (plan.account === `Monthly Budget` && plan.subAccount === mc.title && plan.name === sc.title) {
              if (sc.goalAmount !== plan.amount) {
                plan.amount = sc.goalAmount;
              }
              found = true;
              // ? What if the user has edited the amounts assigned to the particular plan?
              // * Just doing the same because this is about creating the plans.  These plans will be updated when displaying or rendering them inside the calendar.
            }
          });
          if (found === false) {
            if (paymentCycle === `Bi-Monthly` || paymentCycle === `Bi-Annual`) {
              let transactionPlan = {};
              transactionPlan.date = sc.lastUpdated;
              transactionPlan.type = `Withdrawal`;
              transactionPlan.location = `Online`;
              transactionPlan.account = `Monthly Budget`;
              transactionPlan.subAccount = mc.title;
              transactionPlan.category = mc.title;
              transactionPlan.subCategory = sc.title;
              transactionPlan.name = sc.title;
              if (paymentCycle === `Bi-Monthly`) {
                transactionPlan.amount = sc.goalAmount / 2;
              }
              transactionPlan.need = `Need`;
              transactionPlan.timingOptions = {
                dueDates: sc.timingOptions.dueDates,
                paymentSchedule: sc.timingOptions.paymentSchedule,
                paymentCycle: paymentCycle,
              };
              transactionPlan.amountSaved = 0;
              transactionPlan.paid = false;
              transactionPlan.paidStatus = `Unpaid`;
              placeholderBudget.transactions.plannedTransactions.push(transactionPlan);
            }
            if (paymentCycle !== `Bi-Monthly` && paymentCycle !== `Bi-Annual`) {
              let transactionPlan = {};
              transactionPlan.date = sc.lastUpdated;
              transactionPlan.type = `Withdrawal`;
              transactionPlan.location = `Online`;
              transactionPlan.account = `Monthly Budget`;
              transactionPlan.subAccount = mc.title;
              transactionPlan.category = mc.title;
              transactionPlan.subCategory = sc.title;
              transactionPlan.name = sc.title;
              if (paymentCycle === `Weekly`) {
                transactionPlan.amount = sc.goalAmount / 4;
              } else if (paymentCycle === `Bi-Weekly`) {
                transactionPlan.amount = sc.goalAmount / 2;
              } else {
                transactionPlan.amount = sc.goalAmount;
              }
              transactionPlan.need = `Need`;
              transactionPlan.timingOptions = {
                dueDates: sc.timingOptions.dueDates,
                paymentSchedule: sc.timingOptions.paymentSchedule,
                paymentCycle: paymentCycle,
              };
              transactionPlan.amountSaved = 0;
              transactionPlan.paid = false;
              transactionPlan.paidStatus = `Unpaid`;
              placeholderBudget.transactions.plannedTransactions.push(transactionPlan);
            }
          }
        }
      });
    });
    updateObject.transactions = placeholderBudget.transactions;
    placeholderBudget._updateBudget({ updateObject: updateObject }, `Transaction-Planner`);
  }
};

export const setup = async (user, budget, placeholderBudget, utility) => {
  // THE LOGGED USER ABOVE SHOWED THAT THE DATE THE PASSWORD WAS CHANGED IS STILL SHOWING. THAT NEEDS TO BE CHANGED.
  ////////////////////////////////////////////
  // WATCH THE BUDGET NAVIGATION
  console.log(utility);
  Navigation._watchBudgetNavigation(user, budget, utility); // * DONE

  ////////////////////////////////////////////
  // CREATE TRANSACTION PLANS
  createMonthlyBudgetTransactionPlans(placeholderBudget, user); // * DONE

  ////////////////////////////////////////////
  // WATCH FOR ENTERED INCOME
  Income.watchForEnteredIncome(placeholderBudget, user, utility); // * DONE

  ////////////////////////////////////////////
  // WATCH FOR ACCOUNT SELECTION
  await Transactions._watchEnteringTransactions(budget, placeholderBudget, user, utility); // * DONE -- For Now.  Come back when debts and recent transactions are done to be sure it can be fully done.

  ////////////////////////////////////////////
  // GET BANK ACCOUNT TOTAL
  await getDashboardAccountTotals(placeholderBudget, user, utility); // * DONE

  ////////////////////////////////////////////
  // SETUP BILL CALENDAR
  TransactionCalendar._setupTransactionCalendar(placeholderBudget, user, utility); // * DONE -- For Now.  Come back when debts and recent transactions are done to be sure it can be fully done.
  ////////////////////////////////////////////
  // SETUP BILL CURRENT MONTH
  _setupCurrentMonth(placeholderBudget, user, utility); // * DONE
};
