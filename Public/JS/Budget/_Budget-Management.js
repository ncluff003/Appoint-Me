import * as Manage from './Manage-Budget';
import * as Utility from './../Application/Utility';

const getTithing = (budget, user, currentTithingSetting) => {
  let tithingSetting;
  let tithing = {
    amount: '',
    tithingSetting: '',
  };
  if (tithingSetting === undefined || tithingSetting !== '' || tithingSetting === null) {
    tithingSetting = currentTithingSetting;
  }
  tithing.tithingSetting = currentTithingSetting;
  tithing.amount = budget.accounts.tithing.amount;
  return tithing;
};

const getEmergencyFund = (budget, emergencySetting) => {
  let emergencyFundGoal, emergencyFundGoalTiming;
  let emergencyFund = {};
  emergencyFund.emergencyGoalMeasurement = emergencySetting;
  if (emergencySetting === `Length Of Time`) {
    emergencyFundGoal = Number(document.querySelector('.form__input--half-left').value);
    emergencyFundGoalTiming = document.querySelector('.form__select--half-right').value;
    if (emergencyFundGoal === '' || emergencyFundGoal === undefined || emergencyFundGoal === null) emergencyFundGoal = budget.accounts.emergencyFund.emergencyFundGoal;
    if (emergencyFundGoalTiming === '' || emergencyFundGoalTiming === undefined || emergencyFundGoalTiming === null) emergencyFundGoalTiming = budget.accounts.emergencyFund.emergencyFundGoalTiming;
    emergencyFund.emergencyGoalMeasurement = emergencySetting;
    emergencyFund.emergencyFundGoal = emergencyFundGoal;
    emergencyFund.emergencyFundGoalTiming = emergencyFundGoalTiming;
    emergencyFund.amount = budget.accounts.emergencyFund.amount;
    return emergencyFund;
  }
  if (emergencySetting === `Total Amount`) {
    emergencyFund.emergencyFundGoal = Number(document.querySelector('.form__input--small-thin__placeholder-shown').value);
  }
  return emergencyFund;
};

const getInvestmentFund = (budget) => {
  const budgetInputs = document.querySelectorAll('.form__input--small-thin');
  let investmentFund = {};
  let investmentGoal = Number(budgetInputs[0].value);
  let investmentPercentage = Number(budgetInputs[1].value);
  if (investmentGoal === '' || investmentGoal === undefined || investmentGoal === null) investmentGoal = budget.accounts.investmentFund.investmentGoal;
  if (investmentPercentage === '' || investmentPercentage === undefined || investmentPercentage === null) investmentPercentage = budget.accounts.investmentFund.investmentPercentage;
  investmentFund.investmentGoal = investmentGoal;
  investmentFund.investmentPercentage = investmentPercentage / 100;
  investmentFund.amount = budget.accounts.investmentFund.amount;
  return investmentFund;
};

const getSavingsFund = (budget) => {
  const budgetInputs = document.querySelectorAll('.form__input--small-thin');
  let savingsFund = {};
  let savingsGoal = Number(budgetInputs[0].value);
  let savingsPercentage = Number(budgetInputs[1].value);
  if (savingsGoal === '' || savingsGoal === undefined || savingsGoal === null) savingsGoal = budget.accounts.savingsFund.savingsGoal;
  if (savingsPercentage === '' || savingsPercentage === undefined || savingsPercentage === null) savingsPercentage = budget.accounts.savingsFund.savingsPercentage;
  savingsFund.savingsGoal = savingsGoal;
  savingsFund.savingsPercentage = savingsPercentage / 100;
  savingsFund.amount = budget.accounts.savingsFund.amount;
  return savingsFund;
};

const getBudgetName = (budget) => {
  const budgetInputs = document.querySelectorAll('.form__input--small-thin__placeholder-shown');
  let budgetName = budgetInputs[0].value;
  if (budgetName === '') budgetName = budget.name;
  return budgetName;
};

const compileBudgetManagementUpdates = (emergencySetting, currentTithingSetting, placeholderBudget, user) => {
  // GET BUDGET NAME
  let budgetName = getBudgetName(placeholderBudget);
  const savingsFund = getSavingsFund(placeholderBudget);
  const investmentFund = getInvestmentFund(placeholderBudget);
  const emergencyFund = getEmergencyFund(placeholderBudget, emergencySetting);
  let tithing;
  let updateObject = {};
  updateObject.userId = user._Id;
  updateObject.name = budgetName;
  updateObject.budgetId = window.location.href.split('/')[7];
  updateObject.accounts = {
    unAllocated: {
      amount: placeholderBudget.accounts.unAllocated.amount,
    },
    monthlyBudget: {
      amount: placeholderBudget.accounts.monthlyBudget.amount,
    },
    emergencyFund: emergencyFund,
    savingsFund: savingsFund,
    expenseFund: {
      amount: placeholderBudget.accounts.expenseFund.amount,
    },
    surplus: {
      amount: placeholderBudget.accounts.surplus.amount,
    },
    investmentFund: investmentFund,
    debt: {
      amount: placeholderBudget.accounts.debt.amount,
      debtAmount: Number(placeholderBudget.accounts.debt.debtAmount),
    },
  };

  if (user.latterDaySaint === true) {
    tithing = getTithing(placeholderBudget, user, currentTithingSetting);
    updateObject.accounts.tithing = tithing;
  }
  placeholderBudget._updateBudget({ updateObject: updateObject }, `Budget-Management`);
  Utility.reloadPage();
};

const changeEmergencyInput = (array, setting) => {
  if (setting === `Length Of Time`) {
    array.forEach((eSetting) => {
      Utility.removeClasses(eSetting, [`closed`, `open`]);
    });
    array[0].classList.add('open');
    array[1].classList.add('closed');
  }
  if (setting === `Total Amount`) {
    array.forEach((eSetting) => {
      Utility.removeClasses(eSetting, [`closed`, `open`]);
    });
    array[1].classList.add('open');
    array[0].classList.add('closed');
  }
};

const watchForBudgetDeletion = (utility) => {
  const budgetDeleteButton = document.querySelectorAll(`.button--extra-extra-small__wide`)[1];
  const budgetId = window.location.pathname.split('/')[5];
  const userId = window.location.pathname.split('/')[3];
  if (utility.permissions.admin === true) {
    budgetDeleteButton.addEventListener('click', (e) => {
      e.preventDefault();
      Manage.deleteMyBudget(budgetId, userId);
    });
  } else {
    Utility.addClasses(budgetDeleteButton, [`disabled`]);
  }
};

const watchForBudgetExit = () => {
  const submitButtons = document.querySelectorAll(`.button--extra-extra-small__wide`);
  const exitButton = submitButtons[0];
  const userId = window.location.pathname.split('/')[3];
  exitButton.addEventListener('click', (e) => {
    e.preventDefault();
    Manage.exitBudget(userId);
  });
};

export const manageBudget = (placeholderBudget, user, utility) => {
  const budgetNameDisplay = document.querySelector('.form--extra-small__budget-name-display');
  const budgetNameInput = document.querySelectorAll('.form__input--small-thin__placeholder-shown')[0];
  if (window.location.pathname.split('/')[6] === `Budget-Management`) {
    const invisibleCheckboxes = document.querySelectorAll('.form__input--invisible-checkbox');
    if (budgetNameInput) {
      budgetNameInput.addEventListener('keyup', (e) => {
        e.preventDefault();
        budgetNameDisplay.textContent = budgetNameInput.value;
      });
    }
    const emergencyFundSettings = document.querySelectorAll('.form__label--checkbox-container');
    let emergencySetting;

    const emergencySelectionContainer = document.querySelector('.form__section--small-thin');
    console.log(document.querySelectorAll('.form__input--small-thin__placeholder-shown'));
    const smallThinInputs = document.querySelectorAll('.form__input--small-thin');
    const emergencyTotalInput = document.querySelectorAll('.form__input--small-thin__placeholder-shown')[1];
    const emergencySettings = [emergencySelectionContainer, emergencyTotalInput];
    emergencySettings.forEach((eSetting) => eSetting.classList.remove('visible'));
    if (placeholderBudget.accounts.emergencyFund.emergencyGoalMeasurement === `Length Of Time`) {
      emergencySettings.forEach((es) => {
        Utility.replaceClassName(es, `open`, `closed`);
      });
      Utility.replaceClassName(emergencyFundSettings[0], `closed`, `open`);
    }
    if (placeholderBudget.accounts.emergencyFund.emergencyGoalMeasurement === `Total Amount`) {
      emergencySettings.forEach((es) => {
        Utility.replaceClassName(es, `open`, `closed`);
      });
      Utility.replaceClassName(emergencyFundSettings[1], `closed`, `open`);
    }

    emergencyFundSettings.forEach((setting) => {
      setting.classList.remove('checked');
      if (setting.textContent === placeholderBudget.accounts.emergencyFund.emergencyGoalMeasurement) setting.classList.toggle('checked');
      emergencySetting = placeholderBudget.accounts.emergencyFund.emergencyGoalMeasurement;
      if (utility.permissions.admin === true) {
        setting.addEventListener('click', (e) => {
          e.preventDefault();
          emergencyFundSettings.forEach((es) => es.classList.remove('checked'));
          setting.classList.toggle('checked');
          emergencySetting = setting.textContent;
          changeEmergencyInput(emergencySettings, emergencySetting);
        });
      }
    });

    emergencyFundSettings.forEach((setting, i) => {
      if (setting.classList.contains('checked')) {
        emergencySetting = setting.textContent;
        Utility.replaceClassName(emergencySettings[i], `closed`, `open`);
      }
    });

    let currentTithingSetting;
    const budgetManagementSubmitButtons = document.querySelectorAll('.button--extra-extra-small');
    const budgetNameSubmit = budgetManagementSubmitButtons[0];
    const savingsGoalSubmit = budgetManagementSubmitButtons[1];
    const investmentGoalSubmit = budgetManagementSubmitButtons[2];
    const emergencyGoalSubmit = budgetManagementSubmitButtons[3];
    const tithingSettingSubmit = budgetManagementSubmitButtons[4];
    const updateSubmitButtons = [budgetNameSubmit, savingsGoalSubmit, investmentGoalSubmit, emergencyGoalSubmit];

    if (utility.permissions.admin === false) {
      updateSubmitButtons.forEach((button) => (button.disabled = true));
      updateSubmitButtons.forEach((button) => Utility.addClasses(button, [`disabled`]));
      [...smallThinInputs, ...document.querySelectorAll('.form__input--small-thin__placeholder-shown')].forEach((input) => {
        input.readOnly = true;
      });
    }

    if (user.latterDaySaint === true) {
      updateSubmitButtons.push(tithingSettingSubmit);
    }
    console.log(user.latterDaySaint);
    updateSubmitButtons.forEach((ub) => {
      ub.addEventListener('click', (e) => {
        e.preventDefault();
        compileBudgetManagementUpdates(emergencySetting, currentTithingSetting, placeholderBudget, user);
      });
    });
    watchForBudgetExit();
    watchForBudgetDeletion(utility);

    if (!placeholderBudget.accounts.tithing) return;
    if (placeholderBudget.accounts.tithing.tithingSetting) {
      const tithingSettings = document.querySelectorAll('.form__label--small-thin__taller--thirds__tithing');
      tithingSettings.forEach((ts) => {
        ts.classList.remove('selected');
        if (placeholderBudget.accounts.tithing.tithingSetting === `Gross`) tithingSettings[0].classList.add('selected');
        if (placeholderBudget.accounts.tithing.tithingSetting === `Net`) tithingSettings[1].classList.add('selected');
        if (placeholderBudget.accounts.tithing.tithingSetting === `Surplus`) tithingSettings[2].classList.add('selected');
      });
      tithingSettings.forEach((ts) => {
        if (ts.classList.contains('selected')) currentTithingSetting = ts.textContent;
      });
      tithingSettings.forEach((ts) => {
        ts.addEventListener('click', (e) => {
          e.preventDefault();
          tithingSettings.forEach((setting) => setting.classList.remove('selected'));
          ts.classList.add('selected');
          currentTithingSetting = ts.textContent;
        });
      });
    }
  }
};
