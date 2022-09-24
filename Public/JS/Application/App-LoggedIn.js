import { Profile } from './../Classes/Profile';
import { Budget } from './../Classes/Budget';
import * as Utility from './Utility';
import moment from 'moment';
import translate from 'translate';
import { get, getAll, set, timeTillExpires, remove, useNamespace } from './../Classes/Cache';

export const _watchForResetFromErrors = () => {
  const returnButton = document.querySelector('.button--return');
  if (returnButton) {
    returnButton.addEventListener('click', (e) => {
      e.preventDefault();
      Utility.reloadPage();
    });
  }
};

const checkLoginStatus = (status) => {
  const application = document.querySelector('.application-flex-container');
  application ? (status = true) : false;
  status === true ? console.log(`Logged In 👋`) : console.log(`Logged Out 👋`);
  return status;
};

const watchMobileNavigation = (utility) => {
  const mobileNavigation = document.querySelector('.r__mobile-user-profile-navigation');
  const mobileProfilLinksToggle = document.querySelectorAll('.r__button--extra-small-mobile')[1];
  const mobileProfileLinkContainer = document.querySelector('.r__mobile-user-profile-navigation__section--account-links__link-container');
  const mobileBudgetCardContainer = document.querySelector('.r__budget-card-container');
  console.log(utility.screen.smallTabPort[0].matches, mobileNavigation);

  console.log(utility.screen.largeMobileLand[0].matches || utility.screen.largeMobilePort[0].matches || utility.screen.smallMobileLand[0].matches || utility.screen.smallMobilePort[0].matches);

  if (utility.screen.largeMobileLand[0].matches || utility.screen.largeMobilePort[0].matches || utility.screen.smallMobileLand[0].matches || utility.screen.smallMobilePort[0].matches) {
    Utility.replaceClassName(mobileNavigation, `closed`, `open`);
    Utility.replaceClassName(mobileProfilLinksToggle, 'closed', 'open');
    Utility.replaceClassName(mobileProfileLinkContainer, `open`, `closed`);
    mobileNavigation.style.flexDirection = 'column';
    mobileProfilLinksToggle.addEventListener(`click`, (e) => {
      e.preventDefault();
      Utility.toggleClasses(mobileProfileLinkContainer, [`open`, `closed`]);
      Utility.toggleClass(mobileBudgetCardContainer, `prevent-squish`);
    });
  } else if (
    utility.screen.smallTabPort[0].matches ||
    utility.screen.largeMobileLand[0].matches ||
    utility.screen.largeMobilePort[0].matches ||
    utility.screen.smallMobileLand[0].matches ||
    utility.screen.smallMobilePort[0].matches
  ) {
    Utility.replaceClassName(mobileNavigation, `closed`, `open`);
    Utility.replaceClassName(mobileProfileLinkContainer, 'closed', 'open');
    // mobileNavigation.style.flexDirection = 'row';
  } else {
    Utility.replaceClassName(mobileNavigation, `open`, `closed`);
  }
};

export const watchLoginStatus = async (loginStatus) => {
  let status = checkLoginStatus(loginStatus);
  const application = document.querySelector('.application-flex-container');

  if (application && status === true) {
    // * BUILD USER PROFILE
    let { profile, user } = await new Profile().build();
    console.log(`👋 Hello ${user.firstname} ${user.lastname}!`);

    // * INITIALIZE UTILITY OBJECT
    Utility.build(profile, moment, translate);
    let utility = get(`utility`);

    // * CHECK IF MOBILE NAVIGATION NEEDED
    watchMobileNavigation(utility);

    // * UPDATE PROFILE ON COMMA USAGE
    utility.commaLocales.includes(profile.locale) ? profile.addTo(`commaFormat`, true) : profile.addTo(`commaFormat`, false);

    // * WATCH PROFILE
    profile.watch(user, utility);

    // * INITIALIZE BUDGET OBJECT
    let budget = new Budget();

    // * START WATCHING BUDGET SELECTION
    budget.watchSelection(profile);

    // * START WATCHING BUDGET CREATION
    budget.watchCreation(profile, utility);
  }
};
