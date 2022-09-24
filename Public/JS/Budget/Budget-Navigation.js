import * as Utility from './../Application/Utility';

export const _watchBudgetNavigation = async (user, budget, utility) => {
  const budgetNavButton = document.querySelector('.button--budget-navigation');
  const budgetNavigation = document.querySelector('.navigation');
  const linkButtons = document.querySelectorAll('.navigation__link-list__list-item__link-button');
  const budgetName = document.querySelector('.budget-container__navigation-button-container__text');
  budgetName.textContent = await Utility.getTranslation(user, budgetName.textContent);
  /*
  * This was placed in the wrong area for permissions and needs to be handled better as well.
  const navigationLinks = document.querySelectorAll('.navigation__link-list__list-item');
    if (utility.permissions.admin === false) {
      navigationLinks[navigationLinks.length - 1].disabled = true;
      Utility.replaceClassName(navigationLinks[navigationLinks.length - 1], 'open', `closed`);
    }
  */

  if (budgetNavButton) {
    budgetNavButton.addEventListener('click', (e) => {
      e.preventDefault();
      Utility.toggleClasses(budgetNavButton, ['button--budget-navigation--clicked', `r__button--budget-navigation--clicked`]);
      Utility.toggleClasses(budgetNavigation, [`closed`, `open-navigation`, `r__open-navigation`]);
      if (!budgetNavButton.classList.contains('budget-navigation--visible')) linkButtons.forEach((lb) => lb.closest('li').nextSibling.classList.add('closed'));
    });
  }
  if (linkButtons) {
    linkButtons.forEach((lb) => {
      lb.addEventListener('click', (e) => {
        e.preventDefault();
        const clicked = e.target.closest('li');
        const siblingLinkContainer = clicked.nextSibling;
        linkButtons.forEach((lb) => {
          Utility.replaceClassName(lb.closest('li').nextSibling, `open`, `closed`);
        });
        if (!siblingLinkContainer.classList.contains('open')) {
          Utility.toggleClasses(siblingLinkContainer, [`closed`, `open`]);
        }
      });
    });
  }
  if (budget.associatedUsers.includes(user._id)) {
    utility.permissions.associated = true;
  }
  if (budget.budgetAdmins.includes(user._id)) {
    utility.permissions.associated = true;
    utility.permissions.admin = true;
  }
  console.log(utility, utility.permissions);
  console.log(utility.permissions.admin, utility.permissions.associated);
  console.log(utility.permissions);
  const navigationLinks = document.querySelectorAll('.navigation__link-list__list-item');
  if (utility.permissions.admin === false) {
    navigationLinks[navigationLinks.length - 1].disabled = true;
    Utility.replaceClassName(navigationLinks[navigationLinks.length - 1], 'open', `closed`);
  }
  if (utility.permissions.admin === true) {
    navigationLinks[navigationLinks.length - 1].disabled = false;
    Utility.replaceClassName(navigationLinks[navigationLinks.length - 1], 'closed', `open`);
  }
};
