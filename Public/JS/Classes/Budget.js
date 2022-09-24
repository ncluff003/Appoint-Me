import * as Budgets from '../Application/Create-Budget';
import * as Manage from '../Budget/Manage-Budget';
import * as Calendar from './FrontEnd-Calendar';
import * as Utility from './../Application/Utility';
import * as Tithing from './../Budget/Algorithms/_Tithing';
import * as Emergency from './../Budget/Algorithms/_Emergency-Fund';
import * as Timing from './../Budget/Algorithms/_Timing';
import { icons } from './../Budget-Creation/Category-Icons';
import { MainCategory } from './../Classes/Categories/Main-Category';
import { SubCategory } from './../Classes/Categories/Sub-Category';
import { get, getAll, set, timeTillExpires, remove, useNamespace } from './../Classes/Cache';
import axios from 'axios';
import { DateTime } from 'luxon';
// ../Budget/
import * as Dashboard from './../Budget/_Dashboard';
import * as Manager from './../Budget/_Budget-Management';
import * as Categories from './../Budget/_Manage-Categories';
import * as Editer from './../Budget/_Edit-Category-Goals';
import * as Income from './../Budget/_Income-Allocation';
import * as Planner from './../Budget/_Transaction-Planner';
import * as Investment from './../Budget/_Investment-Planner';
import * as Debt from './../Budget/_Debt-Manager';
import * as Recent from './../Budget/_Recent-Transactions';
import * as Accounts from './../Budget/_Account-Management';
import * as Invite from './../Budget/_Invite-Users';
class Account {
  constructor(options) {
    this.amount = options.amount;
  }
}
export class Budget {
  constructor() {
    this.name = '';
    this.accounts = {};
    this.mainCategories = [];
    this.transactions = {
      recentTransactions: [],
      plannedTransactions: [],
    };
    this.investments = [];
    this.debts = [];
  }

  async getBudget(id, user) {
    // * Right here, somehow I need to be able to retrieve the budget and use it in the watch function.  That way, things do not break just when they select the budget to enter into.  It works for the most part, but not entirely.
    try {
      const response = await axios({
        method: `POST`,
        url: `/App/Users/${user._id}/Budgets/${id}/Dashboard`,
      });

      if (response.statusText === `OK`) {
        let budget = response.data.budget;
        this.watch(user, budget);
        const response2 = await axios({
          method: `GET`,
          url: `/App/Users/${user._id}/Budgets/${id}/Dashboard`,
        });
        console.log(response2.statusText, response2.data, response2);
        document.open(`text/html`).write(response2.data);
        window.location.assign(`/App/Users/${user._id}/Budgets/${id}/Dashboard`);
      }
    } catch (error) {
      console.log(error);
    }
  }

  _addAccounts(profile) {
    this.accounts.unAllocated = new Account({ amount: 0 });
    this.accounts.monthlyBudget = new Account({ amount: 0 });
    this.accounts.emergencyFund = new Account({ amount: 0 });
    this.accounts.savingsFund = new Account({ amount: 0 });
    this.accounts.expenseFund = new Account({ amount: 0 });
    this.accounts.surplus = new Account({ amount: 0 });
    this.accounts.investmentFund = new Account({ amount: 0 });
    this.accounts.debt = new Account({ amount: 0, debtAmount: 0 });
    if (profile.latterDaySaint === true) this.accounts.tithing = { amount: 0 };
  }

  _accountTransfer(account1, account2, amount) {
    account1.amount -= Number(amount);
    account2.amount += Number(amount);
  }

  _addMainCategory(icon, title) {
    this.mainCategories.push(new MainCategory({ icon: icon, title: title }));
  }

  _removeMainCategory(index, category) {
    this.mainCategories = this.mainCategories.filter((mc, i) => mc !== this.mainCategories[index]);
    category.remove();
    console.log(`SUCCESSFUL DELETION`);
    return this.mainCategories;
  }

  _addSubCategory(index, title) {
    this.mainCategories[index].subCategories.push(new SubCategory({ title: title }));
  }

  _deleteSubCategory(mainIndex, subIndex) {
    this.mainCategories[mainIndex].subCategories = this.mainCategories[mainIndex].subCategories.filter((sc) => {
      return sc !== this.mainCategories[mainIndex].subCategories[subIndex];
    });
    console.log(`SUCCESSFUL DELETION`);
  }

  _makeSurplusSubCategory(options) {
    this.mainCategories[options.mainIndex].subCategories[options.subIndex].surplus = !this.mainCategories[options.mainIndex].subCategories[options.subIndex].surplus;
    if (!this.mainCategories[options.mainIndex].subCategories[options.subIndex].createdAt) {
      this.mainCategories[options.mainIndex].subCategories[options.subIndex].createdAt = DateTime.now().toISO();
    }
    this.mainCategories[options.mainIndex].subCategories[options.subIndex].lastUpdated = DateTime.now().toISO();
    this.mainCategories[options.mainIndex].subCategories[options.subIndex].updated = true;
    this.mainCategories[options.mainIndex].lastUpdated = DateTime.now().toISO();
  }

  _updateSubCategoryTiming(options) {
    this.mainCategories[options.index].subCategories[options.subCategoryIndex].timingOptions.paymentCycle = options.paymentCycle;
    this.mainCategories[options.index].subCategories[options.subCategoryIndex].timingOptions.paymentSchedule = options.paymentSchedule;
    this.mainCategories[options.index].subCategories[options.subCategoryIndex].timingOptions.dueDates =
      this.mainCategories[options.index].subCategories[options.subCategoryIndex].timingOptions.paymentSchedule[0];
  }

  _finalizeSubCategoryCreation(options) {
    let index = 0;
    this.mainCategories.forEach((mc, i) => {
      mc.subCategories.forEach((sc, i) => {
        if (Number(options.goals[index].value) === undefined || typeof Number(options.goals[index].value) !== `number`) options.goals[index].value = Number(0);
        sc.goalAmount = Number(options.goals[index].value);
        sc.amountSpent = 0;
        sc.amountRemaining = Number(sc.goalAmount - sc.amountSpent);
        sc.percentageSpent = Number(sc.amountSpent / sc.goalAmount);
        if (isNaN(sc.percentageSpent)) sc.percentageSpent = 0;
        index++;
      });
    });
  }

  updateEmergencyMeasurement(options) {
    this.accounts.emergencyFund.emergencyGoalMeasurement = options.setting;
  }

  updateEmergencyAccount(options) {
    if (this.accounts.emergencyFund.emergencyGoalMeasurement === `Length Of Time`) {
      this.accounts.emergencyFund.emergencyFundGoal = options.goal;
      this.accounts.emergencyFund.emergencyFundGoalTiming = options.goalTiming;
      if (isNaN(Number(options.goal))) {
        this.accounts.emergencyFund.emergencyFundGoal = 0;
      }
    }
    if (this.accounts.emergencyFund.emergencyGoalMeasurement === `Total Amount`) {
      this.accounts.emergencyFund.emergencyFundGoal = options.goal;
      if (isNaN(Number(options.goal))) {
        this.accounts.emergencyFund.emergencyFundGoal = 0;
      }
    }
    this.accounts.emergencyFund.amount = options.amount;
  }

  updateSavingsFund(options) {
    this.accounts.savingsFund.savingsPercentage = Number(options.percentage);
    this.accounts.savingsFund.savingsGoal = Number(options.goal);
    this.accounts.savingsFund.amount = Number(options.amount);
    if (isNaN(Number(options.percentage))) {
      this.accounts.savingsFund.savingsPercentage = 0;
    }
    if (isNaN(Number(options.goal))) {
      this.accounts.savingsFund.savingsGoal = 0;
    }
  }

  updateInvestmentFund(options) {
    this.accounts.investmentFund.investmentPercentage = Number(options.percentage);
    this.accounts.investmentFund.investmentGoal = Number(options.goal);
    this.accounts.investmentFund.amount = Number(options.amount);
    this.accounts.investmentFund.investedAmount = Number(options.investedAmount);
    if (isNaN(Number(options.investedAmount))) {
      options.investedAmount = 0;
    }
    if (isNaN(Number(options.investmentPercentage))) {
      options.investmentPercentage = 0;
    }
    if (isNaN(Number(options.investmentGoal))) {
      options.investmentGoal = 0;
    }
  }

  _updateBudget(options, pageLink) {
    Manage.updateMyBudget(options.updateObject, pageLink);
  }

  _setInvestmentGoal() {
    this.accounts.investmentFund.investmentPercentage = Number(document.querySelector('#investmentPercentGoal').value) / 100;
    this.accounts.investmentFund.investmentGoal = Number(document.querySelector('#investmentGoal').value);
  }

  create(budget, user) {
    budget.currentMonth = Calendar.myCalendar.getMonth();
    Budgets.createBudget(budget, user);
  }

  _buildPlaceHolderBudget(budget, user) {
    // * I will need to create a new instance of the budget here, and THEN add the accounts.
    if (budget) {
      const newBudget = new Budget();
      newBudget.startCreation(user);
      newBudget.name = budget.name;
      newBudget.accounts = budget.accounts;
      newBudget.mainCategories = budget.mainCategories;
      newBudget.transactions = budget.transactions;
      newBudget.investments = budget.investments;
      newBudget.debts = budget.debts;
      newBudget.coverPhoto = budget.coverPhoto;
      newBudget.currentMonth = budget.currentMonth;
      newBudget.lastUpdated = budget.lastUpdated;
      return newBudget;
    }
  }

  // ? How many methods above this question are needed the rest of the application?
  // * I will need to review other parts of the application later on to know this answer.

  renderSubCategory(container, category, secondaryIndex, utility) {
    /////////////////////////////////////////
    // SELECT SUB CATEGORY DISPLAY
    const subCategory = document.createElement('section');
    Utility.addClasses(subCategory, ['sub-category--month-view', 'r__sub-category--month-view', 'closed']);
    subCategory.dataset.category = `${secondaryIndex}`;
    Utility.insertElement(`beforeend`, container, subCategory);

    if (!utility.screen.largeMobileLand[0].matches && !utility.screen.largeMobilePort[0].matches && !utility.screen.smallMobileLand[0].matches && !utility.screen.smallMobilePort[0].matches) {
      const numberOfSections = 5;
      let sectionIndex = 0;
      const subCategories = document.querySelectorAll('.sub-category--month-view');

      while (sectionIndex < numberOfSections) {
        const subCategorySection = document.createElement('section');
        Utility.addClasses(subCategorySection, ['sub-category--month-view__section', 'r__sub-category--month-view__section']);
        Utility.insertElement('beforeend', subCategory, subCategorySection);

        ///////////////////////////////////////////
        // CREATE SUB CATEGORY NAME
        const subCategoryName = document.createElement('p');
        Utility.addClasses(subCategoryName, ['sub-category--month-view__section__category-name', 'r__sub-category--month-view__section__category-name']);

        //////////////////////////////////////////
        // CREATE SUB CATEGORY TIMING BUTTON
        const subCategoryTimingButton = document.createElement('button');
        Utility.addClasses(subCategoryTimingButton, ['button--borderless-set-timing-button', 'r__button--borderless-set-timing-button']);
        subCategoryTimingButton.textContent = `+ Timing`;

        const subCategories = document.querySelectorAll('.sub-category--month-view');
        //////////////////////////////////////////
        // CREATE SUB CATEGORY TIMING DISPLAY
        if (sectionIndex === 0) {
          Utility.insertElements(`beforeend`, subCategorySection, [subCategoryName, subCategoryTimingButton]);
          subCategoryName.textContent = category.title;
        }
        if (sectionIndex === 1) {
          const subCategoryInput = document.createElement('input');
          Utility.addClasses(subCategoryInput, ['sub-category--month-view__section__input', 'r__sub-category--month-view__section__input', 'individual-payment', 'r__individual-payment']);
          subCategoryInput.type = `number`;
          subCategoryInput.min = 0;
          Utility.insertElement('beforeend', subCategorySection, subCategoryInput);

          subCategoryInput.addEventListener('keyup', (e) => {
            e.preventDefault();
            const budgetMonthTotals = document.querySelectorAll('.month-container__overall-budget-summary-container--single-summary__amount');
            const individualPayments = document.querySelectorAll('.individual-payment');
            let spent = subCategoryInput.closest('section').nextSibling.firstChild;
            let remaining = subCategoryInput.closest('section').nextSibling.nextSibling.firstChild;
            let percentageSpent = subCategoryInput.closest('section').nextSibling.nextSibling.nextSibling.firstChild;
            let overallBudget = budgetMonthTotals[0];
            let overallSpent = budgetMonthTotals[1];
            let overallRemaining = budgetMonthTotals[2];
            let overallPercentageSpent = budgetMonthTotals[3];

            category.goalAmount = Number(subCategoryInput.value);
            category.amountRemaining = category.goalAmount - category.amountSpent;
            category.percentageSpent = category.amountSpent / category.goalAmount;
            category.percentageSpent === NaN ? (category.percentageSpent = 0) : (category.percentageSpent = category.percentageSpent);

            spent.textContent = utility.money.format(category.amountSpent);
            remaining.textContent = utility.money.format(category.amountRemaining);
            percentageSpent.textContent = `${category.percentageSpent.toFixed(2)}%`;

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
        }
        if (sectionIndex === 2) {
          const subCategoryContent = document.createElement('p');
          Utility.addClasses(subCategoryContent, ['sub-category--month-view__section__content', 'r__sub-category--month-view__section__content']);
          Utility.insertElement('beforeend', subCategorySection, subCategoryContent);
        }
        if (sectionIndex === 3) {
          const subCategoryContent = document.createElement('p');
          Utility.addClasses(subCategoryContent, ['sub-category--month-view__section__content', 'r__sub-category--month-view__section__content']);
          Utility.insertElement('beforeend', subCategorySection, subCategoryContent);
        }
        if (sectionIndex === 4) {
          const subCategoryContent = document.createElement('p');
          Utility.addClasses(subCategoryContent, ['sub-category--month-view__section__content', 'r__sub-category--month-view__section__content']);
          Utility.insertElement('beforeend', subCategorySection, subCategoryContent);
        }
        sectionIndex++;
      }
    }
    if (utility.screen.largeMobileLand[0].matches || utility.screen.largeMobilePort[0].matches || utility.screen.smallMobileLand[0].matches || utility.screen.smallMobilePort[0].matches) {
      console.log(`Hello From The Budget!`);
      // Utility.addClasses(subCategory, ['sub-category--month-view', 'r__sub-category--month-view', 'closed']);
      const subCategoryHeader = document.createElement('header');
      Utility.addClasses(subCategoryHeader, ['sub-category--month-view__header', 'r__sub-category--month-view__header']);
      Utility.insertElement(`beforeend`, subCategory, subCategoryHeader);

      const subCategoryContent = document.createElement('section');
      Utility.addClasses(subCategoryContent, ['sub-category--month-view__content', 'r__sub-category--month-view__content']);
      Utility.insertElement(`beforeend`, subCategory, subCategoryContent);

      ///////////////////////////////////////////
      // CREATE SUB CATEGORY NAME
      const subCategoryName = document.createElement('p');
      Utility.addClasses(subCategoryName, ['sub-category--month-view__header__category-name', 'r__sub-category--month-view__header__category-name']);
      Utility.insertElement(`beforeend`, subCategoryHeader, subCategoryName);
      subCategoryName.textContent = category.title;

      const subCategoryInput = document.createElement('input');
      Utility.addClasses(subCategoryInput, ['sub-category--month-view__header__input', 'r__sub-category--month-view__header__input', 'individual-payment', 'r__individual-payment']);
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

        category.goalAmount = Number(subCategoryInput.value);
        category.amountRemaining = category.goalAmount - category.amountSpent;
        category.percentageSpent = category.amountSpent / category.goalAmount;
        category.percentageSpent === NaN ? (category.percentageSpent = 0) : (category.percentageSpent = category.percentageSpent);

        spent.textContent = utility.money.format(category.amountSpent);
        remaining.textContent = utility.money.format(category.amountRemaining);
        percentageSpent.textContent = `${category.percentageSpent.toFixed(2)}%`;

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

      //////////////////////////////////////////
      // CREATE SUB CATEGORY TIMING BUTTON
      const subCategoryTimingButton = document.createElement('button');
      Utility.addClasses(subCategoryTimingButton, ['button--borderless-set-timing-button', 'r__button--borderless-set-timing-button']);
      subCategoryTimingButton.textContent = `+ Timing`;
      Utility.insertElement(`beforeend`, subCategoryHeader, subCategoryTimingButton);

      let numberOfInfo = 3;
      let startInfo = 0;
      while (startInfo < numberOfInfo) {
        const subCategoryContentInfo = document.createElement('p');
        Utility.addClasses(subCategoryContentInfo, ['sub-category--month-view__content__info', 'r__sub-category--month-view__content__info']);
        Utility.insertElement('beforeend', subCategoryContent, subCategoryContentInfo);
        startInfo++;
      }
    }
  }

  setupGoalSetting() {
    const transactionPlanDisplay = document.querySelector('.transaction-plan-display');
    if (transactionPlanDisplay) return;
    const leftButton = document.querySelector('.left');
    const rightButton = document.querySelector('.right');
    const mainCategoryIcon = document.querySelector('.main-category-display__category-display__icon');
    const mainCategoryTitle = document.querySelector('.main-category-display__category-display__title');
    if (mainCategoryIcon) {
      mainCategoryIcon.classList.add(this.mainCategories[0].icon);
    }
    if (mainCategoryTitle) {
      mainCategoryTitle.textContent = this.mainCategories[0].title;
    }
    const subCategoryDisplay = document.querySelector('.sub-category-display');
    const utility = get(`utility`);
    let index = 0;

    if (utility.screen.largeMobileLand[0].matches || utility.screen.largeMobilePort[0].matches || utility.screen.smallMobileLand[0].matches || utility.screen.smallMobilePort[0].matches) {
      const monthHeaderContainer = document.querySelector('.r__sub-category-display__headers');
      if (monthHeaderContainer) {
        [...monthHeaderContainer.childNodes].forEach((child) => child.remove());
        const monthHeaderTitle = document.createElement('h2');
        Utility.addClasses(monthHeaderTitle, [`r__sub-category-display__headers__title-container`]);
        monthHeaderTitle.textContent = `Sub Categories`;
        Utility.insertElement('beforeend', monthHeaderContainer, monthHeaderTitle);
      }
    }

    if (window.location.href.split('/')[8] !== `Debt-Manager`) {
      this.mainCategories.forEach((mc, i) => {
        /////////////////////////////////////////
        // INITIALIZE INDEX FOR DATASET
        let dataIndex = i;
        const monthContainer = document.querySelector('.month-container');
        if (monthContainer) {
          mc.subCategories.forEach((sc, i) => {
            // This is NOT part of the methods of the class, so I will ignore this for now.
            this.renderSubCategory(subCategoryDisplay, sc, dataIndex, utility);
          });
        }

        const subCategories = document.querySelectorAll('.sub-category--month-view');
        subCategories.forEach((sc, i) => {
          if (Number(sc.dataset.category) === 0) {
            Utility.replaceClassName(sc, `closed`, `open`);
          }
        });
        if (leftButton) {
          Utility.addClasses(leftButton, [`left__end`]);
        }
        if (rightButton) {
          if (this.mainCategories.length === 1) Utility.addClasses(rightButton, [`right__end`]);
        }
      });
      if (leftButton) {
        leftButton.addEventListener(`click`, (e) => {
          const subCategories = document.querySelectorAll('.sub-category--month-view');
          e.preventDefault();
          index--;
          if (index < 0) index = 0;
          if (index === 0) Utility.addClasses(leftButton, [`left__end`]);
          Utility.removeClasses(rightButton, [`right__end`]);
          Utility.replaceClassName(mainCategoryIcon, this.mainCategories[index + 1].icon, this.mainCategories[index].icon);
          mainCategoryTitle.textContent = this.mainCategories[index].title;
          subCategories.forEach((sc, i) => {
            if (Number(sc.dataset.category) === index) {
              Utility.replaceClassName(sc, `closed`, `open`);
            } else {
              Utility.replaceClassName(sc, `open`, `closed`);
            }
          });
        });
      }
      if (rightButton) {
        rightButton.addEventListener(`click`, (e) => {
          const subCategories = document.querySelectorAll('.sub-category--month-view');
          e.preventDefault();
          index++;
          if (index > this.mainCategories.length - 1) index = this.mainCategories.length - 1;
          if (index === this.mainCategories.length - 1) Utility.addClasses(rightButton, [`right__end`]);
          Utility.removeClasses(leftButton, [`left__end`]);
          Utility.replaceClassName(mainCategoryIcon, this.mainCategories[index - 1].icon, this.mainCategories[index].icon);
          mainCategoryTitle.textContent = this.mainCategories[index].title;
          subCategories.forEach((sc, i) => {
            if (Number(sc.dataset.category) === index) {
              Utility.replaceClassName(sc, `closed`, `open`);
            } else {
              Utility.replaceClassName(sc, `open`, `closed`);
            }
          });
        });
      }
    }

    let target;

    const subCategoryTimingButtons = document.querySelectorAll('.button--borderless-set-timing-button');
    console.log(utility);
    // * The problem with the permissions here is that I need to be able to allow those creating a new budget to edit the timings.
    if (utility.permissions.admin === true || utility.creatingBudget === true) {
      subCategoryTimingButtons.forEach((button) => {
        button.addEventListener(`click`, (e) => {
          e.preventDefault();
          Timing.openTimingContainer();
          target = button;
        });
      });
    } else {
      subCategoryTimingButtons.forEach((button) => (button.disabled = true));
    }

    const closeTimingContainerIcon = document.querySelector('.timing-container__closure-icon');
    if (closeTimingContainerIcon) {
      closeTimingContainerIcon.addEventListener(`click`, Timing.closeTimingContainer);
    }

    const timingButtons = document.querySelectorAll('.button--timing-button');
    const timingLabels = document.querySelectorAll('.timing-container__section__label');
    const timingSubmitButtons = document.querySelectorAll('.button--timing-button-submit');

    // Monthly Timing
    const monthlyTimingLabel = timingLabels[0];
    const monthlyTimingSubmit = timingSubmitButtons[0];

    // Bi-Monthly Timing
    const biMonthlyTimingLabelOne = timingLabels[1];
    const biMonthlyTimingLabelTwo = timingLabels[2];
    const biMonthlyTimingSubmit = timingSubmitButtons[1];
    // Bi-Weekly Timing
    const biWeeklyTimingLabel = timingLabels[3];
    const biWeeklyTimingSubmit = timingSubmitButtons[2];

    // Weekly Timing
    const weeklyTimingLabel = timingLabels[4];
    const weeklyTimingSubmit = timingSubmitButtons[3];

    const timingFunctionPages = [
      [monthlyTimingLabel, monthlyTimingSubmit],
      [biMonthlyTimingLabelOne, biMonthlyTimingLabelTwo, biMonthlyTimingSubmit],
      [biWeeklyTimingLabel, biWeeklyTimingSubmit],
      [weeklyTimingLabel, weeklyTimingSubmit],
    ];

    timingButtons.forEach((button, i) => {
      button.addEventListener(`click`, (e) => {
        e.preventDefault();
        timingFunctionPages.forEach((page) => page.forEach((pageItem) => Utility.replaceClassName(pageItem, `open`, `closed`)));
        timingFunctionPages[i].forEach((page) => Utility.replaceClassName(page, `closed`, `open`));
      });
    });

    timingSubmitButtons.forEach((button, i) => {
      button.addEventListener(`click`, (e) => {
        e.preventDefault();
        Timing.insertTiming(this, target, timingButtons[i]);
      });
    });
  }

  addSubCategory(container, index, value) {
    const subCategory = document.createElement('section');
    subCategory.classList.add('sub-category');
    subCategory.classList.add('r__sub-category');
    subCategory.dataset.category = `${index}`;
    const subCategoryTitleContainer = document.createElement('section');
    subCategoryTitleContainer.classList.add('sub-category-title-container');
    subCategoryTitleContainer.classList.add('r__sub-category-title-container');
    const subCategoryTitleElement = document.createElement('p');
    subCategoryTitleElement.classList.add('sub-category-title-container__title');
    subCategoryTitleElement.classList.add('r__sub-category-title-container__title');
    subCategoryTitleElement.textContent = value.split(' ').map(Utility._capitalize).join(' ');
    const subCategoryController = document.createElement('section');
    subCategoryController.classList.add('sub-category-controller');
    subCategoryController.classList.add('r__sub-category-controller');
    const subCategorySurplusContainer = document.createElement('section');
    subCategorySurplusContainer.classList.add('sub-category-controller__surplus-container');
    subCategorySurplusContainer.classList.add('r__sub-category-controller__surplus-container');
    const surplusContainerTitle = document.createElement('p');
    surplusContainerTitle.classList.add('sub-category-controller__surplus-container__title');
    surplusContainerTitle.classList.add('r__sub-category-controller__surplus-container__title');
    surplusContainerTitle.textContent = `Surplus?`;
    const surplusContainerSwitch = document.createElement('section');
    const surplusSwitchToggle = document.createElement('section');
    const surplusSwitchToggleIcon = document.createElement('i');

    container.classList.contains('budget-creation-container--main-categories')
      ? Utility.addClasses(surplusContainerSwitch, ['sub-category-controller__surplus-container__switch', 'r__sub-category-controller__surplus-container__switch'])
      : Utility.addClasses(surplusContainerSwitch, ['sub-category-controller__surplus-container__switch__alt', 'r__sub-category-controller__surplus-container__switch__alt']);

    container.classList.contains('budget-creation-container--main-categories')
      ? Utility.addClasses(surplusSwitchToggle, ['sub-category-controller__surplus-container__switch__toggle', 'r__sub-category-controller__surplus-container__switch__toggle'])
      : Utility.addClasses(surplusSwitchToggle, ['sub-category-controller__surplus-container__switch__alt__toggle', 'r__sub-category-controller__surplus-container__switch__alt__toggle']);

    container.classList.contains('budget-creation-container--main-categories')
      ? Utility.addClasses(surplusSwitchToggleIcon, [
          'fas',
          'fa-times',
          'sub-category-controller__surplus-container__switch__toggle__icon',
          'r__sub-category-controller__surplus-container__switch__toggle__icon',
        ])
      : Utility.addClasses(surplusSwitchToggleIcon, [
          'fas',
          'fa-times',
          'sub-category-controller__surplus-container__switch__alt__toggle__icon',
          'r__sub-category-controller__surplus-container__switch__alt__toggle__icon',
        ]);

    surplusContainerSwitch.addEventListener('click', (e) => {
      e.preventDefault();
      container.classList.contains('budget-creation-container--main-categories')
        ? surplusContainerSwitch.classList.toggle('sub-category-controller__surplus-container__switch--switched')
        : surplusContainerSwitch.classList.toggle('sub-category-controller__surplus-container__switch__alt--switched');

      Utility.toggledReplaceClassName(surplusSwitchToggleIcon, `fa-times`, `fa-check`);

      const subCategoriesArray = [...document.querySelectorAll('.sub-category')];
      const clicked = e.target;
      const subArray = subCategoriesArray.filter((sc, i) => {
        return Number(sc.dataset.category) === index;
      });
      const categoryNumber = Number(clicked.closest('.sub-category').dataset.category);
      const categoryTitle = subCategoryTitleElement.textContent;

      this._makeSurplusSubCategory({ mainIndex: categoryNumber, subIndex: subArray.indexOf(clicked.closest('.sub-category')) });
    });

    const surplusCategoryTrashIcon = document.createElement('i');
    Utility.addClasses(surplusCategoryTrashIcon, ['fas', 'fa-trash-alt', 'sub-category-controller__icon', 'r__sub-category-controller__icon']);

    surplusCategoryTrashIcon.addEventListener('click', (e) => {
      e.preventDefault();
      const clicked = e.target;
      const selectedSubCategory = clicked.closest('.sub-category');
      const subCategoriesArray = [...document.querySelectorAll('.sub-category')];
      let subArray = subCategoriesArray.filter((sc, i) => {
        return Number(sc.dataset.category) === index;
      });
      const categoryNumber = Number(clicked.closest('.sub-category').dataset.category);
      selectedSubCategory.remove();

      this._deleteSubCategory(categoryNumber, subArray.indexOf(selectedSubCategory));
    });

    surplusSwitchToggle.insertAdjacentElement('beforeend', surplusSwitchToggleIcon);

    surplusContainerSwitch.insertAdjacentElement('beforeend', surplusSwitchToggle);

    subCategorySurplusContainer.insertAdjacentElement('beforeend', surplusContainerTitle);
    subCategorySurplusContainer.insertAdjacentElement('beforeend', surplusContainerSwitch);

    subCategoryController.insertAdjacentElement('beforeend', subCategorySurplusContainer);
    subCategoryController.insertAdjacentElement('beforeend', surplusCategoryTrashIcon);

    subCategoryTitleContainer.insertAdjacentElement('beforeend', subCategoryTitleElement);

    subCategory.insertAdjacentElement('beforeend', subCategoryTitleContainer);
    subCategory.insertAdjacentElement('beforeend', subCategoryController);

    const subCategories = document.querySelectorAll('.sub-category');
    if (value === '') return;
    if (subCategories.length === 0 && value !== '' && value !== undefined) {
      Utility.insertElement(`afterbegin`, document.querySelector('.budget-creation-container--sub-categories__sub-category-display'), subCategory);
    }
    if (subCategories.length > 0) {
      Utility.insertElement(`afterend`, subCategories[subCategories.length - 1], subCategory);
    }
    if (!value) return;
    value = value
      .split(' ')
      .map((word) => Utility._capitalize(word))
      .join(' ');
    this._addSubCategory(index, `${value}`);
  }

  verifySubCategory(value) {
    let container;
    document.querySelector('.budget-creation-container--main-categories')
      ? (container = document.querySelector('.budget-creation-container--main-categories'))
      : (container = document.querySelectorAll('.container--medium__half')[0]);
    let mainCategoryTitle;
    container === document.querySelector('.budget-creation-container--main-categories')
      ? (mainCategoryTitle = document.querySelector('.budget-creation-container--sub-categories__main-category-display__category-information__text').textContent.toLowerCase())
      : (mainCategoryTitle = document.querySelector('.main-category-display__category-information__text').textContent.toLowerCase());
    let mainCategoryIndex;
    this.mainCategories.forEach((category, i) => {
      if (category.title.toLowerCase() === mainCategoryTitle) {
        mainCategoryIndex = i;
      }
    });

    const subCategoryTitle = document.querySelector('.form__input--sub-category-title').value;
    let filtered = this.mainCategories[mainCategoryIndex].subCategories.filter((sc) => sc.title.toLowerCase() === subCategoryTitle.toLowerCase());
    if (filtered.length >= 1) return;
    this.addSubCategory(container, mainCategoryIndex, value);
    this.mainCategories[mainCategoryIndex].lastUpdated = DateTime.now().toISO();
  }

  setupSubCategoryCreation(utility) {
    const leftButton = document.querySelector('.budget-creation-container--sub-categories__main-category-display__left-button__icon');
    const rightButton = document.querySelector('.budget-creation-container--sub-categories__main-category-display__right-button__icon');
    let mainCategoryIcon = document.querySelector('.budget-creation-container--sub-categories__main-category-display__category-information__icon');
    let mainCategoryText = document.querySelector('.budget-creation-container--sub-categories__main-category-display__category-information__text');
    const subCategoryCreationButton = document.querySelectorAll('.button--borderless')[2];
    const subCategoryCreationForm = document.querySelectorAll(`.form__section--sub-category-creation`)[0];
    const subCategoryInput = document.querySelector('.form__input--sub-category-title');
    const subCategoryCreateButton = document.querySelector('.button--small-create-sub-category');
    const subCategoryStopCreationButton = document.querySelector('.button--small-create-sub-category-close');
    let mainCategoryIndex = 0;

    const mediumHalfContainers = document.querySelectorAll('.container--medium__half');

    if (!mediumHalfContainers[1]) {
      mainCategoryIcon.classList.add(`${this.mainCategories[mainCategoryIndex].icon}`);
      mainCategoryText.textContent = this.mainCategories[mainCategoryIndex].title;
      leftButton.classList.add('budget-creation-container--sub-categories__main-category-display__left-button__icon__end');
      if (this.mainCategories.length === 1) {
        Utility.addClasses(rightButton, ['budget-creation-container--sub-categories__main-category-display__right-button__icon__end']);
      }

      leftButton.addEventListener(`click`, (e) => {
        e.preventDefault();
        rightButton.classList.remove('budget-creation-container--sub-categories__main-category-display__right-button__icon__end');
        mainCategoryIndex--;
        if (mainCategoryIndex < 0) mainCategoryIndex = 0;
        mainCategoryIcon.classList.remove(`${this.mainCategories[mainCategoryIndex + 1].icon}`);
        mainCategoryText.textContent = '';
        mainCategoryIcon.classList.add(`${this.mainCategories[mainCategoryIndex].icon}`);
        mainCategoryText.textContent = this.mainCategories[mainCategoryIndex].title;
        if (mainCategoryIndex === 0) leftButton.classList.add('budget-creation-container--sub-categories__main-category-display__left-button__icon__end');

        const subCategories = document.querySelectorAll('.sub-category');
        subCategories.forEach((sc, i) => {
          Utility.replaceClassName(sc, `open`, `closed`);
          if (sc.dataset.category === `${mainCategoryIndex}`) {
            Utility.replaceClassName(sc, `closed`, `open`);
          }
        });
      });
      rightButton.addEventListener(`click`, (e) => {
        e.preventDefault();
        leftButton.classList.remove('budget-creation-container--sub-categories__main-category-display__left-button__icon__end');
        mainCategoryIndex++;
        if (mainCategoryIndex > this.mainCategories.length - 1) mainCategoryIndex = this.mainCategories.length - 1;
        mainCategoryIcon.classList.remove(`${this.mainCategories[mainCategoryIndex - 1].icon}`);
        mainCategoryText.textContent = '';
        mainCategoryIcon.classList.add(`${this.mainCategories[mainCategoryIndex].icon}`);
        mainCategoryText.textContent = this.mainCategories[mainCategoryIndex].title;
        if (mainCategoryIndex === this.mainCategories.length - 1) rightButton.classList.add('budget-creation-container--sub-categories__main-category-display__right-button__icon__end');

        const subCategories = document.querySelectorAll('.sub-category');
        subCategories.forEach((sc, i) => {
          Utility.replaceClassName(sc, `open`, `closed`);
          if (sc.dataset.category === `${mainCategoryIndex}`) {
            Utility.replaceClassName(sc, `closed`, `open`);
          }
        });
      });
    }

    if (utility.creatingBudget === true || (utility.permissions && utility.permissions.admin === true)) {
      subCategoryCreationButton.addEventListener(`click`, (e) => {
        e.preventDefault();
        Utility.replaceClassName(subCategoryCreationButton, `open`, `closed`);
        Utility.replaceClassName(subCategoryCreationForm, `closed`, `open`);
        subCategoryInput.value = '';
        subCategoryInput.focus();
      });
    }

    if (utility.permissions && utility.permissions.admin === false) {
      Utility.replaceClassName(subCategoryCreationButton, `open`, `closed`);
    }
    if (utility.creatingBudget === true) {
      Utility.replaceClassName(subCategoryCreationButton, `closed`, `open`);
    }

    subCategoryCreateButton.addEventListener(`click`, (e) => {
      this.verifySubCategory(subCategoryInput.value);
      subCategoryInput.value = '';
      subCategoryInput.focus();
    });

    subCategoryStopCreationButton.addEventListener(`click`, (e) => {
      e.preventDefault();
      Utility.replaceClassName(subCategoryCreationButton, `closed`, `open`);
      Utility.replaceClassName(subCategoryCreationForm, `open`, `closed`);
    });
  }

  stopAddingMainCategories() {
    const setupMainCategoryCreationButton = document.querySelector('.button--medium-square');
    const iconContainer = document.querySelector('.icons-container');
    const mainCategoryTitleCreationContainer = document.querySelector('.form__section--main-category-title');
    const smallMainCategoryCreationButtons = document.querySelectorAll('.button--small-create-main-category');
    const mainCategories = document.querySelectorAll('.main-category__alt');
    console.log(`Stopping creation of main categories`);
    if (!mainCategories[0]) {
      [setupMainCategoryCreationButton, iconContainer, mainCategoryTitleCreationContainer, ...smallMainCategoryCreationButtons].forEach((item, i) =>
        Utility.toggledReplaceClassName(item, `closed`, `open`)
      );
    } else {
      [setupMainCategoryCreationButton, iconContainer, mainCategoryTitleCreationContainer, ...smallMainCategoryCreationButtons, , ...mainCategories].forEach((item, i) =>
        Utility.toggledReplaceClassName(item, `closed`, `open`)
      );
    }
  }

  renderMainCategory(container, mainCategoryTitle, icon) {
    const mainCategory = document.createElement('section');
    const mainCategoryDeleteButton = document.querySelector('.button--medium-main-category-deletion');
    if (mainCategoryDeleteButton) {
      const mainCategories = document.querySelectorAll('.main-category__alt');
      Utility.addClasses(mainCategory, [`main-category__alt`, `r__main-category__alt`, `closed`]);
      mainCategory.dataset.category = mainCategories.length;
    } else {
      Utility.addClasses(mainCategory, [`main-category`]);
    }
    const iconImage = document.createElement('i');
    iconImage.classList.add('fas');
    iconImage.classList.add(`${icon}`);
    iconImage.classList.add('main-category__icon');
    const iconsText = document.createElement('p');
    iconsText.classList.add('main-category__text');
    const deleteButton = document.createElement('button');
    const deleteIcon = document.createElement('i');
    deleteIcon.classList.add('fas');
    deleteIcon.classList.add('fa-times');
    deleteButton.classList.add('main-category__delete');
    Utility.insertElement(`beforeend`, deleteButton, deleteIcon);
    let title = mainCategoryTitle
      .split(' ')
      .map((titleSection) => Utility._capitalize(titleSection))
      .join(' ');
    iconsText.textContent = title;
    Utility.insertElement(`beforeend`, mainCategory, iconImage);
    Utility.insertElement(`beforeend`, mainCategory, iconsText);
    if (container === document.querySelector('.budget-creation-container--main-categories')) {
      Utility.insertElement(`beforeend`, mainCategory, deleteButton);
    }
    Utility.insertElement(`beforeend`, container, mainCategory);
    [...document.querySelectorAll('.main-category')].length >= 3 ? Utility.addClasses(document.querySelectorAll('.main-category')[2], [`top-right-category`]) : null;
    if (deleteButton) {
      deleteButton.addEventListener('click', async (e) => {
        e.preventDefault();
        const category = e.target.closest('.main-category');
        const categoryTitle = category.firstChild.nextSibling.textContent;
        const selectedCategory = this.mainCategories.filter((mc) => mc.title === categoryTitle)[0];
        selectedCategory._delete(this, category);
      });
    }
  }

  addMainCategory(object, index, mainCategories) {
    const titleInput = document.querySelector('.form__input--main-category-title');
    let icon = object.mostRecent.firstChild.classList[1];
    let filtered = this.mainCategories.filter((mc) => mc.title.toLowerCase() === titleInput.value.toLowerCase());
    if (filtered.length >= 1) return;
    let container;
    document.querySelector('.budget-creation-container--main-categories')
      ? (container = document.querySelector('.budget-creation-container--main-categories'))
      : (container = document.querySelectorAll('.container--medium__half')[0]);
    let title = titleInput.value
      .split(' ')
      .map((titleSection) => Utility._capitalize(titleSection))
      .join(' ');
    this._addMainCategory(icon, title);
    this.renderMainCategory(container, titleInput.value, icon);
    object.mostRecent.classList.remove('icon-container--clicked');
    titleInput.value = '';
    this.stopAddingMainCategories();
    mainCategories = document.querySelectorAll('.main-category__alt');
    if (mainCategories[0]) {
      mainCategories.forEach((category, i) => {
        if (i >= mainCategories.length - 1) {
          category.addEventListener(`click`, (e) => {
            index = i;

            mainCategories.forEach((category) => {
              Utility.removeClasses(category, [`.main-category__alt__selected`]);
            });
            const leftButton = document.querySelector('.main-category-display__left-button__icon');
            const rightButton = document.querySelector('.main-category-display__right-button__icon');
            if (index === 0) {
              Utility.addClasses(leftButton, [`main-category-display__left-button__icon__end`]);
              Utility.removeClasses(rightButton, [`main-category-display__right-button__icon__end`]);
            } else if (index === this.mainCategories.length - 1) {
              Utility.removeClasses(leftButton, [`main-category-display__left-button__icon__end`]);
              Utility.addClasses(rightButton, [`main-category-display__right-button__icon__end`]);
            } else {
              Utility.removeClasses(leftButton, [`main-category-display__left-button__icon__end`]);
              Utility.removeClasses(rightButton, [`main-category-display__right-button__icon__end`]);
            }
            this.selectCategory(index);
          });
        }
      });
    }
  }

  startAddingMainCategories() {
    const setupMainCategoryCreationButton = document.querySelector('.button--medium-square');
    const iconContainer = document.querySelector('.icons-container');
    const mainCategoryTitleCreationContainer = document.querySelector('.form__section--main-category-title');
    const smallMainCategoryCreationButtons = document.querySelectorAll('.button--small-create-main-category');
    const mainCategories = document.querySelectorAll('.main-category__alt');
    console.log(`Starting to create main categories`);
    if (!mainCategories[0]) {
      [setupMainCategoryCreationButton, iconContainer, mainCategoryTitleCreationContainer, ...smallMainCategoryCreationButtons].forEach((item, i) =>
        Utility.toggledReplaceClassName(item, `closed`, `open`)
      );
    } else {
      [setupMainCategoryCreationButton, iconContainer, mainCategoryTitleCreationContainer, ...smallMainCategoryCreationButtons, , ...mainCategories].forEach((item, i) =>
        Utility.toggledReplaceClassName(item, `closed`, `open`)
      );
    }
  }

  selectIcon(clicked, object) {
    if (object.mostRecent) {
      object.mostRecent.classList.remove('icon-container--clicked');
    }
    let title = clicked.firstChild.nextSibling.textContent;
    object[title].classList.add('icon-container--clicked');
    object.mostRecent = object[title];
  }

  addIcons(utility) {
    const iconsContainer = document.querySelector('.icons-container');
    icons.forEach((iconImage, i) => {
      const iconContainer = document.createElement(`section`);
      Utility.addClasses(iconContainer, [`icon-container`]);
      iconContainer.style.height = `max-content`;
      iconContainer.style.width = `${100 / 5}%`;
      if (utility.screen.largeMobileLand[0].matches || utility.screen.largeMobilePort[0].matches) {
        iconContainer.style.width = `${100 / 4}%`;
      }
      if (utility.screen.smallMobileLand[0].matches || utility.screen.smallMobilePort[0].matches) {
        iconContainer.style.width = `${100 / 3}%`;
      }

      const icon = document.createElement('i');
      icon.classList.add('fas');
      icon.classList.add(`fa-${iconImage}`);
      icon.classList.add(`icon-container__icon`);
      Utility.insertElement(`beforeend`, iconContainer, icon);

      const text = document.createElement('p');
      text.classList.add('icon-container__text');
      text.textContent = icons[i].split('-').join(' ');

      Utility.insertElement(`beforeend`, iconContainer, text);

      Utility.insertElement(`beforeend`, iconsContainer, iconContainer);
    });
  }

  resetPageNumber(number) {
    return (number = 0);
  }

  previousPage(display, pages, number) {
    // * I could end up implementing this at some point.  The continue button would need to be changed to next, while there would be a 'previous' button to  trigger this function.
    number--;
    display.textContent = display.textContent = `Page ${number + 1} / ${pages.length}`;
    return number;
  }

  nextPage(display, pages, number) {
    display.textContent = display.textContent = `Page ${number + 1} / ${pages.length}`;
    Utility.replaceClassName(pages[number - 1], `open`, `closed`);
    Utility.replaceClassName(pages[number], `closed`, `open`);
    return number;
  }

  update(number, profile, utility) {
    let page = number + 1;
    if (page === 1) {
      const budgetName = document.getElementById('budgetName');
      this.name = budgetName.value;
    }
    if (page === 2) {
      if (profile.latterDaySaint === false) {
        this.setupSubCategoryCreation(utility);
      }
      if (profile.latterDaySaint === true) {
        const tithingCheckboxLabels = document.querySelectorAll('.form__label--tithing');
        tithingCheckboxLabels.forEach((label) => (label.classList.contains('checked') ? (this.accounts.tithing.tithingSetting = label.textContent) : null));
      }
    }
    if (page === 3) {
      if (profile.latterDaySaint === false) {
        this.setupGoalSetting(utility);
      }
      if (profile.latterDaySaint === true) {
        this.setupSubCategoryCreation(utility);
      }
    }
    if (page === 4) {
      if (profile.latterDaySaint === false) {
      }
      if (profile.latterDaySaint === true) {
        this.setupGoalSetting(utility);
      }
    }
    if (page === 5) {
      if (profile.latterDaySaint === false) {
        const emergencySelect = document.querySelectorAll('.form__select')[0];
        const emergencyTotalInputs = document.querySelectorAll('.form__input--small');
        if (this.accounts.emergencyFund.emergencyGoalMeasurement === `Length Of Time`) {
          this.updateEmergencyAccount({ goal: Number(emergencyTotalInputs[2]), goalTiming: emergencySelect.value, amount: 0 });
        } else {
          this.updateEmergencyAccount({ goal: Number(emergencyTotalInputs[1]), amount: 0 });
        }
      }
      if (profile.latterDaySaint === true) {
      }
    }
    if (page === 6) {
      if (profile.latterDaySaint === false) {
        this.updateSavingsFund({
          percentage: Number(document.querySelector('#savingsPercentGoal').value) / 100,
          goal: Number(document.querySelector('#savingsGoal').value),
          amount: 0,
        });
      }
      if (profile.latterDaySaint === true) {
        const emergencySelect = document.querySelectorAll('.form__select')[0];
        const emergencyTotalInputs = document.querySelectorAll('.form__input--small');
        if (this.accounts.emergencyFund.emergencyGoalMeasurement === `Length Of Time`) {
          this.updateEmergencyAccount({ goal: Number(emergencyTotalInputs[2]), goalTiming: emergencySelect.value, amount: 0 });
        } else {
          this.updateEmergencyAccount({ goal: Number(emergencyTotalInputs[1]), amount: 0 });
        }
      }
    }
    if (page === 7) {
      if (profile.latterDaySaint === false) {
        utility.creatingBudget = undefined;
        this.updateInvestmentFund({
          percentage: Number(document.querySelector('#investmentPercentGoal').value) / 100,
          goal: Number(document.querySelector('#investmentGoal').value),
          amount: 0,
          investedAmount: 0,
        });
        this.create(this, profile);
      }
      if (profile.latterDaySaint === true) {
        this.updateSavingsFund({
          percentage: Number(document.querySelector('#savingsPercentGoal').value) / 100,
          goal: Number(document.querySelector('#savingsGoal').value),
          amount: 0,
        });
      }
    }
    if (page === 8) {
      if (profile.latterDaySaint === false) {
      }
      if (profile.latterDaySaint === true) {
        utility.creatingBudget = undefined;
        this.updateInvestmentFund({
          percentage: Number(document.querySelector('#investmentPercentGoal').value) / 100,
          goal: Number(document.querySelector('#investmentGoal').value),
          amount: 0,
          investedAmount: 0,
        });
        this.create(this, profile);
      }
    }
  }

  selectCategory(categoryIndex) {
    if (categoryIndex === this.mainCategories.length) categoryIndex = this.mainCategories.length - 1;
    const mainCategoryIcon = document.querySelector('.main-category-display__category-information__icon');
    const mainCategoryTitle = document.querySelector('.main-category-display__category-information__text');
    if (mainCategoryIcon.classList[3]) Utility.removeClasses(mainCategoryIcon, [mainCategoryIcon.classList[3]]);
    Utility.addClasses(mainCategoryIcon, [this.mainCategories[categoryIndex].icon]);
    mainCategoryTitle.textContent = this.mainCategories[categoryIndex].title;
    const subCategories = document.querySelectorAll('.sub-category');
    subCategories.forEach((category, i) => {
      Utility.replaceClassName(category, `open`, `closed`);
      if (Number(category.dataset.category) === categoryIndex) {
        Utility.replaceClassName(category, `closed`, `open`);
      }
    });
    let mainCategories = document.querySelectorAll('.main-category__alt');
    mainCategories.forEach((category) => Utility.removeClasses(category, [`main-category__alt__selected`]));
    Utility.addClasses(mainCategories[categoryIndex], [`main-category__alt__selected`]);
  }

  setupCreation(profile, creationContainer, pageDisplay, pages, pageNumber, utility) {
    if (utility) {
      utility.creatingBudget = true;
    }
    let budgetCreationForm = document.querySelectorAll('.form--full-width')[4];
    if (budgetCreationForm) {
      Utility.replaceClassName(creationContainer, `closed`, `open`);
      Utility.replaceClassName(budgetCreationForm, `closed`, `open`);
      let formPages = document.querySelectorAll('.form__page--centered');
      Utility.replaceClassName(formPages[0], `closed`, `open`);
      profile.latterDaySaint === true ? (pageDisplay.textContent = `Page ${pageNumber + 1} / ${pages.length}`) : (pageDisplay.textContent = `Page ${pageNumber + 1}  / ${pages.length}`);
    }

    let mainCategories = document.querySelectorAll('.main-category__alt');
    const mainCategoryDeleteButton = document.querySelector('.button--medium-main-category-deletion');
    let index = 0;
    if (mainCategories[0] || mainCategoryDeleteButton) {
      this.selectCategory(index, mainCategories);
      const leftButton = document.querySelector('.main-category-display__left-button__icon');
      const rightButton = document.querySelector('.main-category-display__right-button__icon');
      Utility.addClasses(leftButton, [`main-category-display__left-button__icon__end`]);

      leftButton.addEventListener(`click`, (e) => {
        e.preventDefault();
        Utility.removeClasses(rightButton, [`main-category-display__right-button__icon__end`]);
        index--;
        if (index < 0) index = 0;
        if (index === 0) {
          Utility.addClasses(leftButton, [`main-category-display__left-button__icon__end`]);
        }
        this.selectCategory(index, mainCategories);
      });
      rightButton.addEventListener(`click`, (e) => {
        e.preventDefault();
        Utility.removeClasses(leftButton, [`main-category-display__left-button__icon__end`]);
        index++;
        if (index > this.mainCategories.length - 1) index = this.mainCategories.length - 1;
        if (index === this.mainCategories.length - 1) {
          Utility.addClasses(rightButton, [`main-category-display__right-button__icon__end`]);
        }
        this.selectCategory(index, mainCategories);
      });

      mainCategories.forEach((category, i) => {
        category.addEventListener(`click`, (e) => {
          e.preventDefault();
          index = i;
          if (index === 0) {
            Utility.addClasses(leftButton, [`main-category-display__left-button__icon__end`]);
            Utility.removeClasses(rightButton, [`main-category-display__right-button__icon__end`]);
          } else if (index === this.mainCategories.length - 1) {
            Utility.removeClasses(leftButton, [`main-category-display__left-button__icon__end`]);
            Utility.addClasses(rightButton, [`main-category-display__right-button__icon__end`]);
          } else {
            Utility.removeClasses(leftButton, [`main-category-display__left-button__icon__end`]);
            Utility.removeClasses(rightButton, [`main-category-display__right-button__icon__end`]);
          }
          this.selectCategory(index, mainCategories);
        });
      });
    }

    this.addIcons(utility);
    let iconObject = {};
    let containers = document.querySelectorAll('.icon-container');
    containers.forEach((container, i) => (iconObject[container.firstChild.nextSibling.textContent] = container));
    containers.forEach((container) =>
      container.addEventListener(`click`, (e) => {
        e.preventDefault();
        let clicked = e.target.closest('.icon-container');
        this.selectIcon(clicked, iconObject);
      })
    );
    const setupMainCategoryCreationButton = document.querySelector('.button--medium-square');
    const closeCategoryCreation = document.querySelectorAll('.button--small-create-main-category')[1];
    if ((utility.permissions && utility.permissions.admin === true) || (utility.permissions && utility.permissions.associated === true)) utility.creatingBudget = false;
    console.log(utility.creatingBudget, utility.permissions);
    if (utility.creatingBudget === true || utility.permissions.admin === true) {
      setupMainCategoryCreationButton.addEventListener('click', this.startAddingMainCategories);
    }
    if (utility.permissions && utility.permissions.admin === false) {
      Utility.replaceClassName(setupMainCategoryCreationButton, `open`, `closed`);
    }
    if (utility.creatingBudget === true) {
      Utility.replaceClassName(setupMainCategoryCreationButton, `closed`, `open`);
    }

    const createMainCategoryButton = document.querySelectorAll('.button--small-create-main-category')[0];
    createMainCategoryButton.addEventListener(`click`, (e) => {
      e.preventDefault();
      mainCategoryDeleteButton ? this.addMainCategory(iconObject) : this.addMainCategory(iconObject, index, mainCategories);
    });

    closeCategoryCreation.addEventListener(`click`, this.stopAddingMainCategories);
  }

  startCreation(profile) {
    this._addAccounts(profile);
    return this;
  }

  watchCreation(profile, utility) {
    const createButton = document.querySelector('.budget-card-container__card--create');
    const closeCreationContainer = document.querySelector('.form-closure-icon--budget-creation');
    let budgetCreationContainer = document.querySelector('.form-container--full-width');
    let formPages = document.querySelectorAll('.form__page--centered');
    const pageNumberDisplay = document.querySelector('.form__section--page-number-display__number');
    let continueButton = document.querySelectorAll('.button--small')[0];
    let pageNumber = 0;
    if (profile.latterDaySaint === true) {
      Tithing.watch();
    }
    Emergency.watchSetting(this);
    if (createButton) {
      createButton.addEventListener(`click`, (e) => {
        e.preventDefault();
        this.startCreation(profile);
        this.setupCreation(profile, budgetCreationContainer, pageNumberDisplay, formPages, pageNumber, utility);
      });
    }
    if (continueButton) {
      continueButton.addEventListener(`click`, (e) => {
        e.preventDefault();
        this.update(pageNumber, profile, utility);
        pageNumber++;
        this.nextPage(pageNumberDisplay, formPages, pageNumber);
      });
    }
    if (closeCreationContainer) {
      closeCreationContainer.addEventListener('click', (e) => {
        e.preventDefault();
        Utility.replaceClassName(budgetCreationContainer, `open`, `closed`);
        let formPages = document.querySelectorAll('.form__page--centered');
        formPages.forEach((page) => Utility.replaceClassName(page, `open`, `closed`));
        pageNumber = this.resetPageNumber(pageNumber);
        removeEventListener(`click`, this.startAddingMainCategories);
        removeEventListener(`click`, this.stopAddingMainCategories);
      });
    }
  }

  watchSelection(user) {
    const budgetCards = document.querySelectorAll('.budget-card-container__card');
    let budget;
    console.log(user);
    budgetCards.forEach((bc, i) => {
      const cardContent = document.querySelectorAll(`.budget-card-container__card__content`);
      const userPermissionContainer = document.createElement(`div`);
      console.log(cardContent[i]);
      Utility.addClasses(userPermissionContainer, [`budget-card-container__card__content__permissions`, `r__budget-card-container__card__content__permissions`]);
      Utility.insertElement(`beforeend`, cardContent[i], userPermissionContainer);

      if (user.budgets[i].budgetAdmins.includes(user._id)) {
        console.log(`It is there!`);
        userPermissionContainer.textContent = `Admin`;
      } else {
        console.log(`It is not there!`);
      }
      if (user.budgets[i].associatedUsers.includes(user._id)) {
        console.log(`It is there!`);
        if (userPermissionContainer.textContent === `Admin`) {
          userPermissionContainer.textContent = `${userPermissionContainer.textContent} | Associate`;
        } else {
          userPermissionContainer.textContent = `Associate`;
        }
      } else {
        console.log(`It is not there!`);
      }
      bc.addEventListener('click', (e) => {
        const clicked = e.target;
        const id = clicked.closest('.budget-card-container__card').dataset.budgetid;
        this.getBudget(id, user);
      });
    });
    const budgetContainer = document.querySelector('.budget-container');
    if (budgetContainer) {
      this.watch(user);
      console.log(user, user.budgets);
    }
  }

  async watch(user, placeholderBudget) {
    console.log(`WATCHING YOUR BUDGET`);
    const utility = get(`utility`);
    console.log(utility);
    let currentBudget;
    user.budgets.forEach((b) => {
      if (b._id === window.location.pathname.split('/')[5]) currentBudget = b;
    });
    let budget = this._buildPlaceHolderBudget(currentBudget, user);
    if (budget === undefined) {
      budget = placeholderBudget;
      budget = this._buildPlaceHolderBudget(placeholderBudget, user);
    }

    ////////////////////////////////////////////
    // SETTING UP THE BUDGET DASHBOARD
    await Dashboard.setup(user, currentBudget, budget, utility);
    ////////////////////////////////////////////
    // WATCH BUDGET MANAGEMENT PAGE
    Manager.manageBudget(budget, user, utility);
    ////////////////////////////////////////////
    // WATCH EDIT CATEGORY GOALS PAGE
    Editer.editCategoryGoals(budget, user, utility);
    ////////////////////////////////////////////
    // WATCH MANAGE CATEGORIES PAGE
    Categories.manageCategories(budget, user, utility);
    ////////////////////////////////////////////
    // WATCH FOR INCOME ALLOCATION
    Income.watch(budget, user, utility);
    ////////////////////////////////////////////
    // WATCH TRANSACTION PLANNER
    Planner.watch(budget, user, utility);
    ////////////////////////////////////////////
    // WATCH FOR INVESTMENT PLANNER
    Investment.watch(budget, user, utility);
    ////////////////////////////////////////////
    // WATCH DEBT MANAGEMENT
    Debt.watch(budget, user, utility);
    ////////////////////////////////////////////
    // WATCH RECENT TRANSACTIONS
    Recent.watch(budget, utility);
    ////////////////////////////////////////////
    // WATCH ACCOUNT MANAGEMENT
    Accounts.watch(budget, user, utility);
    ////////////////////////////////////////////
    // WATCH INVITE USERS
    Invite.watch(budget, user, utility);
  }
}
