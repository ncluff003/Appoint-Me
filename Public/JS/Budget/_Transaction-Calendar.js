import { myCalendar } from './../Classes/FrontEnd-Calendar';
import { Transaction } from './../Classes/Transaction';
import * as Utility from './../Application/Utility';
import * as Dates from './../Application/Algorithms/_Convert-Date.js';
import * as Compare from './../Application/Algorithms/_Compare-Dates';
import { DateTime, Info } from 'luxon';
import moment from 'moment';
import translate from 'translate';

const selectDayAndShowTransactions = async (dateArray, utility, day, user) => {
  const upcomingTransactions = document.querySelectorAll('.upcoming-bills__bill');
  const monthHeader = document.querySelector('.bill-calendar__header__title');
  const splitMonthHeader = monthHeader.textContent.split(' | ');
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  let translatedDay = utility.number.format(day.textContent);

  upcomingTransactions.forEach(async (transaction, i) => {
    Utility.replaceClassName(transaction, `open`, `closed`);
    let americanDate = Dates.getAmericanDate(utility.upcomingTransactionDates[i], utility, user);
    if (await Compare.compareDateElements([splitMonthHeader[0], day.textContent, splitMonthHeader[1]], americanDate, utility, user)) {
      Utility.replaceClassName(transaction, `closed`, `open`);
    }
  });
};

// WATCH FOR CALENDAR DAY SELECTION FOR TO DISPLAY CORRECT TRANSACTIONS
const _watchDaySelection = (dateArray, utility, user) => {
  const calendarDays = document.querySelectorAll('.bill-calendar__days__single-day');
  calendarDays.forEach((day, i) => {
    day.addEventListener('click', (e) => {
      e.preventDefault();
      selectDayAndShowTransactions(dateArray, utility, day, user);
    });
  });
};

// DISPLAY UPCOMING TRANSACTIONS -- NEED TO DO THIS HERE INSTEAD OF PUG FOR THE REASON OF THE TRANSACTIONS THAT HAVE TWO DUE DATES.
const displayUpcomingTransactions = (container, transactions, user, utility) => {
  const months = Info.months('long');
  // STORE ISO DATE FOR LATER USE WITH BUDGET FUNCTIONALITY
  utility.upcomingTransactionDates = [];
  transactions.forEach((transaction, i) => {
    if (transaction.timingOptions.paymentCycle !== `Bi-Annual` && transaction.timingOptions.paymentCycle !== `Bi-Monthly`) {
      let index = i;
      transaction.timingOptions.paymentSchedule.forEach(async (date, i) => {
        const upcomingBill = document.createElement('section');
        Utility.addClasses(upcomingBill, ['upcoming-bills__bill', 'r__upcoming-bills__bill']);
        upcomingBill.dataset.transaction = index;
        utility.upcomingTransactionDates.push(date);

        if (!utility.screen.largeMobileLand[0].matches && !utility.screen.largeMobilePort[0].matches && !utility.screen.smallMobileLand[0].matches && !utility.screen.smallMobilePort[0].matches) {
          console.log(`Immobile`);
          let billSections = 5;
          let billSectionStart = 0;
          while (billSectionStart < billSections) {
            const billSection = document.createElement('section');
            Utility.addClasses(billSection, ['upcoming-bills__bill__bill-item', 'r__upcoming-bills__bill__bill-item']);
            Utility.insertElement(`beforeend`, upcomingBill, billSection);

            if (billSectionStart === 0) {
              const billAccount = document.createElement('p');
              Utility.addClasses(billAccount, ['upcoming-bills__bill__bill-item__text', 'r__upcoming-bills__bill__bill-item__text']);
              if (transaction.category) {
                billAccount.textContent = `${transaction.account} | ${transaction.category} | ${transaction.name}`;
              } else {
                billAccount.textContent = `${transaction.account} | ${transaction.subAccount} | ${transaction.name}`;
              }
              Utility.insertElement(`beforeend`, billSection, billAccount);
            }
            if (billSectionStart === 1) {
              const billAccount = document.createElement('p');
              Utility.addClasses(billAccount, ['upcoming-bills__bill__bill-item__text', 'r__upcoming-bills__bill__bill-item__text']);

              // FORMAT FOR THE LOCALE
              let formattedDate = utility.date.format(DateTime.fromISO(date).toBSON());
              if (utility.commaLocales.includes(utility.locale)) {
                formattedDate = formattedDate.replace(/[.]/g, '');
              }
              billAccount.textContent = `${formattedDate}`;
              Utility.insertElement(`beforeend`, billSection, billAccount);
            }
            if (billSectionStart === 2) {
              const billAccount = document.createElement('p');
              Utility.addClasses(billAccount, ['upcoming-bills__bill__bill-item__text', 'r__upcoming-bills__bill__bill-item__text']);
              billAccount.textContent = transaction.lender;
              if (!transaction.lender) {
                billAccount.textContent = transaction.location;
              }
              Utility.insertElement(`beforeend`, billSection, billAccount);
            }
            if (billSectionStart === 3) {
              let transactionTiming = transaction.timingOptions.paymentCycle;
              const billAccount = document.createElement('p');
              Utility.addClasses(billAccount, ['upcoming-bills__bill__bill-item__text', 'r__upcoming-bills__bill__bill-item__text']);
              if (transactionTiming === `Once`) {
                billAccount.textContent = utility.money.format(transaction.amount);
              } else if (transactionTiming === `Weekly`) {
                billAccount.textContent = utility.money.format(transaction.amount / 52);
              } else if (transactionTiming === `Bi-Weekly`) {
                billAccount.textContent = utility.money.format(transaction.amount / 26);
              } else if (transactionTiming === `Monthly`) {
                billAccount.textContent = utility.money.format(transaction.amount / 12);
              } else if (transactionTiming === `Quarterly`) {
                billAccount.textContent = utility.money.format(transaction.amount / 4);
              } else if (transactionTiming === `Annual`) {
                billAccount.textContent = utility.money.format(transaction.amount / 10);
              }
              if (user.locale.split('-')[0] === `ar`) {
                billAccount.textContent = billAccount.textContent.replace(/٫/g, '.');
              }
              Utility.insertElement(`beforeend`, billSection, billAccount);
            }
            if (billSectionStart === 4) {
              Utility.getPermissionStatus(user, utility);

              const paidOrNot = document.createElement('section');
              Utility.addClasses(paidOrNot, ['upcoming-bills__bill__bill-item__checkbox-container', 'r__upcoming-bills__bill__bill-item__checkbox-container']);
              const paidOrNotInput = document.createElement('input');
              Utility.addClasses(paidOrNotInput, ['upcoming-bills__bill__bill-item__checkbox-container__payment-checkbox', 'r__upcoming-bills__bill__bill-item__checkbox-container__payment-checkbox']);
              paidOrNotInput.id = `paymentCheck`;
              paidOrNotInput.type = `checkbox`;
              const paidOrNotLabel = document.createElement('label');
              Utility.addClasses(paidOrNotLabel, ['upcoming-bills__bill__bill-item__checkbox-container__payment-label', 'r__upcoming-bills__bill__bill-item__checkbox-container__payment-label']);
              if (utility.permissions.admin === true) {
                paidOrNotLabel.textContent = `Make Payment`;
                paidOrNotLabel.for = `paymentCheck`;
                Utility.insertElement(`beforeend`, paidOrNot, paidOrNotInput);
                Utility.insertElement(`beforeend`, paidOrNot, paidOrNotLabel);
                Utility.insertElement(`beforeend`, billSection, paidOrNot);
              }
            }
            billSectionStart++;
          }
        } else if (utility.screen.largeMobileLand[0].matches || utility.screen.largeMobilePort[0].matches || utility.screen.smallMobileLand[0].matches || utility.screen.smallMobilePort[0].matches) {
          let transactionTiming = transaction.timingOptions.paymentCycle;
          const upcomingBillHeader = document.createElement('header');
          Utility.addClasses(upcomingBillHeader, [`upcoming-bills__bill__header`, `r__upcoming-bills__bill__header`]);
          Utility.insertElement(`beforeend`, upcomingBill, upcomingBillHeader);

          const upcomingBillType = document.createElement('p');
          Utility.addClasses(upcomingBillType, [`upcoming-bills__bill__header__bill-type`, `r__upcoming-bills__bill__header__bill-type`]);
          Utility.insertElement(`beforeend`, upcomingBillHeader, upcomingBillType);
          if (transaction.category) {
            upcomingBillType.textContent = `${transaction.account} | ${transaction.category} | ${transaction.name}`;
          } else if (!transaction.category) {
            upcomingBillType.textContent = `${transaction.account} | ${transaction.subAccount} | ${transaction.name}`;
          }

          const upcomingBillDate = document.createElement('p');
          Utility.addClasses(upcomingBillDate, [`upcoming-bills__bill__header__bill-date`, `r__upcoming-bills__bill__header__bill-date`]);
          upcomingBillDate.textContent = DateTime.fromISO(date).toLocaleString(DateTime.DATE_HUGE);
          Utility.insertElement(`beforeend`, upcomingBillHeader, upcomingBillDate);

          // * GET THE USER'S PERMISSION STATUS
          Utility.getPermissionStatus(user, utility);

          // * UTILIZE THE USUAL PAID OR NOT SECTION CREATION TO CREATE A MOBILE ONE TO USE AS A SECONDARY OPTION.
          const paidOrNot = document.createElement('section');
          // Utility.addClasses(paidOrNot, ['upcoming-bills__bill__bill-item__checkbox-container', 'r__upcoming-bills__bill__bill-item__checkbox-container']);
          Utility.addClasses(paidOrNot, ['upcoming-bills__bill__header__bill-paid-or-not', 'r__upcoming-bills__bill__header__bill-paid-or-not']);
          const paidOrNotInput = document.createElement('input');
          Utility.addClasses(paidOrNotInput, ['upcoming-bills__bill____header__bill-paid-or-not__payment-checkbox', 'r__upcoming-bills__bill__header__bill-paid-or-not__payment-checkbox']);
          paidOrNotInput.id = `paymentCheck`;
          paidOrNotInput.type = `checkbox`;
          const paidOrNotLabel = document.createElement('label');
          Utility.addClasses(paidOrNotLabel, ['upcoming-bills__bill__header__bill-paid-or-not__payment-label', 'r__upcoming-bills__bill__header__bill-paid-or-not__payment-label']);
          if (utility.permissions.admin === true) {
            paidOrNotLabel.textContent = `Make Payment`;
            paidOrNotLabel.for = `paymentCheck`;
            Utility.insertElement(`beforeend`, paidOrNot, paidOrNotInput);
            Utility.insertElement(`beforeend`, paidOrNot, paidOrNotLabel);
            Utility.insertElement(`beforeend`, upcomingBillHeader, paidOrNot);
          }

          const upcomingBillDetails = document.createElement('footer');
          Utility.addClasses(upcomingBillDetails, [`upcoming-bills__bill__footer`, `r__upcoming-bills__bill__footer`]);

          const upcomingBillLocation = document.createElement('p');
          Utility.addClasses(upcomingBillLocation, ['upcoming-bills__bill__footer__location', 'r__upcoming-bills__bill__footer__location']);
          upcomingBillLocation.textContent = transaction.lender;
          if (!transaction.lender) {
            upcomingBillLocation.textContent = transaction.location;
          }
          Utility.insertElement(`beforeend`, upcomingBillDetails, upcomingBillLocation);

          const upcomingBillAmount = document.createElement('p');
          Utility.addClasses(upcomingBillAmount, [`upcoming-bills__bill__footer__amount`, `r__upcoming-bills__bill__footer__amount`]);

          if (transactionTiming === `Once`) {
            upcomingBillAmount.textContent = utility.money.format(transaction.amount);
          } else if (transactionTiming === `Weekly`) {
            upcomingBillAmount.textContent = utility.money.format(transaction.amount / 52);
          } else if (transactionTiming === `Bi-Weekly`) {
            upcomingBillAmount.textContent = utility.money.format(transaction.amount / 26);
          } else if (transactionTiming === `Monthly`) {
            upcomingBillAmount.textContent = utility.money.format(transaction.amount / 12);
          } else if (transactionTiming === `Quarterly`) {
            upcomingBillAmount.textContent = utility.money.format(transaction.amount / 4);
          } else if (transactionTiming === `Annual`) {
            upcomingBillAmount.textContent = utility.money.format(transaction.amount / 10);
          }

          Utility.insertElement(`beforeend`, upcomingBillDetails, upcomingBillAmount);
          Utility.insertElement(`beforeend`, upcomingBill, upcomingBillDetails);
        }
        Utility.insertElement(`beforeend`, container, upcomingBill);
      });
    }

    if (transaction.timingOptions.paymentCycle === `Bi-Annual` || transaction.timingOptions.paymentCycle === `Bi-Monthly`) {
      let index = i;
      transaction.timingOptions.paymentSchedule.forEach((array, i) => {
        array.forEach((date, i) => {
          const upcomingBill = document.createElement('section');
          Utility.addClasses(upcomingBill, ['upcoming-bills__bill', 'r__upcoming-bills__bill']);
          upcomingBill.dataset.transaction = index;
          utility.upcomingTransactionDates.push(date);

          if (!utility.screen.largeMobileLand[0].matches && !utility.screen.largeMobilePort[0].matches && !utility.screen.smallMobileLand[0].matches && !utility.screen.smallMobilePort[0].matches) {
            let billSections = 5;
            let billSectionStart = 0;
            while (billSectionStart < billSections) {
              const billSection = document.createElement('section');
              Utility.addClasses(billSection, ['upcoming-bills__bill__bill-item', 'r__upcoming-bills__bill__bill-item']);
              Utility.insertElement(`beforeend`, upcomingBill, billSection);

              if (billSectionStart === 0) {
                const billAccount = document.createElement('p');
                Utility.addClasses(billAccount, ['upcoming-bills__bill__bill-item__text', 'r__upcoming-bills__bill__bill-item__text']);
                if (transaction.category) {
                  billAccount.textContent = `${transaction.account} | ${transaction.category} | ${transaction.name}`;
                } else {
                  billAccount.textContent = `${transaction.account} | ${transaction.subAccount} | ${transaction.name}`;
                }
                Utility.insertElement(`beforeend`, billSection, billAccount);
              }
              if (billSectionStart === 1) {
                const billAccount = document.createElement('p');
                Utility.addClasses(billAccount, ['upcoming-bills__bill__bill-item__text', 'r__upcoming-bills__bill__bill-item__text']);
                // FORMAT FOR THE LOCALE
                billAccount.textContent = `${utility.date.format(moment(date))}`;
                Utility.insertElement(`beforeend`, billSection, billAccount);
              }
              if (billSectionStart === 2) {
                const billAccount = document.createElement('p');
                Utility.addClasses(billAccount, ['upcoming-bills__bill__bill-item__text', 'r__upcoming-bills__bill__bill-item__text']);
                billAccount.textContent = transaction.lender;
                if (!transaction.lender) {
                  billAccount.textContent = transaction.location;
                }
                Utility.insertElement(`beforeend`, billSection, billAccount);
              }
              if (billSectionStart === 3) {
                let transactionTiming = transaction.timingOptions.paymentCycle;
                const billAccount = document.createElement('p');
                Utility.addClasses(billAccount, ['upcoming-bills__bill__bill-item__text', 'r__upcoming-bills__bill__bill-item__text']);
                if (transactionTiming === `Bi-Monthly`) {
                  billAccount.textContent = utility.money.format(transaction.amount / 24);
                } else if (transactionTiming === `Bi-Annual`) {
                  billAccount.textContent = utility.money.format(transaction.amount / 14);
                }
                if (user.locale.split('-')[0] === `ar`) {
                  billAccount.textContent = billAccount.textContent.replace(/٫/g, '.');
                }
                Utility.insertElement(`beforeend`, billSection, billAccount);
              }
              if (billSectionStart === 4) {
                Utility.getPermissionStatus(user, utility);
                const paidOrNot = document.createElement('section');
                Utility.addClasses(paidOrNot, ['upcoming-bills__bill__bill-item__checkbox-container', 'r__upcoming-bills__bill__bill-item__checkbox-container']);
                const paidOrNotInput = document.createElement('input');
                Utility.addClasses(paidOrNotInput, [
                  'upcoming-bills__bill__bill-item__checkbox-container__payment-checkbox',
                  'r__upcoming-bills__bill__bill-item__checkbox-container__payment-checkbox',
                ]);
                paidOrNotInput.id = `paymentCheck`;
                paidOrNotInput.type = `checkbox`;
                const paidOrNotLabel = document.createElement('label');
                Utility.addClasses(paidOrNotLabel, ['upcoming-bills__bill__bill-item__checkbox-container__payment-label', 'r__upcoming-bills__bill__bill-item__checkbox-container__payment-label']);
                if (utility.permissions.admin === true) {
                  paidOrNotLabel.textContent = `Make Payment`;
                  paidOrNotLabel.for = `paymentCheck`;
                  Utility.insertElement(`beforeend`, paidOrNot, paidOrNotInput);
                  Utility.insertElement(`beforeend`, paidOrNot, paidOrNotLabel);
                  Utility.insertElement(`beforeend`, billSection, paidOrNot);
                }
              }
              billSectionStart++;
            }
          }
          if (utility.screen.largeMobileLand[0].matches || utility.screen.largeMobilePort[0].matches || utility.screen.smallMobileLand[0].matches || utility.screen.smallMobilePort[0].matches) {
            console.log(`Mobile`);
            let transactionTiming = transaction.timingOptions.paymentCycle;
            const upcomingBillHeader = document.createElement('header');
            Utility.addClasses(upcomingBillHeader, [`upcoming-bills__bill__header`, `r__upcoming-bills__bill__header`]);
            Utility.insertElement(`beforeend`, upcomingBill, upcomingBillHeader);

            const upcomingBillType = document.createElement('p');
            Utility.addClasses(upcomingBillType, [`upcoming-bills__bill__header__bill-type`, `r__upcoming-bills__bill__header__bill-type`]);
            Utility.insertElement(`beforeend`, upcomingBillHeader, upcomingBillType);
            if (transaction.category) {
              upcomingBillType.textContent = `${transaction.account} | ${transaction.category} | ${transaction.name}`;
            } else if (!transaction.category) {
              upcomingBillType.textContent = `${transaction.account} | ${transaction.subAccount} | ${transaction.name}`;
            }
            console.log(upcomingBillHeader);

            const upcomingBillDate = document.createElement('p');
            Utility.addClasses(upcomingBillDate, [`upcoming-bills__bill__header__bill-date`, `r__upcoming-bills__bill__header__bill-date`]);
            console.log(transaction);
            upcomingBillDate.textContent = transaction.transactionDate;
            Utility.insertElement(`beforeend`, upcomingBillHeader, upcomingBillDate);

            // * GET THE USER'S PERMISSION STATUS
            Utility.getPermissionStatus(user, utility);

            // * UTILIZE THE USUAL PAID OR NOT SECTION CREATION TO CREATE A MOBILE ONE TO USE AS A SECONDARY OPTION.
            const paidOrNot = document.createElement('section');
            // Utility.addClasses(paidOrNot, ['upcoming-bills__bill__bill-item__checkbox-container', 'r__upcoming-bills__bill__bill-item__checkbox-container']);
            Utility.addClasses(paidOrNot, ['upcoming-bills__bill__header__bill-paid-or-not', 'r__upcoming-bills__bill__header__bill-paid-or-not']);
            const paidOrNotInput = document.createElement('input');
            Utility.addClasses(paidOrNotInput, ['upcoming-bills__bill____header__bill-paid-or-not__payment-checkbox', 'r__upcoming-bills__bill__header__bill-paid-or-not__payment-checkbox']);
            paidOrNotInput.id = `paymentCheck`;
            paidOrNotInput.type = `checkbox`;
            const paidOrNotLabel = document.createElement('label');
            Utility.addClasses(paidOrNotLabel, ['upcoming-bills__bill__header__bill-paid-or-not__payment-label', 'r__upcoming-bills__bill__header__bill-paid-or-not__payment-label']);
            if (utility.permissions.admin === true) {
              paidOrNotLabel.textContent = `Make Payment`;
              paidOrNotLabel.for = `paymentCheck`;
              Utility.insertElement(`beforeend`, paidOrNot, paidOrNotInput);
              Utility.insertElement(`beforeend`, paidOrNot, paidOrNotLabel);
              Utility.insertElement(`beforeend`, upcomingBillHeader, paidOrNot);
            }

            const upcomingBillDetails = document.createElement('footer');
            Utility.addClasses(upcomingBillDetails, [`upcoming-bills__bill__footer`, `r__upcoming-bills__bill__footer`]);

            const upcomingBillLocation = document.createElement('p');
            Utility.addClasses(upcomingBillLocation, ['upcoming-bills__bill__footer__location', 'r__upcoming-bills__bill__footer__location']);
            upcomingBillLocation.textContent = transaction.lender;
            if (!transaction.lender) {
              upcomingBillLocation.textContent = transaction.location;
            }
            Utility.insertElement(`beforeend`, upcomingBillDetails, upcomingBillLocation);

            const upcomingBillAmount = document.createElement('p');
            Utility.addClasses(upcomingBillAmount, [`upcoming-bills__bill__footer__amount`, `r__upcoming-bills__bill__footer__amount`]);

            if (transactionTiming === `Bi-Monthly`) {
              upcomingBillAmount.textContent = utility.money.format(transaction.amount / 24);
            } else if (transactionTiming === `Bi-Annual`) {
              upcomingBillAmount.textContent = utility.money.format(transaction.amount / 14);
            }

            Utility.insertElement(`beforeend`, upcomingBillDetails, upcomingBillAmount);
            Utility.insertElement(`beforeend`, upcomingBill, upcomingBillDetails);
            console.log(upcomingBill);
          }
          Utility.insertElement(`beforeend`, container, upcomingBill);
        });
      });
    }
  });
};

// SETTING UP BILL / TRANSACTION CALENDAR
export const _setupTransactionCalendar = async (placeholderBudget, user, utility) => {
  const calendar = myCalendar;
  let currentMonth = calendar.getMonth();
  let currentMonthIndex = calendar.getMonthIndex();
  let currentYear = calendar.getYear();

  await calendar.makeCalendar(
    currentMonthIndex,
    currentMonth,
    currentYear,
    '.bill-calendar__days__single-day', // NEEDS PERIOD FOR .querySelectorAll
    'bill-calendar__days__single-day--current-day', // CLASS IS ONLY BEING ADDED via .classList.add
    'un-used-day', // CLASS IS ONLY BEING ADDED via .classList.add
    utility,
    user
  );

  const monthLeft = document.querySelector('.month-left');
  const monthRight = document.querySelector('.month-right');

  if (monthLeft) {
    monthLeft.addEventListener('click', (e) => {
      e.preventDefault();
      currentMonthIndex--;
      if (currentMonthIndex === -1) {
        currentMonthIndex = 11;
        currentYear--;
      }
      calendar.goBackAMonth(currentMonthIndex, currentYear, '.bill-calendar__days__single-day', 'bill-calendar__days__single-day--current-day', 'un-used-day', utility, user);
    });
  }
  if (monthRight) {
    monthRight.addEventListener('click', (e) => {
      e.preventDefault();
      currentMonthIndex++;
      if (currentMonthIndex === 12) {
        currentMonthIndex = 0;
        currentYear++;
      }
      calendar.goForwardAMonth(currentMonthIndex, currentYear, '.bill-calendar__days__single-day', 'bill-calendar__days__single-day--current-day', 'un-used-day', utility, user);
    });
  }

  const upcomingBillsContainer = document.querySelector('.upcoming-bills');
  displayUpcomingTransactions(upcomingBillsContainer, placeholderBudget.transactions.plannedTransactions, user, utility);

  const months = calendar.months;
  const upcomingTransactions = document.querySelectorAll('.upcoming-bills__bill');

  let currentDay = document.querySelector('.bill-calendar__days__single-day--current-day');
  const monthHeader = document.querySelector('.bill-calendar__header__title');
  if (monthHeader) {
    const splitMonthHeader = monthHeader.textContent.split(' | ');
    console.log(upcomingTransactions);
    upcomingTransactions.forEach(async (transaction) => {
      // TRANSLATE THE TRANSACTION TYPE
      if (
        !utility.screen.smallTabPort[0].matches &&
        !utility.screen.largeMobileLand[0].matches &&
        !utility.screen.largeMobilePort[0].matches &&
        !utility.screen.smallMobileLand[0].matches &&
        !utility.screen.smallMobilePort[0].matches
      ) {
        let transactionType = transaction.firstChild;
        let transactionTypeText = transactionType.firstChild.textContent;
        transactionType.textContent = await Utility.getTranslation(user, transactionTypeText);

        // TRANSLATE THE TRANSACTION BILLER | CREDITOR
        let transactionLender = transaction.firstChild.nextSibling.nextSibling.firstChild;
        let transactionLenderText = transaction.firstChild.nextSibling.nextSibling.firstChild.textContent;
        transactionLender.textContent = await Utility.getTranslation(user, transactionLenderText);

        // TRANSLATE THE PAYMENT MADE LABEL
        if (transaction.firstChild.nextSibling.nextSibling.nextSibling.nextSibling.firstChild.firstChild.nextSibling) {
          let paymentMadeLabel = transaction.firstChild.nextSibling.nextSibling.nextSibling.nextSibling.firstChild.firstChild.nextSibling;
          let paymentMadeLabelText = paymentMadeLabel.textContent;
          paymentMadeLabel.textContent = await Utility.getTranslation(user, paymentMadeLabelText);
        }
      } else if (
        utility.screen.smallTabPort[0].matches ||
        utility.screen.largeMobileLand[0].matches ||
        utility.screen.largeMobilePort[0].matches ||
        utility.screen.smallMobileLand[0].matches ||
        utility.screen.smallMobilePort[0].matches
      ) {
        let transactionType = transaction.firstChild.firstChild;
        let transactionTypeText = transactionType.textContent;
        transactionType.textContent = await Utility.getTranslation(user, transactionTypeText);

        let transactionLender = transaction.firstChild.nextSibling.firstChild;
        let transactionLenderText = transactionLender.textContent;
        transactionLender.textContent = await Utility.getTranslation(user, transactionLenderText);

        if (transaction.firstChild.firstChild.nextSibling.nextSibling) {
          let paymentMadeLabel = transaction.firstChild.firstChild.nextSibling.nextSibling.firstChild.nextSibling;
          let paymentMadeLabelText = paymentMadeLabel.textContent;
          paymentMadeLabel.textContent = await Utility.getTranslation(user, paymentMadeLabelText);
        }
      }
    });

    upcomingTransactions.forEach(async (transaction, i) => {
      if (
        !utility.screen.smallTabPort[0].matches &&
        !utility.screen.largeMobileLand[0].matches &&
        !utility.screen.largeMobilePort[0].matches &&
        !utility.screen.smallMobileLand[0].matches &&
        !utility.screen.smallMobilePort[0].matches
      ) {
        transaction.classList.add('closed');
        let americanDate = Dates.getAmericanDate(utility.upcomingTransactionDates[i], utility, user);

        let date = transaction.firstChild.nextSibling.firstChild.textContent.replace(/myCalendar.getMonth()/, months.indexOf(myCalendar.getMonth()));
        if (await Compare.compareDateElements([splitMonthHeader[0], currentDay.textContent, splitMonthHeader[1]], americanDate, utility, user)) {
          transaction.classList.remove('closed');
          transaction.classList.add('open');
        }
      } else if (
        utility.screen.smallTabPort[0].matches ||
        utility.screen.largeMobileLand[0].matches ||
        utility.screen.largeMobilePort[0].matches ||
        utility.screen.smallMobileLand[0].matches ||
        utility.screen.smallMobilePort[0].matches
      ) {
        transaction.classList.add('closed');
        let americanDate = Dates.getAmericanDate(utility.upcomingTransactionDates[i], utility, user);

        if (await Compare.compareDateElements([splitMonthHeader[0], currentDay.textContent, splitMonthHeader[1]], americanDate, utility, user)) {
          transaction.classList.remove('closed');
          transaction.classList.add('open');
        }
      }
    });
    _watchDaySelection(utility.upcomingTransactionDates, utility, user);
  }

  // * This is where I am at for mobile phones.  The code below works for tablets to tvs.
  if (
    !utility.screen.smallTabPort[0].matches &&
    !utility.screen.largeMobileLand[0].matches &&
    !utility.screen.largeMobilePort[0].matches &&
    !utility.screen.smallMobileLand[0].matches &&
    !utility.screen.smallMobilePort[0].matches
  ) {
    const paymentChecks = document.querySelectorAll('.upcoming-bills__bill__bill-item__checkbox-container__payment-checkbox');
    paymentChecks.forEach((check, i) => {
      check.addEventListener('click', async (e) => {
        let transactionIndex = Number(check.closest('.upcoming-bills__bill').dataset.transaction);

        let upcomingBill = document.querySelectorAll('.upcoming-bills__bill')[i];

        let accountType = upcomingBill.firstChild.firstChild.textContent.split(' | ')[0];

        let transactionDate = utility.upcomingTransactionDates[i];

        // THE INDEX JUST UNDERNEATH WILL NEED TO CHANGE TO THE INDEX OF THE ACTUAL UPCOMING BILL, SO WE'LL NEED THE DATASET OF THE BILL HERE.
        let transactionLocation = placeholderBudget.transactions.plannedTransactions[transactionIndex].location;
        let transactionAmount = await translate(upcomingBill.firstChild.nextSibling.nextSibling.nextSibling.firstChild.textContent, { from: user.locale.split('-')[0], to: `en` });
        transactionAmount = transactionAmount.replace(/[^0-9,.]/g, '');

        transactionAmount = Number(transactionAmount);
        let transactionBill = new Transaction({ date: transactionDate, location: transactionLocation });
        let currentBill = placeholderBudget.transactions.plannedTransactions[transactionIndex];

        console.log(transactionDate);

        if (accountType === `Monthly Budget`) {
          transactionBill.transactionType = `Withdrawal`;
          transactionBill.addToReceipt({
            accountSelected: accountType,
            mainCategory: currentBill.category,
            subCategory: currentBill.subCategory,
            description: currentBill.name,
            amount: Number(currentBill.amount),
            scheduledPayment: transactionDate,
          });
        }
        if (accountType === `Expense Fund`) {
          transactionBill.transactionType = `Withdrawal`;
          transactionBill.addToReceipt({
            accountSelected: accountType,
            transactionType: currentBill.subAccount,
            timing: currentBill.timingOptions.paymentCycle,
            expenditure: currentBill.name,
            description: currentBill.name,
            amount: Number(currentBill.amount),
            scheduledPayment: transactionDate,
          });
        }
        if (accountType === `Surplus`) {
          transactionBill.transactionType = `Withdrawal`;
          transactionBill.addToReceipt({
            accountSelected: accountType,
            timing: currentBill.timingOptions.paymentCycle,
            expenditure: currentBill.name,
            description: currentBill.name,
            amount: Number(currentBill.amount),
            scheduledPayment: transactionDate,
          });
        }
        if (accountType === `Savings Fund`) {
          transactionBill.transactionType = `Withdrawal`;
          transactionBill.addToReceipt({
            accountSelected: accountType,
            timing: currentBill.timingOptions.paymentCycle,
            expenditure: currentBill.name,
            description: currentBill.name,
            amount: Number(currentBill.amount),
            scheduledPayment: transactionDate,
          });
        }
        if (accountType === `Debt`) {
          transactionBill.transactionType = `Withdrawal`;
          transactionBill.addToReceipt({
            accountSelected: accountType,
            lender: currentBill.lender,
            timing: currentBill.timingOptions.paymentCycle,
            expenditure: currentBill.name,
            description: currentBill.name,
            amount: Number(currentBill.amount),
            scheduledPayment: transactionDate,
          });
        }

        /*
         ~ What all of this is doing.
         @ 1. Get necessary variables.
         @ 2. Build transaction object for recent transactions.
         @ 3. Filter out transaction from payment schedule transaction is in.
         @ 4. Update planned transaction if payment schedule is empty or not.
         @ 5. Update the items needed for the update object.
        */

        console.log(currentBill);
        // ~ If current bill's payment cycle is NOT Bi-Monthly or Bi-Annual.
        if (currentBill.timingOptions.paymentCycle !== `Bi-Monthly` && currentBill.timingOptions.paymentCycle !== `Bi-Annual`) {
          // LOOP THROUGH MAIN CATEGORIES
          // * Making sure that the planned transaction is from the monthly budget before filtering it out.
          if (currentBill.account === `Monthly Budget`) {
            placeholderBudget.mainCategories.forEach((mc, i) => {
              // IF MAIN CATEGORY MATCHES THE CURRENT BILL CATEGORY, LOOP THROUGH ITS SUBCATEGORIES
              if (mc.title === currentBill.category) {
                mc.subCategories.forEach((sc, i) => {
                  if (sc.title === currentBill.name) {
                    console.log(sc.timingOptions.paymentCycle !== `Bi-Monthly` && sc.timingOptions.paymentCycle !== `Bi-Annual`);
                    // IF SUB CATEGORY MATCHES CURRENT BILL SUB CATEGORY NAME, DOUBLE CHECK PAYMENT CYCLE.
                    if (sc.timingOptions.paymentCycle !== `Bi-Monthly` && sc.timingOptions.paymentCycle !== `Bi-Annual`) {
                      sc.timingOptions.paymentSchedule = sc.timingOptions.paymentSchedule.filter((date) => {
                        if (
                          DateTime.fromISO(date).set({ hour: 0, minute: 0, second: 0, millisecond: 0 }).toISO() !==
                          DateTime.fromISO(transactionDate).set({ hour: 0, minute: 0, second: 0, millisecond: 0 }).toISO()
                        ) {
                          return date;
                        }
                      });
                    }
                    if (sc.timingOptions.paymentCycle === `Bi-Monthly` || sc.timingOptions.paymentCycle === `Bi-Annual`) {
                      sc.timingOptions.paymentSchedule.forEach((dateArray, i) => {
                        sc.timingOptions.paymentSchedule[i] = dateArray.filter((date) => {
                          if (
                            DateTime.fromISO(date).set({ hour: 0, minute: 0, second: 0, millisecond: 0 }).toISO() !==
                            DateTime.fromISO(transactionDate).set({ hour: 0, minute: 0, second: 0, millisecond: 0 }).toISO()
                          ) {
                            return date;
                          }
                        });
                      });
                    }
                    console.log(sc);
                    console.log(sc.timingOptions.paymentSchedule);
                  }
                });
              }
            });
          } else {
            // * Otherwise, if it is not a part of the monthly budget, this is where it will be filtered out.
            currentBill.timingOptions.paymentSchedule = currentBill.timingOptions.paymentSchedule.filter((date) => {
              return (
                new Date(DateTime.fromISO(date).set({ hour: 0, minute: 0, second: 0, millisecond: 0 }).toBSON()) !==
                new Date(DateTime.fromISO(transactionDate).set({ hour: 0, minute: 0, second: 0, millisecond: 0 }).toBSON())
              );
            });
          }
        }
        console.log(currentBill);
        // ~ If current bill's payment cycle IS Bi-Monthly or Bi-Annual.
        if (currentBill.timingOptions.paymentCycle === `Bi-Monthly` || currentBill.timingOptions.paymentCycle === `Bi-Annual`) {
          currentBill.timingOptions.paymentSchedule.forEach((dateArray, i) => {
            currentBill.timingOptions.paymentSchedule[i] = dateArray.filter((date) => {
              if (
                DateTime.fromISO(date).set({ hour: 0, minute: 0, second: 0, millisecond: 0 }).toISO() !==
                DateTime.fromISO(transactionDate).set({ hour: 0, minute: 0, second: 0, millisecond: 0 }).toISO()
              ) {
                return date;
              }
            });
          });
        }

        // ~ Updating the current bill as far as if it paid or partially paid.
        if (currentBill.timingOptions.paymentCycle !== `Bi-Monthly` && currentBill.timingOptions.paymentCycle !== `Bi-Annual`) {
          if (currentBill.timingOptions.paymentSchedule.length === 0) {
            currentBill.paid = !currentBill.paid;
            currentBill.paidStatus = `Paid`;
            placeholderBudget.transactions.plannedTransactions = placeholderBudget.transactions.plannedTransactions.filter((transaction) => {
              return transaction !== currentBill;
            });
          }
          if (currentBill.timingOptions.paymentSchedule.length > 0) {
            currentBill.paidStatus = `Partially Paid`;
          }
        }
        if (currentBill.timingOptions.paymentCycle === `Bi-Monthly` || currentBill.timingOptions.paymentCycle === `Bi-Annual`) {
          currentBill.timingOptions.paymentSchedule = currentBill.timingOptions.paymentSchedule.filter((array) => {
            return array.length > 0;
          });
          if (currentBill.timingOptions.paymentSchedule.length === 0) {
            currentBill.paid = !currentBill.paid;
            currentBill.paidStatus = `Paid`;
            placeholderBudget.transactions.plannedTransactions = placeholderBudget.transactions.plannedTransactions.filter((transaction) => {
              return transaction !== currentBill;
            });
          }
          if (currentBill.timingOptions.paymentSchedule.length > 0) {
            currentBill.paidStatus = `Partially Paid`;
          }
        }

        // ~ Making changes to placeholder budget for update.
        console.log(transactionBill, placeholderBudget.transactions.recentTransactions);
        placeholderBudget.transactions.recentTransactions.push(transactionBill);
        let budgetId = window.location.href.split('/')[7];
        let updateObject = {
          budgetId: budgetId,
          userId: user._id,
        };
        updateObject.transactions = placeholderBudget.transactions;
        console.log(updateObject.transactions.recentTransactions[updateObject.transactions.recentTransactions.length - 1].receipt);
        updateObject.transactions = placeholderBudget.transactions;
        updateObject.transactions.recentTransactions[updateObject.transactions.recentTransactions.length - 1].receipt.forEach((receiptItem, i) => {
          if (receiptItem.account === `Monthly Budget`) {
            let accountFilteredPlans = placeholderBudget.transactions.plannedTransactions.filter((plan) => {
              return plan.account === receiptItem.account;
            });
            let amountSaved = accountFilteredPlans.reduce((total, plan) => {
              return (total += plan.amountSaved);
            }, 0);
            if (currentBill.amountSaved > 0) {
              amountSaved -= currentBill.amountSaved;
            }
            if (placeholderBudget.accounts.monthlyBudget.amount - amountSaved - Number(receiptItem.amount) < 0) {
              return console.error(`You do not have enough to make that transaction.`);
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
            placeholderBudget.accounts.emergencyFund.amount = placeholderBudget.accounts.emergencyFund.amount - Number(receiptItem.amount);
          }
          if (receiptItem.account === `Savings Fund`) {
            placeholderBudget.accounts.savingsFund.amount = placeholderBudget.accounts.savingsFund.amount - Number(receiptItem.amount);
          }
          if (receiptItem.account === `Expense Fund`) {
            placeholderBudget.accounts.expenseFund.amount = placeholderBudget.accounts.expenseFund.amount - Number(receiptItem.amount);
          }
          if (receiptItem.account === `Surplus`) {
            placeholderBudget.accounts.surlus.amount = placeholderBudget.accounts.surplus.amount - Number(receiptItem.amount);
          }
          if (receiptItem.account === `Debt`) {
            placeholderBudget.accounts.debt.amount = placeholderBudget.accounts.debt.amount - Number(receiptItem.amount);
            // * This is where it still needs work on the debt planned transactions to affect the total debt owed.
            /* After reducing the amount that is allocated to the debt account, there needs to be a reduction of the debt amount through reducing the current amount owed for the debt that was selected.
  
            To do that we need to:
            1) Find the exact debt that is being paid.
            2) From there, reduce it's amountOwed amount.
  
            There is more steps to each of those, especially the first, but that is what needs to be done.
            */
          }
        });
        // * THIS WILL NEED TO BE RE-INSTATED AS PART OF THE PROJECT WHEN THE DEBTS ARE TAKEN CARE OF FULLY.
        // upcomingBill.remove();
        // updateObject.accounts = placeholderBudget.accounts;
        // placeholderBudget._updateBudget({ updateObject: updateObject }, `Dashboard`);
        // Utility.reloadPage();
      });
    });
  } else if (
    utility.screen.smallTabPort[0].matches ||
    utility.screen.largeMobileLand[0].matches ||
    utility.screen.largeMobilePort[0].matches ||
    utility.screen.smallMobileLand[0].matches ||
    utility.screen.smallMobilePort[0].matches
  ) {
    // * This is where I am at for mobile phones.  The code below is for mobile phones.
    const paymentChecks = document.querySelectorAll('.r__upcoming-bills__bill__header__bill-paid-or-not__payment-checkbox');
    paymentChecks.forEach((check, i) => {
      check.addEventListener('click', async (e) => {
        let transactionIndex = Number(check.closest('.upcoming-bills__bill').dataset.transaction);

        let upcomingBill = document.querySelectorAll('.upcoming-bills__bill')[i];

        let accountType = upcomingBill.firstChild.firstChild.textContent.split(' | ')[0];

        let transactionDate = utility.upcomingTransactionDates[i];

        // THE INDEX JUST UNDERNEATH WILL NEED TO CHANGE TO THE INDEX OF THE ACTUAL UPCOMING BILL, SO WE'LL NEED THE DATASET OF THE BILL HERE.
        let transactionLocation = placeholderBudget.transactions.plannedTransactions[transactionIndex].location;
        let transactionAmount = await translate(upcomingBill.firstChild.nextSibling.firstChild.nextSibling.textContent, { from: user.locale.split('-')[0], to: `en` });
        transactionAmount = transactionAmount.replace(/[^0-9,.]/g, '');

        transactionAmount = Number(transactionAmount);
        let transactionBill = new Transaction({ date: transactionDate, location: transactionLocation });
        let currentBill = placeholderBudget.transactions.plannedTransactions[transactionIndex];

        console.log(transactionDate);

        if (accountType === `Monthly Budget`) {
          transactionBill.transactionType = `Withdrawal`;
          transactionBill.addToReceipt({
            accountSelected: accountType,
            mainCategory: currentBill.category,
            subCategory: currentBill.subCategory,
            description: currentBill.name,
            amount: Number(currentBill.amount),
            scheduledPayment: transactionDate,
          });
        }
        if (accountType === `Expense Fund`) {
          transactionBill.transactionType = `Withdrawal`;
          transactionBill.addToReceipt({
            accountSelected: accountType,
            transactionType: currentBill.subAccount,
            timing: currentBill.timingOptions.paymentCycle,
            expenditure: currentBill.name,
            description: currentBill.name,
            amount: Number(currentBill.amount),
            scheduledPayment: transactionDate,
          });
        }
        if (accountType === `Surplus`) {
          transactionBill.transactionType = `Withdrawal`;
          transactionBill.addToReceipt({
            accountSelected: accountType,
            timing: currentBill.timingOptions.paymentCycle,
            expenditure: currentBill.name,
            description: currentBill.name,
            amount: Number(currentBill.amount),
            scheduledPayment: transactionDate,
          });
        }
        if (accountType === `Savings Fund`) {
          transactionBill.transactionType = `Withdrawal`;
          transactionBill.addToReceipt({
            accountSelected: accountType,
            timing: currentBill.timingOptions.paymentCycle,
            expenditure: currentBill.name,
            description: currentBill.name,
            amount: Number(currentBill.amount),
            scheduledPayment: transactionDate,
          });
        }
        if (accountType === `Debt`) {
          transactionBill.transactionType = `Withdrawal`;
          transactionBill.addToReceipt({
            accountSelected: accountType,
            lender: currentBill.lender,
            timing: currentBill.timingOptions.paymentCycle,
            expenditure: currentBill.name,
            description: currentBill.name,
            amount: Number(currentBill.amount),
            scheduledPayment: transactionDate,
          });
        }

        /*
         ~ What all of this is doing.
         @ 1. Get necessary variables.
         @ 2. Build transaction object for recent transactions.
         @ 3. Filter out transaction from payment schedule transaction is in.
         @ 4. Update planned transaction if payment schedule is empty or not.
         @ 5. Update the items needed for the update object.
        */

        console.log(currentBill);
        // ~ If current bill's payment cycle is NOT Bi-Monthly or Bi-Annual.
        if (currentBill.timingOptions.paymentCycle !== `Bi-Monthly` && currentBill.timingOptions.paymentCycle !== `Bi-Annual`) {
          // LOOP THROUGH MAIN CATEGORIES
          // * Making sure that the planned transaction is from the monthly budget before filtering it out.
          if (currentBill.account === `Monthly Budget`) {
            placeholderBudget.mainCategories.forEach((mc, i) => {
              // IF MAIN CATEGORY MATCHES THE CURRENT BILL CATEGORY, LOOP THROUGH ITS SUBCATEGORIES
              if (mc.title === currentBill.category) {
                mc.subCategories.forEach((sc, i) => {
                  if (sc.title === currentBill.name) {
                    console.log(sc.timingOptions.paymentCycle !== `Bi-Monthly` && sc.timingOptions.paymentCycle !== `Bi-Annual`);
                    // IF SUB CATEGORY MATCHES CURRENT BILL SUB CATEGORY NAME, DOUBLE CHECK PAYMENT CYCLE.
                    if (sc.timingOptions.paymentCycle !== `Bi-Monthly` && sc.timingOptions.paymentCycle !== `Bi-Annual`) {
                      sc.timingOptions.paymentSchedule = sc.timingOptions.paymentSchedule.filter((date) => {
                        if (
                          DateTime.fromISO(date).set({ hour: 0, minute: 0, second: 0, millisecond: 0 }).toISO() !==
                          DateTime.fromISO(transactionDate).set({ hour: 0, minute: 0, second: 0, millisecond: 0 }).toISO()
                        ) {
                          return date;
                        }
                      });
                    }
                    if (sc.timingOptions.paymentCycle === `Bi-Monthly` || sc.timingOptions.paymentCycle === `Bi-Annual`) {
                      sc.timingOptions.paymentSchedule.forEach((dateArray, i) => {
                        sc.timingOptions.paymentSchedule[i] = dateArray.filter((date) => {
                          if (
                            DateTime.fromISO(date).set({ hour: 0, minute: 0, second: 0, millisecond: 0 }).toISO() !==
                            DateTime.fromISO(transactionDate).set({ hour: 0, minute: 0, second: 0, millisecond: 0 }).toISO()
                          ) {
                            return date;
                          }
                        });
                      });
                    }
                    console.log(sc);
                    console.log(sc.timingOptions.paymentSchedule);
                  }
                });
              }
            });
          } else {
            // * Otherwise, if it is not a part of the monthly budget, this is where it will be filtered out.
            currentBill.timingOptions.paymentSchedule = currentBill.timingOptions.paymentSchedule.filter((date) => {
              return (
                new Date(DateTime.fromISO(date).set({ hour: 0, minute: 0, second: 0, millisecond: 0 }).toBSON()) !==
                new Date(DateTime.fromISO(transactionDate).set({ hour: 0, minute: 0, second: 0, millisecond: 0 }).toBSON())
              );
            });
          }
        }
        console.log(currentBill);
        // ~ If current bill's payment cycle IS Bi-Monthly or Bi-Annual.
        if (currentBill.timingOptions.paymentCycle === `Bi-Monthly` || currentBill.timingOptions.paymentCycle === `Bi-Annual`) {
          currentBill.timingOptions.paymentSchedule.forEach((dateArray, i) => {
            currentBill.timingOptions.paymentSchedule[i] = dateArray.filter((date) => {
              if (
                DateTime.fromISO(date).set({ hour: 0, minute: 0, second: 0, millisecond: 0 }).toISO() !==
                DateTime.fromISO(transactionDate).set({ hour: 0, minute: 0, second: 0, millisecond: 0 }).toISO()
              ) {
                return date;
              }
            });
          });
        }

        // ~ Updating the current bill as far as if it paid or partially paid.
        if (currentBill.timingOptions.paymentCycle !== `Bi-Monthly` && currentBill.timingOptions.paymentCycle !== `Bi-Annual`) {
          if (currentBill.timingOptions.paymentSchedule.length === 0) {
            currentBill.paid = !currentBill.paid;
            currentBill.paidStatus = `Paid`;
            placeholderBudget.transactions.plannedTransactions = placeholderBudget.transactions.plannedTransactions.filter((transaction) => {
              return transaction !== currentBill;
            });
          }
          if (currentBill.timingOptions.paymentSchedule.length > 0) {
            currentBill.paidStatus = `Partially Paid`;
          }
        }
        if (currentBill.timingOptions.paymentCycle === `Bi-Monthly` || currentBill.timingOptions.paymentCycle === `Bi-Annual`) {
          currentBill.timingOptions.paymentSchedule = currentBill.timingOptions.paymentSchedule.filter((array) => {
            return array.length > 0;
          });
          if (currentBill.timingOptions.paymentSchedule.length === 0) {
            currentBill.paid = !currentBill.paid;
            currentBill.paidStatus = `Paid`;
            placeholderBudget.transactions.plannedTransactions = placeholderBudget.transactions.plannedTransactions.filter((transaction) => {
              return transaction !== currentBill;
            });
          }
          if (currentBill.timingOptions.paymentSchedule.length > 0) {
            currentBill.paidStatus = `Partially Paid`;
          }
        }

        // ~ Making changes to placeholder budget for update.
        console.log(transactionBill, placeholderBudget.transactions.recentTransactions);
        placeholderBudget.transactions.recentTransactions.push(transactionBill);
        let budgetId = window.location.href.split('/')[7];
        let updateObject = {
          budgetId: budgetId,
          userId: user._id,
        };
        updateObject.transactions = placeholderBudget.transactions;
        console.log(updateObject.transactions.recentTransactions[updateObject.transactions.recentTransactions.length - 1].receipt);
        updateObject.transactions = placeholderBudget.transactions;
        updateObject.transactions.recentTransactions[updateObject.transactions.recentTransactions.length - 1].receipt.forEach((receiptItem, i) => {
          if (receiptItem.account === `Monthly Budget`) {
            let accountFilteredPlans = placeholderBudget.transactions.plannedTransactions.filter((plan) => {
              return plan.account === receiptItem.account;
            });
            let amountSaved = accountFilteredPlans.reduce((total, plan) => {
              return (total += plan.amountSaved);
            }, 0);
            if (currentBill.amountSaved > 0) {
              amountSaved -= currentBill.amountSaved;
            }
            if (placeholderBudget.accounts.monthlyBudget.amount - amountSaved - Number(receiptItem.amount) < 0) {
              return console.error(`You do not have enough to make that transaction.`);
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
            placeholderBudget.accounts.emergencyFund.amount = placeholderBudget.accounts.emergencyFund.amount - Number(receiptItem.amount);
          }
          if (receiptItem.account === `Savings Fund`) {
            placeholderBudget.accounts.savingsFund.amount = placeholderBudget.accounts.savingsFund.amount - Number(receiptItem.amount);
          }
          if (receiptItem.account === `Expense Fund`) {
            placeholderBudget.accounts.expenseFund.amount = placeholderBudget.accounts.expenseFund.amount - Number(receiptItem.amount);
          }
          if (receiptItem.account === `Surplus`) {
            placeholderBudget.accounts.surlus.amount = placeholderBudget.accounts.surplus.amount - Number(receiptItem.amount);
          }
          if (receiptItem.account === `Debt`) {
            placeholderBudget.accounts.debt.amount = placeholderBudget.accounts.debt.amount - Number(receiptItem.amount);
            // * This is where it still needs work on the debt planned transactions to affect the total debt owed.
            /* After reducing the amount that is allocated to the debt account, there needs to be a reduction of the debt amount through reducing the current amount owed for the debt that was selected.
  
            To do that we need to:
            1) Find the exact debt that is being paid.
            2) From there, reduce it's amountOwed amount.
  
            There is more steps to each of those, especially the first, but that is what needs to be done.
            */
          }
        });
        // * THIS WILL NEED TO BE RE-INSTATED AS PART OF THE PROJECT WHEN THE DEBTS ARE TAKEN CARE OF FULLY.
        // upcomingBill.remove();
        // updateObject.accounts = placeholderBudget.accounts;
        // placeholderBudget._updateBudget({ updateObject: updateObject }, `Dashboard`);
        // Utility.reloadPage();
      });
    });
  }
};
