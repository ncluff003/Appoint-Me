import * as Utility from './../Application/Utility';

export const watch = (placeholderBudget, user, utility) => {
  const incomeAllocationContainer = document.querySelector('.container--allocate-income');
  const unAllocatedTotal = document.querySelector('.un-allocated-account-total');
  if (incomeAllocationContainer) {
    console.log(`Allocating...`);
    unAllocatedTotal.textContent = utility.money.format(placeholderBudget.accounts.unAllocated.amount);
    const allocateIncomeButton = document.querySelector('.button--small-purple');
    if (utility.permissions.admin === true) {
      allocateIncomeButton.addEventListener('click', (e) => {
        e.preventDefault();
        // INITIALIZE NEEDED VARIABLES
        let unAllocatedAmount = placeholderBudget.accounts.unAllocated.amount;
        let totalAllocationAmount = 0;
        // SELECT INPUTS FOR INCOME ALLOCATION
        const allocationInputs = document.querySelectorAll('.form__input');

        // GET TOTAL AMOUNT OF ALL INPUTS
        allocationInputs.forEach((ai, i) => {
          // ADD VALUE TO CURRENT TOTAL
          totalAllocationAmount += Number(ai.value);
        });

        // DOUBLE CHECK TO MAKE SURE ALLOCATED AMOUNT DOES NOT EXCEED UN-ALLOCATED INCOME
        totalAllocationAmount <= unAllocatedAmount
          ? (unAllocatedTotal.textContent = utility.money.format(unAllocatedAmount - totalAllocationAmount))
          : alert(`You do not have all that money! Please lower one of your accounts amounts!`);

        // INITIALIZE SEPARATE ACCOUNTS ALLOCATED TOTALS
        let monthlyBudgetAllocation, emergencyFundAllocation, savingsFundAllocation, expenseFundAllocation, debtAllocation, investmentFundAllocation;

        // GET EACH SEPARATE ACCOUNTS ALLOCATED INCOME
        monthlyBudgetAllocation = allocationInputs[0].value;
        emergencyFundAllocation = allocationInputs[1].value;
        savingsFundAllocation = allocationInputs[2].value;
        expenseFundAllocation = allocationInputs[3].value;
        debtAllocation = allocationInputs[4].value;
        investmentFundAllocation = allocationInputs[5].value;

        // DOUBLE CHECK IF IT IS A NUMBER
        if (isNaN(monthlyBudgetAllocation)) monthlyBudgetAllocation = 0;
        if (isNaN(emergencyFundAllocation)) emergencyFundAllocation = 0;
        if (isNaN(savingsFundAllocation)) savingsFundAllocation = 0;
        if (isNaN(expenseFundAllocation)) expenseFundAllocation = 0;
        if (isNaN(debtAllocation)) debtAllocation = 0;
        if (isNaN(investmentFundAllocation)) investmentFundAllocation = 0;

        placeholderBudget.accounts.unAllocated.amount -= totalAllocationAmount;
        placeholderBudget.accounts.monthlyBudget.amount += monthlyBudgetAllocation;
        placeholderBudget.accounts.emergencyFund.amount += emergencyFundAllocation;
        placeholderBudget.accounts.savingsFund.amount += savingsFundAllocation;
        placeholderBudget.accounts.expenseFund.amount += expenseFundAllocation;
        placeholderBudget.accounts.debt.amount += debtAllocation;
        placeholderBudget.accounts.investmentFund.amount += investmentFundAllocation;

        let budgetId = window.location.href.split('/')[7];
        const updateObject = {
          budgetId: budgetId,
          userId: user._id,
          accounts: placeholderBudget.accounts,
        };

        placeholderBudget._updateBudget({ updateObject: updateObject }, `Allocate-Income`);
        Utility.reloadPage();
        allocationInputs.forEach((ai) => {
          ai.value = '';
        });
      });
    } else {
      Utility.addClasses(allocateIncomeButton, [`disabled`]);
      const allocationInputs = document.querySelectorAll('.form__input');
      allocationInputs.forEach((input) => (input.readOnly = true));
    }
  }
};
