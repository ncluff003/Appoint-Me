import * as Utility from './../Application/Utility';
import { DateTime } from 'luxon';
import { myCalendar } from '../Classes/FrontEnd-Calendar';

const getSubCategoryTiming = (category) => {
  let wording;
  let categoryDueDate = category.timingOptions.dueDates[0]; // * This proves that there will be a need for duedates in the model.

  if (category.timingOptions.paymentCycle === `Weekly`) {
    let day = DateTime.fromISO(categoryDueDate).weekdayLong;
    let date = DateTime.fromISO(categoryDueDate).day;
    let month = DateTime.fromISO(categoryDueDate).monthLong;
    wording = `Due every ${day}, starting the ${date}${myCalendar.getDaySuffix(date)} of ${month}.`;
    return wording;
  }

  if (category.timingOptions.paymentCycle === `Bi-Weekly`) {
    let date = DateTime.fromISO(categoryDueDate).day;
    let month = DateTime.fromISO(categoryDueDate).monthLong;

    wording = `Due every 2 weeks. Next due date is the ${date}${myCalendar.getDaySuffix(date)} of ${month}.`;
    return wording;
  }
  if (category.timingOptions.paymentCycle === `Bi-Monthly`) {
    let categoryDueDate2 = category.timingOptions.dueDates[1];
    let date = DateTime.fromISO(categoryDueDate).day;
    let date2 = DateTime.fromISO(categoryDueDate2).day;

    wording = `Due the ${date}${myCalendar.getDaySuffix(date)} & ${date2}${myCalendar.getDaySuffix(date2)}, of every month.`;
    return wording;
  }
  if (category.timingOptions.paymentCycle === `Monthly`) {
    let date = DateTime.fromISO(categoryDueDate).day;

    wording = `Due the ${date}${myCalendar.getDaySuffix(date)} of every month`;
    return wording;
  }
};

export const editCategoryGoals = (placeholderBudget, user, utility) => {
  const editCategoryGoalsContainer = document.querySelectorAll('.container--large')[0];
  if (editCategoryGoalsContainer) {
    const subCategories = document.querySelectorAll('.sub-category-display__sub-category');
    const editCategoryGoalsSubmit = document.querySelector('.button--large__thin');

    let allCategories = [];
    placeholderBudget.mainCategories.forEach((mct, i) => {
      placeholderBudget.mainCategories[i].subCategories.forEach((sc, i) => {
        allCategories.push(sc);
      });
    });

    allCategories.forEach((c, i) => {
      if (c.timingOptions.paymentCycle) {
        let timing = getSubCategoryTiming(c);
        if (subCategories[i]) {
          if (subCategories[i].firstChild.nextSibling.firstChild.nextSibling) subCategories[i].firstChild.nextSibling.firstChild.nextSibling.textContent = timing;
        }
      }
    });

    placeholderBudget.setupGoalSetting();
    const timingContainer = document.querySelector('.timing-container');
    const largeContainer = document.querySelector('.container--large');
    if (largeContainer) {
      if (timingContainer) {
        timingContainer.style.position = `absolute`;
      }
    }

    const individualPayments = document.querySelectorAll('.individual-payment');
    const budgetMonthTotals = document.querySelectorAll('.budget-single-goal-summary__amount');
    let overallBudget = budgetMonthTotals[0];
    let overallSpent = budgetMonthTotals[1];
    let overallRemaining = budgetMonthTotals[2];
    let overallPercentageSpent = budgetMonthTotals[3];

    let total = 0;
    let totalSpent = 0;
    placeholderBudget.mainCategories.forEach((mc) => mc.subCategories.forEach((sc) => (total += sc.goalAmount)));
    placeholderBudget.mainCategories.forEach((mc) => mc.subCategories.forEach((sc) => (totalSpent += sc.amountSpent)));

    if (overallRemaining) {
      if (total - totalSpent < 0) {
        Utility.replaceClassName(overallRemaining, `positive`, `negative`);
      }
      if (total - totalSpent === 0) {
        Utility.removeClasses(overallRemaining, [`positive`, `negative`]);
      }
      if (total - totalSpent > 0) {
        Utility.replaceClassName(overallRemaining, `negative`, `positive`);
      }
    }

    individualPayments.forEach((ip, i) => {
      if (!utility.screen.largeMobileLand[0].matches && !utility.screen.largeMobilePort[0].matches && !utility.screen.smallMobileLand[0].matches && !utility.screen.smallMobilePort[0].matches) {
        if (utility.permissions.admin === true) {
          let remainingValue = ip.closest('section').nextSibling.nextSibling.firstChild;
          if (Number(remainingValue.textContent.split('$')[1]) > 0) {
            Utility.replaceClassName(remainingValue, `negative`, `positive`);
          }
          if (Number(remainingValue.textContent.split('$')[1]) === 0) {
            Utility.removeClasses(remainingValue, [`positive`, `negative`]);
          }
          if (Number(remainingValue.textContent.split('$')[1]) < 0) {
            Utility.replaceClassName(remainingValue, `positive`, `negative`);
          }
          ip.addEventListener('keyup', (e) => {
            e.preventDefault();

            let mainCategoryIndex = ip.closest(`.sub-category-display__sub-category`).dataset.subcategory;
            let subCategoryTitle = ip.closest(`.sub-category-display__sub-category`).firstChild.nextSibling.firstChild.textContent;
            let subCategoryIndex;
            placeholderBudget.mainCategories[mainCategoryIndex].subCategories.forEach((sc, i) => {
              if (sc.title === subCategoryTitle) subCategoryIndex = i;
            });
            let subCategory = placeholderBudget.mainCategories[mainCategoryIndex].subCategories[subCategoryIndex];
            subCategory.goalAmount = Number(Math.round(ip.value * 100) / 100);
            subCategory.amountRemaining = subCategory.goalAmount - subCategory.amountSpent;
            subCategory.percentageSpent = subCategory.amountSpent / subCategory.goalAmount;
            subCategory.percentageSpent === NaN ? (subCategory.percentageSpent = 0) : (subCategory.percentageSpent = subCategory.percentageSpent);

            let spent = ip.closest('section').nextSibling.firstChild;
            let remaining = ip.closest('section').nextSibling.nextSibling.firstChild;
            let percentageSpent = ip.closest('section').nextSibling.nextSibling.nextSibling.firstChild;

            let total = 0;
            let totalSpent = 0;

            placeholderBudget.mainCategories.forEach((mc) => mc.subCategories.forEach((sc) => (total += sc.goalAmount)));
            placeholderBudget.mainCategories.forEach((mc) => mc.subCategories.forEach((sc) => (totalSpent += sc.amountSpent)));
            let percentage = totalSpent / total;
            percentage === NaN ? (percentage = 0) : (percentage = percentage);

            overallBudget.textContent = utility.money.format(total);
            overallSpent.textContent = utility.money.format(totalSpent);
            overallRemaining.textContent = utility.money.format(total - totalSpent);
            overallPercentageSpent.textContent = `${percentage.toFixed(2)}%`;

            spent.textContent = utility.money.format(subCategory.amountSpent);
            remaining.textContent = utility.money.format(subCategory.amountRemaining);

            if (total - totalSpent < 0) {
              Utility.replaceClassName(overallRemaining, `positive`, `negative`);
            }
            if (total - totalSpent === 0) {
              Utility.removeClasses(overallRemaining, [`positive`, `negative`]);
            }
            if (total - totalSpent > 0) {
              Utility.replaceClassName(overallRemaining, `negative`, `positive`);
            }

            let singlePercent = subCategory.amountSpent / subCategory.goalAmount;
            singlePercent === NaN ? (singlePercent = 0) : (singlePercent = singlePercent);
            percentageSpent.textContent = `${singlePercent.toFixed(2)}%`;

            // * The remaining code here is to add the correct classes to the remaining amount of the impacted sub category.
            if (subCategory.amountRemaining > 0) {
              Utility.replaceClassName(remaining, `negative`, `positive`);
            }
            if (subCategory.amountRemaining === 0) {
              Utility.removeClasses(remaining, [`positive`, `negative`]);
            }
            if (subCategory.amountRemaining < 0) {
              Utility.replaceClassName(remaining, `positive`, `negative`);
            }
          });
          ip.addEventListener('blur', (e) => {
            e.preventDefault();
            ip.value = Number(Math.round(ip.value * 100) / 100);
          });
        } else {
          ip.readOnly = true;
        }
      }
    });
    if (editCategoryGoalsSubmit) {
      if (utility.permissions.admin === true) {
        editCategoryGoalsSubmit.addEventListener('click', (e) => {
          e.preventDefault();

          const budgetId = window.location.href.split('/')[7];
          let updateObject = {};
          updateObject.budgetId = budgetId;
          updateObject.userId = user._id;
          updateObject.mainCategories = placeholderBudget.mainCategories;
          placeholderBudget._updateBudget(
            {
              budgetId: budgetId,
              userId: user._id,
              updateObject: updateObject,
            },
            `Edit-Category-Goals`
          );
          Utility.reloadPage();
        });
      } else {
        Utility.addClasses(editCategoryGoalsSubmit, [`disabled`]);
      }
    }
  }
};
