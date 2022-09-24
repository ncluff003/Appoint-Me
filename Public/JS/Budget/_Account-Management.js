import * as Utility from './../Application/Utility';
export const watch = (placeholderBudget, user, utility) => {
  const accountSelect = document.querySelectorAll('.form__select--accounts');
  const transferFrom = accountSelect[0];
  const transferTo = accountSelect[1];
  const transferAmount = document.getElementById('transferAmount');
  const transferButton = document.querySelector('.button--extra-extra-small__wider');
  const accountTotals = document.querySelectorAll('.container--extra-small__content__account-total__alt');
  let bankAccountTotal = [...Object.entries(placeholderBudget.accounts)].reduce((total, account) => {
    return (total += account[1].amount);
  }, 0);
  let bankAccount = document.querySelectorAll('.container--extra-small__content__account-total');
  console.log(bankAccountTotal, utility.money.format(bankAccountTotal));
  if (bankAccount[0]) {
    bankAccount[0].textContent = utility.money.format(bankAccountTotal);
  }
  let accountTotalAmounts = [
    utility.money.format(placeholderBudget.accounts.monthlyBudget.amount),
    utility.money.format(placeholderBudget.accounts.emergencyFund.amount),
    utility.money.format(placeholderBudget.accounts.savingsFund.amount),
    utility.money.format(placeholderBudget.accounts.expenseFund.amount),
    utility.money.format(placeholderBudget.accounts.surplus.amount),
    utility.money.format(placeholderBudget.accounts.investmentFund.amount),
  ];
  if (user.latterDaySaint === true) {
    accountTotalAmounts.push(utility.money.format(placeholderBudget.accounts.tithing.amount));
  }
  console.log(accountTotals);
  accountTotals.forEach((total, i) => {
    total.textContent = accountTotalAmounts[i];
  });
  if (utility.permissions.admin === true) {
    if (transferFrom) {
      transferFrom.childNodes.forEach((child) => {
        child.addEventListener('click', (e) => {
          e.preventDefault();
          console.log(child.value);
        });
      });
    }
    if (transferTo) {
      transferTo.childNodes.forEach((child) => {
        child.addEventListener('click', (e) => {
          e.preventDefault();
          console.log(child.value);
        });
      });
    }
  } else {
    if (transferFrom && transferTo) {
      transferFrom.readOnly = true;
      transferTo.readOnly = true;
      transferFrom.disabled = true;
      transferTo.disabled = true;
      Utility.addClasses(transferFrom, [`disabled`]);
      Utility.addClasses(transferTo, [`disabled`]);
    }
  }
  if (transferButton) {
    if (utility.permissions.admin === true) {
      transferButton.addEventListener('click', (e) => {
        e.preventDefault();
        let from = utility.transferValues[transferFrom.value];
        let to = utility.transferValues[transferTo.value];
        console.log(from, to);
        let budgetId = window.location.href.split('/')[7];
        let updateObject = {
          budgetId: budgetId,
          userId: user._id,
        };
        placeholderBudget._accountTransfer(placeholderBudget.accounts[from], placeholderBudget.accounts[to], transferAmount.value);
        updateObject.accounts = placeholderBudget.accounts;
        placeholderBudget._updateBudget({ updateObject: updateObject }, `Account-Management`);
        Utility.reloadPage();
      });
    } else {
      transferButton.disabled = true;
      Utility.addClasses(transferButton, [`disabled`]);
      transferAmount.disabled = true;
      transferAmount.readOnly = true;
    }
  }
};
