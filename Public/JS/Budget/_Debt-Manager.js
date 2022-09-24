import * as Utility from './../Application/Utility';
import { DateTime, Info } from 'luxon';

const payDebtOff = (placeholderBudget, user, debt, paidSections, sectionStart, utility) => {
  const months = Info.months({ length: `long` });
  sectionStart = 0;
  paidSections = 6;
  const debtDisplay = document.querySelectorAll('.debt-display--paid')[0];
  const upaidDebts = document.querySelectorAll('.debt');
  const paidDebts = document.querySelectorAll('.debt--paid');
  const paidDebt = document.createElement('section');
  Utility.addClasses(paidDebt, [`debt--paid`, [`r__debt--paid`]]);
  paidDebt.dataset.debt = placeholderBudget.debts.indexOf(debt);

  let budgetId = window.location.href.split('/')[7];
  let updateObject = {
    budgetId: budgetId,
    userId: user._id,
    debts: placeholderBudget.debts,
  };

  if (paidDebts.length === 0) {
    Utility.insertElement(`afterbegin`, debtDisplay, paidDebt);
  }
  if (paidDebts.length > 0) {
    Utility.insertElement(`afterend`, paidDebt[paidDebts.length], paidDebt);
  }

  if (!utility.screen.largeMobileLand[0].matches || !utility.screen.largeMobilePort[0].matches || !utility.screen.smallMobileLand[0].matches || !utility.screen.smallMobilePort[0].matches) {
    while (sectionStart < paidSections) {
      const debtSection = document.createElement('section');
      Utility.addClasses(debtSection, [`form__section--debt-paid`, `r__form__section--debt-paid`]);
      Utility.insertElement(`beforeend`, paidDebt, debtSection);
      if (sectionStart === 0) {
        const sectionHeader = document.createElement('p');
        Utility.addClasses(sectionHeader, [`debt--paid-title`, `r__debt--paid-title`]);
        sectionHeader.textContent = `Date`;

        const sectionContent = document.createElement('p');
        Utility.addClasses(sectionContent, [`debt--paid-text`, `r__debt--paid-text`]);
        console.log(debt.date);
        sectionContent.textContent = DateTime.fromISO(debt.date).toLocaleString(DateTime.DATETIME_FULL);
        Utility.insertElement(`beforeend`, debtSection, sectionHeader);
        Utility.insertElement(`beforeend`, debtSection, sectionContent);
      }

      if (sectionStart === 1) {
        const sectionHeader = document.createElement('p');
        Utility.addClasses(sectionHeader, [`debt--paid-title`, `r__debt--paid-title`]);
        sectionHeader.textContent = `Lender`;

        const sectionContent = document.createElement('p');
        Utility.addClasses(sectionContent, [`debt--paid-text`, `r__debt--paid-text`]);
        sectionContent.textContent = debt.lender;

        Utility.insertElement(`beforeend`, debtSection, sectionHeader);
        Utility.insertElement(`beforeend`, debtSection, sectionContent);
      }

      if (sectionStart === 2) {
        const sectionHeader = document.createElement('p');
        Utility.addClasses(sectionHeader, [`debt--paid-title`, `r__debt--paid-title`]);
        sectionHeader.textContent = `Type`;

        const sectionContent = document.createElement('p');
        Utility.addClasses(sectionContent, [`debt--paid-text`, `r__debt--paid-text`]);
        sectionContent.textContent = debt.debtType;

        Utility.insertElement(`beforeend`, debtSection, sectionHeader);
        Utility.insertElement(`beforeend`, debtSection, sectionContent);
      }

      if (sectionStart === 3) {
        const sectionHeader = document.createElement('p');
        Utility.addClasses(sectionHeader, [`debt--paid-title`, `r__debt--paid-title`]);
        sectionHeader.textContent = `Initial Debt`;

        const sectionContent = document.createElement('p');
        Utility.addClasses(sectionContent, [`debt--paid-text`, `r__debt--paid-text`]);
        sectionContent.textContent = utility.money.format(Number(debt.initialDebt));

        Utility.insertElement(`beforeend`, debtSection, sectionHeader);
        Utility.insertElement(`beforeend`, debtSection, sectionContent);
      }

      if (sectionStart === 4) {
        const sectionHeader = document.createElement('p');
        Utility.addClasses(sectionHeader, [`debt--paid-title`, `r__debt--paid-title`]);
        sectionHeader.textContent = `Amount Owed`;

        const sectionContent = document.createElement('p');
        Utility.addClasses(sectionContent, [`debt--paid-text`, `r__debt--paid-text`]);
        sectionContent.textContent = utility.money.format(Number(debt.amountOwed));

        Utility.insertElement(`beforeend`, debtSection, sectionHeader);
        Utility.insertElement(`beforeend`, debtSection, sectionContent);
      }

      if (sectionStart === 5) {
        const sectionHeader = document.createElement('p');
        Utility.addClasses(sectionHeader, [`debt--paid-title`, `r__debt--paid-title`]);
        sectionHeader.textContent = `Status`;

        const sectionContent = document.createElement('p');
        Utility.addClasses(sectionContent, [`debt--paid-text`, `r__debt--paid-text`]);
        sectionContent.textContent = `${debt.status}`;

        Utility.insertElement(`beforeend`, debtSection, sectionHeader);
        Utility.insertElement(`beforeend`, debtSection, sectionContent);
      }
      sectionStart++;
    }
  }
  if (utility.screen.largeMobileLand[0].matches || utility.screen.largeMobilePort[0].matches || utility.screen.smallMobileLand[0].matches || utility.screen.smallMobilePort[0].matches) {
  }
  updateObject.debts[placeholderBudget.debts.indexOf(debt)].status = `Paid Off`;
  updateObject.debts[placeholderBudget.debts.indexOf(debt)].datePaid = DateTime.now().toBSON();
  let amountOfDebt = 0;
  placeholderBudget.debts.forEach((debt) => {
    if (debt.status !== `Paid Off`) {
      amountOfDebt += debt.amountOwed;
    }
  });
  // * This is where I am at.
  placeholderBudget.accounts.debt.debtAmount = Number(amountOfDebt);
  updateObject.accounts = placeholderBudget.accounts;
  placeholderBudget._updateBudget({ updateObject: updateObject }, `Debt-Manager`);
};

const showMobileDebts = (placeholderBudget, user, utility, debtDisplay, paidDebtDisplay) => {
  console.log(placeholderBudget.debts);
  [...document.querySelectorAll('.debt')].forEach((debtItem) => debtItem.remove());
  [...document.querySelectorAll('.debt--paid')].forEach((debtItem) => debtItem.remove());

  placeholderBudget.debts.forEach((debt) => {
    const debtItem = document.createElement('section');
    const debtHeader = document.createElement('header');
    const debtDetails = document.createElement('section');
    let debtHeaderContent = [debt.date, debt.lender, debt.debtType, debt.status];
    if (debt.status === `Paid Off`) {
      Utility.addClasses(debtItem, [`debt--paid`, `r__debt--paid`]);
      Utility.insertElement(`beforeend`, paidDebtDisplay, debtItem);
      Utility.addClasses(debtHeader, [`debt--paid__header`, `r__debt--paid__header`]);
      Utility.insertElement(`beforeend`, debtItem, debtHeader);
      Utility.addClasses(debtDetails, [`debt--paid__details`, `r__debt--paid__details`]);
      Utility.insertElement(`beforeend`, debtItem, debtDetails);

      debtHeaderContent.forEach((content, i) => {
        let contentItem = document.createElement('p');
        Utility.addClasses(contentItem, [`debt--paid__header__content`, `r__debt--paid__header__content`]);
        if (i === 0) {
          contentItem.textContent = DateTime.fromISO(content).toLocaleString(DateTime.DATE_HUGE);
        } else {
          contentItem.textContent = content;
        }
        Utility.insertElement(`beforeend`, debtHeader, contentItem);
      });

      let initialAmount = document.createElement('p');
      let currentAmount = document.createElement('p');

      Utility.addClasses(initialAmount, [`debt__details__content`, `r__debt__details__content`]);
      Utility.insertElement('beforeend', debtDetails, initialAmount);
      Utility.addClasses(currentAmount, [`debt__details__content`, `r__debt__details__content`]);
      Utility.insertElement('beforeend', debtDetails, currentAmount);

      initialAmount.textContent = utility.money.format(debt.initialDebt);
      currentAmount.textContent = utility.money.format(debt.amountOwed);
    } else {
      Utility.addClasses(debtItem, [`debt`, `r__debt`]);
      Utility.insertElement(`beforebegin`, debtDisplay, debtItem);
      Utility.addClasses(debtHeader, [`debt__header`, `r__debt__header`]);
      Utility.insertElement(`beforeend`, debtItem, debtHeader);
      Utility.addClasses(debtDetails, [`debt__details`, `r__debt__details`]);
      Utility.insertElement(`beforeend`, debtItem, debtDetails);

      debtHeaderContent.forEach((content, i) => {
        let contentItem = document.createElement('p');
        Utility.addClasses(contentItem, [`debt__header__content`, `r__debt__header__content`]);
        if (i === 0) {
          contentItem.textContent = DateTime.fromISO(content).toLocaleString(DateTime.DATE_HUGE);
        } else {
          contentItem.textContent = content;
        }
        Utility.insertElement(`beforeend`, debtHeader, contentItem);
      });

      let initialAmount = document.createElement('p');
      let currentAmount = document.createElement('p');
      let payOffButton = document.createElement('button');

      Utility.addClasses(initialAmount, [`debt__details__content`, `r__debt__details__content`]);
      Utility.insertElement('beforeend', debtDetails, initialAmount);
      Utility.addClasses(currentAmount, [`debt__details__content`, `r__debt__details__content`]);
      Utility.insertElement('beforeend', debtDetails, currentAmount);
      Utility.addClasses(payOffButton, [`button--extra-extra-small__transaction-plan`, `r__button--extra-extra-small__transaction-plan`]);
      Utility.insertElement('beforeend', debtDetails, payOffButton);

      initialAmount.textContent = utility.money.format(debt.initialDebt);
      currentAmount.textContent = utility.money.format(debt.amountOwed);

      const payOffButtonIcon = document.createElement('i');
      Utility.addClasses(payOffButtonIcon, [`fas`, `fa-handshake`, `button--extra-extra-small__transaction-plan__icon`, `r__button--extra-extra-small__transaction-plan__icon`]);

      const payOffButtonText = document.createElement('p');
      Utility.addClasses(payOffButtonText, ['button--extra-extra-small__transaction-plan__text', 'r__button--extra-extra-small__transaction-plan__text']);
      payOffButtonText.textContent = `Paid Off`;

      Utility.insertElement(`beforeend`, payOffButton, payOffButtonIcon);
      Utility.insertElement(`beforeend`, payOffButton, payOffButtonText);
    }
  });
};

export const watch = (placeholderBudget, user, utility) => {
  const debtDisplay = document.querySelectorAll('.debt-display');
  const paidDebtDisplay = document.querySelectorAll('.debt-display--paid');
  const months = Info.months({ length: 'long' });
  const addDebtButton = document.getElementById('addDebtButton');
  const debtLender = document.getElementById('debtLender');
  const debtAmount = document.getElementById('debtAmount');
  const debtTypes = document.querySelectorAll('.form__select--accounts')[0];
  const debts = document.querySelectorAll('.debt');
  let numberOfUnpaidSections, numberOfPaidSections, sectionStart;

  const debtContainer = document.querySelectorAll('.container--large');
  const debtContainerTitle = document.querySelector('.r__container--large__header__title');

  if (debtContainer[0] && utility.screen.smallTabPort[0].matches && debtContainerTitle.textContent === `UNPAID DEBTS`) {
    debtContainer[0].style.width = `${100}%`;
  }

  let budgetId = window.location.href.split('/')[7];
  let updateObject = {
    budgetId: budgetId,
    userId: user._id,
    debts: placeholderBudget.debts,
  };

  if (addDebtButton) {
    addDebtButton.addEventListener('click', (e) => {
      e.preventDefault();
      const debtDisplay = document.querySelector('.debt-display');
      const debt = document.createElement('section');
      const regularPayment = document.getElementById('regularPayment').value;
      let debtObject = {};
      debtObject.regularPayment = regularPayment;
      numberOfUnpaidSections = 7;
      numberOfPaidSections = 6;
      sectionStart = 0;
      Utility.addClasses(debt, [`debt`, `r__debt`]);
      debt.dataset.debt = placeholderBudget.debts.length;
      if (debts.length === 0) {
        Utility.insertElement(`afterbegin`, debtDisplay, debt);
      }
      if (debts.length > 0) {
        Utility.insertElement(`afterend`, debts[debts.length - 1], debt);
      }
      if (!utility.screen.largeMobileLand[0].matches && !utility.screen.largeMobilePort[0].matches && !utility.screen.smallMobileLand[0].matches && !utility.screen.smallMobilePort[0].matches) {
        while (sectionStart < numberOfUnpaidSections) {
          const debtSection = document.createElement('section');
          Utility.addClasses(debtSection, ['form__section--debt', 'r__form__section--debt']);
          Utility.insertElement(`beforeend`, debt, debtSection);

          if (sectionStart === 0) {
            const sectionHeader = document.createElement('p');
            Utility.addClasses(sectionHeader, [`debt-title`, `r__debt-title`]);
            sectionHeader.textContent = `Date`;

            const sectionContent = document.createElement('p');
            Utility.addClasses(sectionContent, [`debt-text`, `r__debt-text`]);
            sectionContent.textContent = DateTime.now().toLocaleString(DateTime.DATE_FULL);
            debtObject.date = DateTime.now().toBSON();
            Utility.insertElement(`beforeend`, debtSection, sectionHeader);
            Utility.insertElement(`beforeend`, debtSection, sectionContent);
          }

          if (sectionStart === 1) {
            const sectionHeader = document.createElement('p');
            Utility.addClasses(sectionHeader, [`debt-title`, `r__debt-title`]);
            sectionHeader.textContent = `Lender`;

            const sectionContent = document.createElement('p');
            Utility.addClasses(sectionContent, [`debt-text`, `r__debt-text`]);
            sectionContent.textContent = debtLender.value;
            debtObject.lender = debtLender.value;

            Utility.insertElement(`beforeend`, debtSection, sectionHeader);
            Utility.insertElement(`beforeend`, debtSection, sectionContent);
          }

          if (sectionStart === 2) {
            const sectionHeader = document.createElement('p');
            Utility.addClasses(sectionHeader, [`debt-title`, `r__debt-title`]);
            sectionHeader.textContent = `Type`;

            const sectionContent = document.createElement('p');
            Utility.addClasses(sectionContent, [`debt-text`, `r__debt-text`]);
            sectionContent.textContent = debtTypes.value;
            debtObject.debtType = debtTypes.value;

            Utility.insertElement(`beforeend`, debtSection, sectionHeader);
            Utility.insertElement(`beforeend`, debtSection, sectionContent);
          }

          if (sectionStart === 3) {
            const sectionHeader = document.createElement('p');
            Utility.addClasses(sectionHeader, [`debt-title`, `r__debt-title`]);
            sectionHeader.textContent = `Initial Debt`;

            const sectionContent = document.createElement('p');
            Utility.addClasses(sectionContent, [`debt-text`, `r__debt-text`]);
            sectionContent.textContent = utility.money.format(Number(debtAmount.value));
            debtObject.initialDebt = Number(debtAmount.value);

            Utility.insertElement(`beforeend`, debtSection, sectionHeader);
            Utility.insertElement(`beforeend`, debtSection, sectionContent);
          }

          if (sectionStart === 4) {
            const sectionHeader = document.createElement('p');
            Utility.addClasses(sectionHeader, [`debt-title`, `r__debt-title`]);
            sectionHeader.textContent = `Amount Owed`;

            const sectionContent = document.createElement('p');
            Utility.addClasses(sectionContent, [`debt-text`, `r__debt-text`]);
            sectionContent.textContent = utility.money.format(Number(debtAmount.value));
            debtObject.amountOwed = debtObject.initialDebt;

            Utility.insertElement(`beforeend`, debtSection, sectionHeader);
            Utility.insertElement(`beforeend`, debtSection, sectionContent);
          }

          if (sectionStart === 5) {
            const sectionHeader = document.createElement('p');
            Utility.addClasses(sectionHeader, [`debt-title`, `r__debt-title`]);
            sectionHeader.textContent = `Status`;

            const sectionContent = document.createElement('p');
            Utility.addClasses(sectionContent, [`debt-text`, `r__debt-text`]);
            sectionContent.textContent = `Unpaid`;
            debtObject.status = `Unpaid`;

            Utility.insertElement(`beforeend`, debtSection, sectionHeader);
            Utility.insertElement(`beforeend`, debtSection, sectionContent);
          }

          if (sectionStart === 6) {
            const paidOffButton = document.createElement('button');
            Utility.addClasses(paidOffButton, ['button--extra-extra-small__transaction-plan', 'r__button--extra-extra-small__transaction-plan']);

            const paidOffButtonIcon = document.createElement('i');
            Utility.addClasses(paidOffButtonIcon, [`fas`, `fa-handshake`, `button--extra-extra-small__transaction-plan__icon`, `r__button--extra-extra-small__transaction-plan__icon`]);

            const paidOffButtonText = document.createElement('p');
            Utility.addClasses(paidOffButtonText, ['button--extra-extra-small__transaction-plan__text', 'r__button--extra-extra-small__transaction-plan__text']);
            paidOffButtonText.textContent = `Paid Off`;

            Utility.insertElement(`beforeend`, paidOffButton, paidOffButtonIcon);
            Utility.insertElement(`beforeend`, paidOffButton, paidOffButtonText);
            Utility.insertElement(`beforeend`, debtSection, paidOffButton);

            paidOffButton.addEventListener('click', (e) => {
              e.preventDefault();
              payDebtOff(placeholderBudget, user, debtObject, numberOfPaidSections, sectionStart, utility);
            });
          }
          sectionStart++;
        }
      }
      if (utility.screen.largeMobileLand[0].matches || utility.screen.largeMobilePort[0].matches || utility.screen.smallMobileLand[0].matches || utility.screen.smallMobilePort[0].matches) {
      }
      updateObject.debts.push(debtObject);
      let amountOfDebt = 0;
      placeholderBudget.debts.forEach((debt) => {
        if (debt.status !== `Paid Off`) {
          amountOfDebt += debt.amountOwed;
        }
      });
      placeholderBudget.accounts.debt.debtAmount = Number(amountOfDebt);
      updateObject.accounts = placeholderBudget.accounts;
      placeholderBudget._updateBudget({ updateObject: updateObject }, `Debt-Manager`);
      Utility.reloadPage();
    });

    const debtPayOffButtons = document.querySelectorAll('.button--extra-extra-small__debt-transaction-plan');
    const debts = document.querySelectorAll('.debt');

    debtPayOffButtons.forEach((button, i) => {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        numberOfPaidSections = 6;
        sectionStart = 0;
        payDebtOff(placeholderBudget, user, placeholderBudget.debts[debts[i].dataset.debt], numberOfPaidSections, sectionStart, utility);
        debts[i].remove();
      });
    });
  }
  if (utility.screen.largeMobileLand[0].matches || utility.screen.largeMobilePort[0].matches || utility.screen.smallMobileLand[0].matches || utility.screen.smallMobilePort[0].matches) {
    const debtContainer = document.querySelector('.r__add-debt-container');
    showMobileDebts(placeholderBudget, user, utility, debtContainer, paidDebtDisplay[0]);
  }
  if (utility.permissions.admin === false) {
    const debtPayOffButtons = document.querySelectorAll('.button--extra-extra-small__debt-transaction-plan');
    debtPayOffButtons.forEach((button) => {
      button.disabled = true;
      Utility.addClasses(button, [`disabled--transparent`]);
    });
    console.log(debtPayOffButtons);
  }
};
