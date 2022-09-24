import * as Utility from './../Application/Utility';
import { DateTime, Info } from 'luxon';

const getReceiptTotal = (transaction) => {
  let total = 0;
  transaction.receipt.forEach((receiptItem) => {
    total += receiptItem.amount;
  });
  return total;
};

const processReceipt = (transaction, utility) => {
  const receiptLocation = document.querySelector('.modal--receipt__digital-receipt__container__header__title');
  receiptLocation.textContent = `${Utility._capitalize(transaction.location)}`;

  const receiptItemContainer = document.querySelector('.modal--receipt__digital-receipt__container__item-container');
  while (receiptItemContainer.firstChild) {
    receiptItemContainer.removeChild(receiptItemContainer.firstChild);
  }
  let receiptTotal = 0;
  transaction.receipt.forEach((receiptItem) => {
    const receiptRow = document.createElement('section');
    Utility.addClasses(receiptRow, ['modal--receipt__digital-receipt__container__item-container__row', 'r__modal--receipt__digital-receipt__container__item-container__row']);
    Utility.insertElement(`beforeend`, receiptItemContainer, receiptRow);

    const receiptDetailsSection = document.createElement('section');
    Utility.addClasses(receiptDetailsSection, ['receipt-row__transaction-details-section', 'r__receipt-row__transaction-details-section']);
    Utility.insertElement(`beforeend`, receiptRow, receiptDetailsSection);

    const receiptCostSection = document.createElement('section');
    Utility.addClasses(receiptCostSection, ['receipt-row__transaction-cost-section', 'r__receipt-row__transaction-cost-section']);
    Utility.insertElement(`beforeend`, receiptRow, receiptCostSection);

    if (receiptItem.account === `Debt`) {
      const receiptItemDetail = document.createElement('p');
      Utility.addClasses(receiptItemDetail, ['receipt-row__transaction-details-section__name', 'r__receipt-row__transaction-details-section__name']);
      const receiptItemDetailTwo = document.createElement('p');
      Utility.addClasses(receiptItemDetailTwo, ['receipt-row__transaction-details-section__name', 'r__receipt-row__transaction-details-section__name']);
      receiptItemDetail.textContent = `Unknown`;
      if (receiptItem.lender) {
        receiptItemDetail.textContent = `${receiptItem.lender}`;
      }
      receiptItemDetailTwo.textContent = `Unknown`;
      if (receiptItem.description) {
        receiptItemDetailTwo.textContent = `${receiptItem.description}`;
      }
      Utility.insertElement(`beforeend`, receiptDetailsSection, receiptItemDetail);
      Utility.insertElement(`beforeend`, receiptDetailsSection, receiptItemDetailTwo);

      const receiptCostDetail = document.createElement('p');
      Utility.addClasses(receiptCostDetail, ['receipt-row__cost-section__cost', 'r__receipt-row__cost-section__cost']);
      receiptCostDetail.textContent = utility.money.format(receiptItem.amount);
      Utility.insertElement(`beforeend`, receiptCostSection, receiptCostDetail);
    }
    if (receiptItem.account !== `Debt`) {
      const receiptItemDetail = document.createElement('p');
      Utility.addClasses(receiptItemDetail, ['receipt-row__transaction-details-section__name', 'r__receipt-row__transaction-details-section__name']);
      receiptItemDetail.textContent = Utility._capitalize(`paycheck`);
      if (receiptItem.description) {
        receiptItemDetail.textContent = Utility._capitalize(receiptItem.description);
      }
      Utility.insertElement(`beforeend`, receiptDetailsSection, receiptItemDetail);

      const receiptCostDetail = document.createElement('p');
      Utility.addClasses(receiptCostDetail, ['receipt-row__cost-section__cost', 'r__receipt-row__cost-section__cost']);
      receiptCostDetail.textContent = utility.money.format(receiptItem.amount);
      Utility.insertElement(`beforeend`, receiptCostSection, receiptCostDetail);
    }
    receiptTotal += receiptItem.amount;
  });
  const receiptFooterTexts = document.querySelectorAll('.footer-title');
  const receiptTotalAmount = receiptFooterTexts[1];
  receiptTotalAmount.textContent = utility.money.format(receiptTotal);
};

const renderRecentTransactions = (transaction, utility) => {
  const receiptModal = document.querySelector('.modal--receipt');
  const recentTransactionDisplay = document.querySelector('.recent-transaction-display');
  const recentTransaction = document.createElement('section');
  Utility.addClasses(recentTransaction, ['recent-transaction', 'r__recent-transaction']);

  const recentTransactionHeader = document.createElement('header');
  Utility.addClasses(recentTransactionHeader, [`recent-transaction__header`, `r__recent-transaction__header`]);
  Utility.insertElement(`beforeend`, recentTransaction, recentTransactionHeader);

  const recentTransactionType = document.createElement('h3');
  const recentTransactionLocation = document.createElement('h3');
  const recentTransactionDate = document.createElement('h3');

  Utility.addClasses(recentTransactionType, [`recent-transaction__header__type`, `r__recent-transaction__header__type`]);
  recentTransactionType.textContent = transaction.transactionType;
  if (transaction.transactionType === `Deposit`) {
    Utility.addClasses(recentTransactionHeader, [`deposit`]);
  } else if (transaction.transactionType === `Withdrawal`) {
    Utility.addClasses(recentTransactionHeader, [`withdrawal`]);
  }

  Utility.addClasses(recentTransactionLocation, [`recent-transaction__header__location`, `r__recent-transaction__header__location`]);
  recentTransactionLocation.textContent = transaction.location;

  Utility.addClasses(recentTransactionDate, [`recent-transaction__header__date`, `r__recent-transaction__header__date`]);
  recentTransactionDate.textContent = DateTime.fromISO(transaction.transactionDate).toLocaleString(DateTime.DATETIME_MED_WITH_WEEKDAY);

  Utility.insertElement(`beforeend`, recentTransactionHeader, recentTransactionType);
  Utility.insertElement(`beforeend`, recentTransactionHeader, recentTransactionLocation);
  Utility.insertElement(`beforeend`, recentTransactionHeader, recentTransactionDate);

  const recentTransactionDetailContainer = document.createElement('section');
  Utility.addClasses(recentTransactionDetailContainer, [`recent-transaction__detail-container`, `r__recent-transaction__detail-container`]);
  Utility.insertElement(`beforeend`, recentTransaction, recentTransactionDetailContainer);

  const recentTransactionDetailSection = document.createElement('section');
  Utility.addClasses(recentTransactionDetailSection, [`recent-transaction__detail-container__section`, `r__recent-transaction__detail-container__section`]);
  Utility.insertElement(`beforeend`, recentTransactionDetailContainer, recentTransactionDetailSection);

  const recentTransactionCost = document.createElement('p');
  Utility.addClasses(recentTransactionCost, [`recent-transaction__detail-container__section__cost`, `r__recent-transaction__detail-container__section__cost`]);
  recentTransactionCost.textContent = utility.money.format(
    transaction.receipt.reduce((total, receiptItem) => {
      return (total += receiptItem.amount);
    }, 0)
  );
  Utility.insertElement(`beforeend`, recentTransactionDetailSection, recentTransactionCost);

  let viewReceiptButton = document.createElement('button');
  Utility.addClasses(viewReceiptButton, ['button--extra-extra-small__view-receipt', 'r__button--extra-extra-small__view-receipt']);
  let viewReceiptButtonIcon = document.createElement('i');
  Utility.addClasses(viewReceiptButtonIcon, [`fas`, `fa-receipt`, 'button--extra-extra-small__view-receipt__icon', 'r__button--extra-extra-small__view-receipt__icon']);
  let viewReceiptButtonText = document.createElement('p');
  Utility.addClasses(viewReceiptButtonText, ['button--extra-extra-small__view-receipt__text', 'r__button--extra-extra-small__view-receipt__text']);
  viewReceiptButtonText.textContent = `View Full Transaction`;
  Utility.insertElement(`beforeend`, viewReceiptButton, viewReceiptButtonIcon);
  Utility.insertElement(`beforeend`, viewReceiptButton, viewReceiptButtonText);
  Utility.insertElement(`beforeend`, recentTransactionDetailContainer, viewReceiptButton);
  viewReceiptButton.addEventListener('click', (e) => {
    processReceipt(transaction, utility);
    Utility.showElement(receiptModal);
  });
  Utility.insertElement(`beforeend`, recentTransactionDisplay, recentTransaction);
};

export const watch = (placeholderBudget, utility) => {
  const recentTransactionContainer = document.querySelectorAll('.container--large');
  const recentTransactionContainerTitle = document.querySelector('.r__container--large__header__title');

  if (recentTransactionContainer[0] && utility.screen.smallTabPort[0].matches && recentTransactionContainerTitle.textContent === `RECENT TRANSACTIONS`) {
    recentTransactionContainer[0].style.width = `${100}%`;
  }
  const receiptModal = document.querySelector('.modal--receipt');
  const receiptModalClosureIcon = document.querySelector('.modal--receipt__closure-icon');
  const viewReceiptButton = document.querySelector('.button--extra-extra-small__view-receipt');
  if (placeholderBudget.transactions.recentTransactions.length > 0) {
    placeholderBudget.transactions.recentTransactions.forEach((transaction, i) => {
      renderRecentTransactions(transaction, utility);
    });
    if (receiptModalClosureIcon) {
      receiptModalClosureIcon.addEventListener('click', (e) => {
        Utility.showElement(receiptModal);
      });
    }
    if (viewReceiptButton) {
      viewReceiptButton.addEventListener('click', (e) => {
        Utility.showElement(receiptModal);
      });
    }
  }
};
