import * as Utility from './../../Application/Utility';
import { get, getAll, set, timeTillExpires, remove, useNamespace } from './../../Classes/Cache';
import { myCalendar } from '../../Classes/FrontEnd-Calendar';
import { DateTime } from 'luxon';

export const closeTimingContainer = () => {
  const timingContainer = document.querySelector('.timing-container');
  Utility.replaceClassName(timingContainer, `open`, `closed`);
  removeEventListener(`click`, closeTimingContainer);
};

export const openTimingContainer = () => {
  const timingContainer = document.querySelector('.timing-container');
  Utility.replaceClassName(timingContainer, `closed`, `open`);
};

export const insertTiming = (budget, target, button) => {
  console.log(target);
  let timing = button.textContent;
  const timingSectionInputs = document.querySelectorAll('.timing-container__section__label__input');
  let monthlyTimingInput = timingSectionInputs[0];
  let biMonthlyTimingInputOne = timingSectionInputs[1];
  let biMonthlyTimingInputTwo = timingSectionInputs[2];
  let biWeeklyTimingInput = timingSectionInputs[3];
  const weeklyTimingSelect = document.querySelector('.timing-container__section__label__select');
  let timingArray = [];
  let paymentArray = [];
  let startingIteration = 0;
  let numberOfIterations, mainCategoryIndex, subCategoryIndex;
  console.log(target);
  let subCategoryTitle;
  const largeContainer = document.querySelector('.container--large');
  let utility = get('utility');
  if (largeContainer) {
    if (!utility.screen.largeMobileLand[0].matches && !utility.screen.largeMobilePort[0].matches && !utility.screen.smallMobileLand[0].matches && !utility.screen.smallMobilePort[0].matches) {
      subCategoryTitle = target.closest(`.sub-category-display__sub-category__section`).firstChild.textContent;
    } else if (utility.screen.largeMobileLand[0].matches || utility.screen.largeMobilePort[0].matches || utility.screen.smallMobileLand[0].matches || utility.screen.smallMobilePort[0].matches) {
      subCategoryTitle = target.closest('header').firstChild.textContent;
    }
  } else {
    if (!utility.screen.largeMobileLand[0].matches && !utility.screen.largeMobilePort[0].matches && !utility.screen.smallMobileLand[0].matches && !utility.screen.smallMobilePort[0].matches) {
      subCategoryTitle = target.closest('.sub-category--month-view__section').firstChild.textContent;
    } else if (utility.screen.largeMobileLand[0].matches || utility.screen.largeMobilePort[0].matches || utility.screen.smallMobileLand[0].matches || utility.screen.smallMobilePort[0].matches) {
      subCategoryTitle = target.closest('header').firstChild.textContent;
    }
  }
  let mainCategoryTitle = document.querySelector('.main-category-display__category-display__title');
  let currentDate = DateTime.now().toISO();
  if (DateTime.fromISO(monthlyTimingInput.value).toISO() < currentDate) return; // * These four need better error handling.  Users need to know when their selections are hindering their ability to set a timing.
  if (DateTime.fromISO(biMonthlyTimingInputOne.value).toISO() < currentDate) return;
  if (DateTime.fromISO(biMonthlyTimingInputTwo.value).toISO() < currentDate) return;
  if (DateTime.fromISO(biWeeklyTimingInput.value).toISO() < currentDate) return;

  // ~ It will be important to review this code for the Edit Category Goals page.
  console.log(target, timing);
  budget.mainCategories.forEach((category, i) => {
    if (category.title === mainCategoryTitle.textContent) {
      mainCategoryIndex = i;
      category.subCategories.forEach((sc, i) => {
        if (sc.title === subCategoryTitle) {
          subCategoryIndex = i;
        }
      });
    }
  });

  if (timing === `Monthly`) {
    let selectedDate = DateTime.fromISO(monthlyTimingInput.value);
    paymentArray.push(selectedDate.toISO());
    numberOfIterations = 11;
    while (startingIteration < numberOfIterations) {
      selectedDate = selectedDate.plus({ month: 1 });
      paymentArray.push(selectedDate.toISO());
      startingIteration++;
    }
    target.textContent = `Due the ${DateTime.fromISO(monthlyTimingInput.value).day}${myCalendar.getDaySuffix(DateTime.fromISO(monthlyTimingInput.value).day)} of every month.`;
  }

  if (timing === `Bi-Monthly`) {
    let selectedDateOne = DateTime.fromISO(biMonthlyTimingInputOne.value);
    let selectedDateTwo = DateTime.fromISO(biMonthlyTimingInputTwo.value);

    if (selectedDateOne.month !== selectedDateTwo.month) return;
    paymentArray.push([selectedDateOne.toISO(), selectedDateTwo.toISO()]);
    numberOfIterations = 11;
    while (startingIteration < numberOfIterations) {
      let paymentMonth = [];
      selectedDateOne = selectedDateOne.plus({ month: 1 });
      selectedDateTwo = selectedDateTwo.plus({ month: 1 });
      paymentMonth.push(selectedDateOne.toISO(), selectedDateTwo.toISO());
      paymentArray.push(paymentMonth);
      startingIteration++;
    }
    target.textContent = `Due the ${DateTime.fromISO(biMonthlyTimingInputOne.value).day}${myCalendar.getDaySuffix(DateTime.fromISO(biMonthlyTimingInputOne.value).day)} & ${
      DateTime.fromISO(biMonthlyTimingInputTwo.value).day
    }${myCalendar.getDaySuffix(DateTime.fromISO(biMonthlyTimingInputTwo.value).day)} of every month.`;
  }

  if (timing === `Bi-Weekly`) {
    let selectedDate = DateTime.fromISO(biWeeklyTimingInput.value);
    paymentArray.push(selectedDate.toISO());
    numberOfIterations = 25;
    while (startingIteration < numberOfIterations) {
      selectedDate = selectedDate.plus({ days: 14 });
      paymentArray.push(selectedDate.toISO());
      startingIteration++;
    }

    target.textContent = `Due every 2 weeks starting on the ${DateTime.fromISO(biWeeklyTimingInput.value).day}${myCalendar.getDaySuffix(DateTime.fromISO(biWeeklyTimingInput.value).day)} of ${
      DateTime.fromISO(biWeeklyTimingInput.value).monthLong
    }.`;
  }

  if (timing === `Weekly`) {
    let selectedWeekday = weeklyTimingSelect.value;
    let nextWeekdayDate;
    let currentDate = DateTime.now();
    let daysPast = 0;
    numberOfIterations = 51;

    while (daysPast < 8) {
      if (daysPast > 0 && currentDate.weekdayLong === selectedWeekday) {
        nextWeekdayDate = currentDate;
      }
      currentDate = currentDate.plus({ day: 1 });
      daysPast++;
    }

    let date = nextWeekdayDate;
    paymentArray.push(nextWeekdayDate.toISO());
    while (startingIteration < numberOfIterations) {
      nextWeekdayDate = nextWeekdayDate.plus({ days: 7 });
      paymentArray.push(nextWeekdayDate.toISO());
      startingIteration++;
    }

    target.textContent = `Due every ${weeklyTimingSelect.value}, starting the ${date.day}${myCalendar.getDaySuffix(date)} of ${date.monthLong}.`;
  }
  budget._updateSubCategoryTiming({
    index: mainCategoryIndex,
    subCategoryIndex: subCategoryIndex,
    paymentCycle: timing,
    paymentSchedule: paymentArray,
  });
  closeTimingContainer();
};
