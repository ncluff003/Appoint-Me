import * as Utility from './../../../Application/Utility';
import * as Transaction from './../../../Classes/Transaction';
import * as Tithing from './../../Algorithms/_Tithing';

const displayPreviewTotals = (placeholderBudget, incomePreviewAmounts, incomeGross, incomeNet, user, utility) => {
  // INITIALIZE THE NET VALUE AND CALCULATION AMOUNT
  let netIncome = incomeNet.value;
  const calculatedNet = incomeNet.value;

  // BUDGET SETTINGS
  const investmentPercentage = placeholderBudget.accounts.investmentFund.investmentPercentage;
  const savingsPercentage = placeholderBudget.accounts.savingsFund.savingsPercentage;

  // CALCULATE THE INVESTMENT PREVIEW AMOUNT
  let investedAmount = calculatedNet * investmentPercentage;

  // CALCULATE THE SAVINGS PREVIEW AMOUNT
  let savedAmount = calculatedNet * savingsPercentage;

  // SET THE TITHING PREVIEW AMOUNT -- IF LATTER DAY SAINT

  // IMMEDIATELY UPDATE THE NET INCOME
  netIncome = Utility.subtract(netIncome, [investedAmount, savedAmount]);

  // SET THE UN-ALLOCATED PREVIEW AMOUNT
  let unAllocatedAmount = netIncome;

  // SETTING THE INVESTED PREVIEW AMOUNT
  incomePreviewAmounts[0].textContent = utility.money.format(investedAmount);

  // SETTING THE SAVED PREVIEW AMOUNT
  incomePreviewAmounts[1].textContent = utility.money.format(savedAmount);

  // UN-ALLOCATED PREVIEW FOR THOSE WHO ARE NOT LATTER DAY SAINTS.
  if (user.latterDaySaint === false) {
    incomePreviewAmounts[2].textContent = utility.money.format(netIncome);
  }

  // SET INVESTED AND SAVED AMOUNTS TO UTILITY OBJECT FOR FUTURE USE
  utility.investedAmount = investedAmount;
  utility.savedAmount = savedAmount;

  utility.unAllocatedAmount = netIncome;

  if (user.latterDaySaint === true) {
    Tithing.initializeTithingPreview(incomePreviewAmounts[2], utility);

    Tithing.calculate(placeholderBudget, placeholderBudget.accounts.tithing.tithingSetting, incomeGross.value, calculatedNet, utility);

    if (utility.incomeTithed === true) {
      utility.tithing = 0;
    }

    if (placeholderBudget.accounts.tithing.tithingSetting !== `Surplus`) {
      incomePreviewAmounts[2].textContent = utility.money.format(utility.tithing);
      unAllocatedAmount = Utility.subtract(unAllocatedAmount, [utility.tithing]);
      incomePreviewAmounts[3].textContent = utility.money.format(unAllocatedAmount);
    }

    utility.unAllocatedAmount = unAllocatedAmount;

    if (placeholderBudget.accounts.tithing.tithingSetting === `Surplus`) {
      incomePreviewAmounts[2].textContent = utility.money.format(netIncome);
    }
  }
};

const updateContainerIfLatterDaySaint = (user, placeholderBudget, incomePreviewAmounts, incomeInputs, tithed, utility) => {
  let tithingInput, incomeNet;
  if (user.latterDaySaint === true && placeholderBudget.accounts.tithing.tithingSetting !== `Surplus`) {
    tithingInput = incomeInputs[3];
    incomeNet = incomeInputs[4];
  }

  const tithedSwitch = document.querySelector('.form__input--tithing');
  if (tithedSwitch) {
    tithedSwitch.addEventListener('click', (e) => {
      e.preventDefault();
      Utility.toggleClass(tithedSwitch, `form__input--tithing`);
      Utility.toggleClass(tithedSwitch, `form__input--tithing--tithed`);
      tithed = !tithed;
      utility.incomeTithed = tithed;
      if (tithed === true) {
        incomePreviewAmounts[2].textContent = utility.money.format(0);
      }
    });
  }
};

const _translateIncomeContainer = (user, elementsToTranslate) => {
  elementsToTranslate.forEach(async (element) => {
    await Utility.getTranslation(user, element.textContent);
  });
};

const setupIncomeContainer = (submitIncomeButtonText, incomePreviewAmounts, incomeInputs, placeholderBudget, user, utility, tithed) => {
  const incomeHeaderTitle = document.querySelectorAll('.container--small__header__text')[0];
  const incomPreviewHeaders = [
    ...document.querySelectorAll('.form__section--early-income-view__income-view__header'),
    ...document.querySelectorAll('.form__section--early-income-view__income-view--purple__header'),
  ];
  const enterIncomeLabels = document.querySelectorAll('.form__label--enter-income');

  // Translate Budget Elements
  _translateIncomeContainer(user, [incomeHeaderTitle, submitIncomeButtonText, ...enterIncomeLabels]);
  incomPreviewHeaders.forEach(async (header, i) => {
    if (i !== 2) {
      return (header.textContent = await Utility.getTranslation(user, header.textContent));
    }
    let headerText = header.textContent.replace(/-/g, '');
    return (header.textContent = await Utility.getTranslation(user, headerText));
  });

  console.log(incomePreviewAmounts);
  // FORMATTING THE PREVIEWS ACCORDING TO LOCALE.
  incomePreviewAmounts.forEach((amount) => {
    if (utility.commaLocales.includes(user.locale)) {
      let newAmount;
      newAmount = amount.textContent.replace(/[^d.]/, '');
      newAmount = newAmount.replace(/[,]/, '.');
      amount.textContent = utility.money.format(Number(newAmount));
    }
    if (!utility.commaLocales.includes(user.locale)) {
      amount.textContent = utility.money.format(Number(amount.textContent.replace(/[^d.]/, '')));
    }
  });
  if (user.latterDaySaint === true) {
    updateContainerIfLatterDaySaint(user, placeholderBudget, incomePreviewAmounts, incomeInputs, tithed, utility);
  }
};

export const watchForEnteredIncome = (placeholderBudget, user, utility) => {
  // MAKING SURE EVERYTHING HERE ONLY RUNS WHEN IT IS THE DASHBOARD AND THERE IS THE ENTER INCOME CONTAINER.
  const dashboard = document.querySelector('.budget-dashboard');
  if (dashboard) {
    const incomeContainer = document.querySelectorAll('.container--small')[0];
    if (incomeContainer) {
      // DEFAULT INCOME SETTINGS
      let tithed = false;
      let investedAmount = 0,
        savedAmount = 0,
        netIncome = 0;

      // ENTER INCOME ELEMENTS
      const submitIncomeButton = document.querySelectorAll('.button--small-container-header')[0];
      const submitIncomeButtonText = document.querySelectorAll('.container--small__header__button__text')[0];
      const incomeDate = document.querySelectorAll('.form__input--enter-income')[0];
      const incomeFrom = document.querySelectorAll('.form__input--enter-income')[1];
      const incomeGross = document.querySelectorAll('.form__input--enter-income')[2];
      let incomeNet = document.querySelectorAll('.form__input--enter-income')[3];
      const incomePreviewAmounts = [
        ...document.querySelectorAll('.form__section--early-income-view__income-view__amount'),
        document.querySelector('.form__section--early-income-view__income-view--purple__amount'),
      ];

      console.log(incomePreviewAmounts);
      setupIncomeContainer(submitIncomeButtonText, incomePreviewAmounts, [...document.querySelectorAll('.form__input--enter-income')], placeholderBudget, user, utility, tithed);

      incomeNet.addEventListener('keyup', (e) => {
        e.preventDefault();
        displayPreviewTotals(placeholderBudget, incomePreviewAmounts, incomeGross, incomeNet, user, utility);
      });

      // ENTERING INCOME
      submitIncomeButton.addEventListener('click', (e) => {
        let updateObject, transaction, netAmount;

        investedAmount = utility.investedAmount;
        savedAmount = utility.savedAmount;
        netIncome = utility.unAllocatedAmount;

        // Get or Set Amounts
        let unAllocatedAmount = placeholderBudget.accounts.unAllocated.amount + netIncome;
        const savingsAmount = placeholderBudget.accounts.savingsFund.amount + savedAmount;
        const investmentAmount = placeholderBudget.accounts.investmentFund.amount + investedAmount;

        transaction = new Transaction.Transaction({ date: incomeDate.value, type: `Deposit`, location: incomeFrom.value });
        let transactionObject = {
          accountSelected: `Un-Allocated`,
          account: `Un-Allocated`,
          grossAmount: Number(incomeGross.value),
          netAmount: Number(incomeNet.value),
          deposited: Number(netIncome),
          user: user,
          budget: placeholderBudget,
        };
        let budgetId = window.location.href.split('/')[7];
        updateObject = {
          budgetId: budgetId,
          userId: user._id,
          accounts: {
            unAllocated: {
              amount: unAllocatedAmount,
            },
            monthlyBudget: placeholderBudget.accounts.monthlyBudget,
            emergencyFund: placeholderBudget.accounts.emergencyFund,
            savingsFund: {
              savingsGoal: placeholderBudget.accounts.savingsFund.savingsGoal,
              savingsPercentage: placeholderBudget.accounts.savingsFund.savingsPercentage,
              amount: savingsAmount,
            },
            expenseFund: placeholderBudget.accounts.expenseFund,
            surplus: placeholderBudget.accounts.surplus,
            investmentFund: {
              investmentGoal: placeholderBudget.accounts.investmentFund.investmentGoal,
              investmentPercentage: placeholderBudget.accounts.investmentFund.investmentPercentage,
              amount: investmentAmount,
              investedAmount: placeholderBudget.accounts.investmentFund.investedAmount,
            },
            debt: placeholderBudget.accounts.debt,
          },
        };

        if (user.latterDaySaint === true) {
          updateObject.accounts.tithing = placeholderBudget.accounts.tithing;
          if (placeholderBudget.accounts.tithing.tithingSetting !== `Surplus`) {
            transactionObject.tithed = utility.incomeTithed;
            if (utility.incomeTithed === true) utility.tithing = 0;
          }
          let tithingAmount = placeholderBudget.accounts.tithing.amount;
          tithingAmount += utility.tithing;
          if (placeholderBudget.accounts.tithing.tithingSetting === `Surplus`) {
            let surplusAmount = placeholderBudget.accounts.surplus.amount;
            if (utility.surplus >= 0.1) {
              surplusAmount = utility.surplus;
            }
            if (utility.surplus < 0.1) {
              tithingAmount = 0;
              if (utility.surplus < 0) {
                surplusAmount = 0;
              }
            }
            updateObject.accounts.surplus.amount = surplusAmount;
          }
          updateObject.accounts.tithing.amount = tithingAmount;
        }

        transaction.addToReceipt(transactionObject);
        placeholderBudget.transactions.recentTransactions.push(transaction);
        updateObject.transactions = placeholderBudget.transactions;

        placeholderBudget._updateBudget(
          {
            updateObject: updateObject,
          },
          `Enter-Income`
        );
        incomeDate.value = '';
        incomeFrom.value = '';
        incomeGross.value = '';
        incomeNet.value = '';
        incomePreviewAmounts[0].textContent = utility.money.format(0);
        incomePreviewAmounts[1].textContent = utility.money.format(0);
        incomePreviewAmounts[2].textContent = utility.money.format(0);
      });
    }
  }
};
