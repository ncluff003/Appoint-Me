import * as Utility from './../Application/Utility';

export const manageCategories = (placeholderBudget, user, utility) => {
  const mediumContainers = document.querySelectorAll('.container--medium');
  const manageCategoryContainer = mediumContainers[0];
  if (manageCategoryContainer) {
    placeholderBudget.setupCreation(user, manageCategoryContainer, `page display`, `pages`, `number`, utility);
    const subCategories = document.querySelectorAll('.sub-category');
    const mainCategoryDeleteButton = document.querySelector('.button--medium-main-category-deletion');
    if ((utility.permissions && utility.permissions.admin === true) || utility.creatingBudget === true) {
      mainCategoryDeleteButton.addEventListener(`click`, (e) => {
        e.preventDefault();
        let mainCategories = document.querySelectorAll('.main-category__alt');
        let index;
        mainCategories.forEach((category, i) => {
          if (category.classList.contains('main-category__alt__selected')) {
            index = i;
          }
        });
        placeholderBudget._removeMainCategory(index, mainCategories[index]);
        subCategories.forEach((sc) => {
          if (sc.dataset.category === `${index}`) {
            sc.remove();
          } else {
            if (Number(sc.dataset.category) > index) {
              sc.dataset.category = `${Number(sc.dataset.category) - 1}`;
            }
          }
        });

        mainCategories = document.querySelectorAll('.main-category__alt');
        mainCategories.forEach((category, i) => (category.dataset.category = i));
        index--;
        if (index < 0) {
          index = 0;
        }
        placeholderBudget.selectCategory(index);
      });
    }
    if (utility.permissions && utility.permissions.admin === false) {
      Utility.replaceClassName(mainCategoryDeleteButton, `open`, `closed`);
    }
    subCategories.forEach((sc, i) => {
      let mainCategoryIndex;
      let subCategoryIndex;
      const surplusToggle = sc.firstChild.nextSibling.firstChild.nextSibling.firstChild.nextSibling;
      const subCategoryDeletionButton = sc.firstChild.nextSibling.firstChild.nextSibling.nextSibling;
      if (utility.permissions.admin === true) {
        surplusToggle.addEventListener(`click`, (e) => {
          Utility.toggleClasses(surplusToggle, [`sub-category-controller__surplus-container__switch__alt--switched`]);
          Utility.toggleClasses(sc.firstChild.nextSibling.firstChild.nextSibling.firstChild.nextSibling.firstChild.firstChild, [`fa-times`, `fa-check`]);
          const mainCategories = document.querySelectorAll('.main-category__alt');
          mainCategories.forEach((category, i) => {
            if (category.classList.contains(`main-category__alt__selected`)) mainCategoryIndex = i;
          });
          placeholderBudget.mainCategories[mainCategoryIndex].subCategories.forEach((sc, index) => {
            let subCategoryTitle = e.target.closest('.sub-category').firstChild.firstChild;
            if (subCategoryTitle.textContent === sc.title) {
              subCategoryIndex = index;
            }
          });
          placeholderBudget._makeSurplusSubCategory({ mainIndex: mainCategoryIndex, subIndex: subCategoryIndex });
        });
      } else {
        [...document.querySelectorAll('.sub-category-controller__surplus-container')].forEach((surplus) => {
          Utility.addClasses(surplus, [`disabled`]);
        });
      }
      if (subCategoryDeletionButton) {
        if (utility.permissions && utility.permissions.admin === true) {
          subCategoryDeletionButton.addEventListener(`click`, (e) => {
            const mainCategories = document.querySelectorAll('.main-category__alt');
            mainCategories.forEach((category, i) => {
              if (category.classList.contains(`main-category__alt__selected`)) mainCategoryIndex = i;
            });
            placeholderBudget.mainCategories[mainCategoryIndex].subCategories.forEach((sc, index) => {
              let subCategoryTitle = e.target.closest('.sub-category').firstChild.firstChild;
              if (subCategoryTitle.textContent === sc.title) {
                subCategoryIndex = index;
              }
            });
            placeholderBudget._deleteSubCategory(mainCategoryIndex, subCategoryIndex);
            subCategoryDeletionButton.closest('.sub-category').remove();
          });
        } else if (utility.permissions && utility.permissions.admin === false) {
          Utility.replaceClassName(subCategoryDeletionButton, `open`, `closed`);
        }
      }
      placeholderBudget.setupSubCategoryCreation(utility);
      const updateCategoryButton = document.querySelectorAll('.button--large__thin')[0];
      if (updateCategoryButton && utility.permissions && utility.permissions.admin === true) {
        updateCategoryButton.addEventListener(`click`, (e) => {
          e.preventDefault();
          let budgetId = window.location.href.split('/')[7];
          placeholderBudget._updateBudget(
            {
              updateObject: {
                budgetId: budgetId,
                userId: user._id,
                mainCategories: placeholderBudget.mainCategories,
              },
            },
            `Manage-Categories`
          );
        });
      } else {
        Utility.addClasses(updateCategoryButton, [`disabled`]);
      }
    });
  }
};
