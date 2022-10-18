import * as API from './_API-Calls';
import translate from 'translate';
import { get, getAll, set, remove, useNamespace } from './../Classes/Cache';
import axios from 'axios';
import qs from 'qs';

export const replaceListeners = (elements, eventType, callback, options) => {
  elements.forEach((element) => {
    removeEventListener(eventType, callback);
  });
  elements.forEach((element) => {
    element.addEventListener(eventType, listener(...options));
  });
};

export const subtract = (total, amountsToSubtract) => {
  amountsToSubtract.forEach((amount) => {
    total -= amount;
  });
  return total;
};

export const add = (total, amountsToSubtract) => {
  amountsToSubtract.forEach((amount) => {
    total += amount;
  });
  return total;
};

export const getLocale = (api, earth, language) => {
  let locale, currency, languages, countryName;
  // ** IMPORTANT ** -- RESTCountriesAPI will need to have the ability to get the locale of the user setup.
  if (api.value.value === `RESTCountriesAPI` || api.value === `RESTCountriesAPI`) {
    console.log(api.value, language);
  }
  let testLanguage = language;
  languages = [];
  if (api.value.value === `PlacesAPI` || api.value === `PlacesAPI`) {
    if (Object.entries(earth.value) === undefined) Utility.reloadPage();

    Object.entries(earth.value).forEach((countryArray, i) => {
      countryArray[1].Languages.forEach((language) => {
        let testLocale = `${language[`iso639.1`]}-${countryArray[1][`iso3166Alpha2`]}`;
        if (testLocale === testLanguage) {
          locale = testLocale;
          currency = countryArray[1].Currencies.code;
          countryName = countryArray[1].name;
          if (language[`iso639.1`]) {
            languages.push(language['iso639.1']);
            languages.push(language['iso639.2']);
          }
          if (!language[`iso639.1`]) {
            languages.push(language['iso639.2']);
            if (language['iso639.3']) {
              languages.push(language['iso639.3']);
            }
          }
        }
      });
    });
  }
  return { locale, currency, languages, countryName };
};

export const getOtherCountryData = async (endpoint, array, page, links, data, item, world, user) => {
  do {
    let response = await API.getCountryInformation(`${endpoint}?&include=${item}&page[number]=${page}`, user);
    data = response.data;
    let countryData = data.data.data;
    links = data.data.links;

    countryData.forEach((country, i) => {
      if (item === `languages`) {
        if (page === 1) {
          world[country.name][`Languages`] = country[item];
          if (!world[country.name][`Translations`]) {
            world[country.name][`Translations`] = {};
          }
        }
        if (page >= 2) {
          i += (page - 1) * 10;
          world[country.name][`Languages`] = country[item];
          if (!world[country.name][`Translations`]) {
            world[country.name][`Translations`] = {};
          }
        }
      }
      if (item === `currency`) {
        if (page === 1) {
          world[country.name][`Currencies`] = country[item];
          if (!world[country.name][`Translations`]) {
            world[country.name][`Translations`] = {};
          }
        }
        if (page >= 2) {
          i += (page - 1) * 10;
          world[country.name][`Currencies`] = country[item];
          if (!world[country.name][`Translations`]) {
            world[country.name][`Translations`] = {};
          }
        }
      }
      if (item === `flag`) {
        if (page === 1) {
          world[country.name][`Flags`] = country[item];
        }
        if (page >= 2) {
          i += (page - 1) * 10;
          world[country.name][`Flags`] = country[item];
        }
      }
      if (item === `timeZones`) {
        if (page === 1) {
          world[country.name][`Time Zones`] = country[item];
        }
        if (page >= 2) {
          i += (page - 1) * 10;
          world[country.name][`Time Zones`] = country[item];
        }
      }
    });

    page++;
  } while (data === undefined || links.next !== null);
  return world;
};

export const getAllCountries = async (endpoint, object, page, links, data, user) => {
  let seconds = 0;
  let apiInverval = setInterval(() => {
    console.log(`Seconds: ${seconds++}`);
  }, 1000);
  setTimeout(() => clearInterval(apiInverval), 60000);
  do {
    let response = await API.getCountryInformation(`${endpoint}?page[number]=${page}`, user);
    data = response.data;
    let countryData = data.data.data;
    links = data.data.links;

    countryData.forEach((country, i) => {
      object[country.name] = country;
    });
    page++;
  } while (data === undefined || links.next !== null);
  return object;
};

export const getWorld = async (object, user) => {
  let page = 1;
  let startingEndpoint = `countries`;
  let pageData, links;

  let secondaryInfo = [`languages`, `currency`];
  let world = localStorage.getItem(`World`);
  let api = localStorage.getItem(`API`);
  if (!world || !api) {
    // world = await API.getWorldInformation();
    // world = world.data;
    // Utility.setWithTimeUntilExpired(`API`, `RESTCountriesAPI`, 2629800000);
    if (!world || !api) {
      const extraSmallContainers = document.querySelectorAll(`.container--extra-small`);
      const netValueContainer = extraSmallContainers[2];
      showLoadingMessage(netValueContainer, `afterend`, `section`, `loading-message-container`, `r__loading-message-container`, `Will Finish Loading API Information In`, 60);
      world = await getAllCountries(startingEndpoint, object, page, links, pageData, user);
      (world = await getOtherCountryData(startingEndpoint, object, page, links, pageData, secondaryInfo[0], world, user)),
        (world = await getOtherCountryData(startingEndpoint, object, page, links, pageData, secondaryInfo[1], world, user));
      setWithTimeUntilExpired(`API`, `PlacesAPI`, 2629800000);
    }
    setWithTimeUntilExpired(`World`, world, 2629800000);
    // localStorage.setItem(`World`, JSON.stringify(world));
    world = JSON.stringify(world);
  }
  let seconds = 0;
  return { world, api };
};

export const getLocalInformation = async (user) => {
  // INITIALIZE THE OBJECT TO CONTAIN THE WORLD INFORMATION
  let worldObject = {};
  let { world, api } = await getWorld(worldObject, user);

  // ADJUST: CHECKING IF I AM BETTER OFF WITH AN ARRAY OR OBJECT FOR THE WORLD

  /*
  EXAMPLE OF DESIRED RESULT: World object --> {
    "Country Name" {
      "Currencies": {...},
      "Languages": {...},
      "Translations": { "exampleWord": "exampleTranslation" },
      ...otherCountryInfo 
    } 
  }
  */

  // PARSING THE WORLD FOR USE BY THE USER
  let earth = JSON.parse(world);
  if (earth !== undefined) reloadPage();
  api = JSON.parse(api);
  return { earth, api };
};

export const getLocalStorageLocalInformation = () => {
  let earth = JSON.parse(getLocalStorageItem(`World`));
  let api = JSON.parse(getLocalStorageItem('API'));
  return { earth, api };
};

export const build = () => {
  let minuteStart = 0;
  let numberOfMinutes = 60;
  let minutes = [];
  while (minuteStart < numberOfMinutes) {
    if (minuteStart < 10) {
      minutes.push(`0${minuteStart}`);
    } else {
      minutes.push(minuteStart);
    }
    minuteStart++;
  }
  let utility = {
    // number: new Intl.NumberFormat(profile.locale),
    // englishNumber: new Intl.NumberFormat(`en-us`),
    // date: new Intl.DateTimeFormat(profile.locale, profile.longDate),
    // dateShort: new Intl.DateTimeFormat(profile.locale, profile.shortDate),
    // americanDate: new Intl.DateTimeFormat(`en-us`, profile.longDate),
    // americanDateShort: new Intl.DateTimeFormat(`en-us`, profile.shortDate),
    permissions: {
      admin: false,
      associated: false,
    },
    screen: {
      smallMobilePort: [window.matchMedia(`(max-width: 375px) and (max-height: 800px)`), [`gridMobilePort`, `r__gridMobilePort`]],
      smallMobileLand: [window.matchMedia(`(max-width: 800px) and (max-height: 375px)`), [`gridMobileLand`, `r__gridMobileLand`]],
      largeMobilePort: [window.matchMedia(`(max-width: 425px) and (max-height: 930px)`), [`gridMobilePort`, `r__gridMobilePort`]],
      largeMobileLand: [window.matchMedia(`(max-width: 930px) and (max-height: 425px)`), [`gridMobileLand`, `r__gridMobileLand`]],
      smallTabPort: [window.matchMedia(`(max-width: 800px) and (max-height: 1050px)`), [`gridTabPort`, `r__gridTabPort`]],
      smallTabLand: [window.matchMedia(`(max-width: 1050px) and (max-height: 800px)`), [`gridTabLand`, `r__gridTabLand`]],
      largeTabPort: [window.matchMedia(`(max-width: 1050px) and (max-height: 1400px)`), [`gridTabPort`, `r__gridTabPort`]],
      largeTabLand: [window.matchMedia(`(max-width: 1400px) and (max-height: 1050px)`), [`gridTabLand`, `r__gridTabLand`]],
      desktopQuery: [window.matchMedia(`(min-width: 1401px) and (min-height: 1051px)`), [`gridDesktop`, `r__gridDesktop`]],
      tvQuery: [window.matchMedia(`(min-width: 2500px)`), [`gridTV`, `r__gridTV`]],
    },
    theme: {
      'blue-and-white': 'blue-and-white',
      'blue-and-black': 'blue-and-black',
      'green-and-white': 'green-and-white',
      'green-and-black': 'green-and-black',
      'gold-and-white': 'gold-and-white',
      'gold-and-black': 'gold-and-black',
    },
    minutes: minutes,
  };
  set(`utility`, utility);
};

export const buildObject = (entriesArray) => {
  return Object.fromEntries(entriesArray);
};

export const insertElement = (position, container, element) => {
  if (container) {
    container.insertAdjacentElement(position, element);
  }
};

export const insertElements = (position, container, elements) => {
  if (container) {
    elements.forEach((element) => insertElement(position, container, element));
  }
};

export const pushIntoArray = (arrayFiller, array) => {
  arrayFiller.forEach((af) => {
    array.push(af);
  });
  return array;
};

export const toggleClass = (element, className) => {
  return element.classList.toggle(className);
};

export const toggleClasses = (element, classNames) => {
  classNames.forEach((className) => {
    element.classList.toggle(className);
  });
};

export const showElement = (element) => {
  element.classList.toggle('closed');
  element.classList.toggle('open');
};

export const addClasses = (element, classes) => {
  classes.forEach((c) => {
    element.classList.add(c);
  });
};

export const removeClasses = (element, classes) => {
  classes.forEach((c) => {
    element.classList.remove(c);
  });
};

export const replaceClassName = (element, classReplaced, replacementClass) => {
  element.classList.remove(classReplaced);
  element.classList.add(replacementClass);
};

export const toggledReplaceClassName = (element, classReplaced, replacementClass) => {
  element.classList.toggle(classReplaced);
  element.classList.toggle(replacementClass);
};

export const _capitalize = (string) => {
  return `${string.charAt(0).toUpperCase()}${string.slice(1)}`;
};

export const reloadPage = () => {
  setTimeout(() => {
    window.location.reload();
  }, 2000);
};

export const createAndRenderError = (checkElement, relativeElement, position, createdElement, createdElementClassNameOne, createdElementClassNameTwo, errorMessage, timeLimit) => {
  let elementCreated = document.createElement(createdElement);
  elementCreated.classList.add(createdElementClassNameOne);
  elementCreated.classList.add(createdElementClassNameTwo);
  let splitMessage = errorMessage.split('. ');
  if (splitMessage.includes(`Every Transaction Must Have A Date`) || splitMessage.includes(`Every Transaction Happened Somewhere`)) {
    let addedElement;
    splitMessage.forEach((text, i) => {
      if (i === 0) {
        addedElement = document.createElement('header');
        addedElement.classList.add(`error-header`);
        addedElement.classList.add(`r__error-header`);
        addedElement.textContent = text;
      }
      if (i > 0) {
        addedElement = document.createElement('p');
        addedElement.classList.add(`error-text`);
        addedElement.classList.add(`r__error-text`);
        addedElement.textContent = text;
      }
      insertElement(`beforeend`, elementCreated, addedElement);
    });
  }
  if (relativeElement) {
    insertElement(position, relativeElement, elementCreated);
    setTimeout(() => {
      elementCreated.textContent = '';
    }, timeLimit / 1.125);
    setTimeout(() => {
      elementCreated.remove();
    }, timeLimit);
  }
};

export const showError = (element, errorMessage, elementText, className, timeLimit) => {
  element.textContent = errorMessage;
  element.classList.add(className);
  setTimeout(() => {
    element.textContent = elementText;
    element.classList.remove(className);
    reloadPage();
  }, timeLimit);
};

export const renderError = (element, errorMessage, elementText, className, timeLimit) => {
  element.textContent = errorMessage;
  element.classList.add(className);
  let elementWidth = element.style.width;
  let elementTransform = element.style.transform;
  let elementFontSize = element.style.fontSize;

  element.style.width = `max-content`;
  if (
    element.textContent ===
    `Passwords must contain at least 8 characters, amongst them being at least 1 capital letter, 1 lower case letter, 1 number, & 1 special symbol.  The special symbols may be the following: !, @, $, &, -, _, and &.`
  ) {
    element.style.transform = `translate(-40rem, -7rem)`;
    element.style.fontSize = `1.2rem`;
  }
  setTimeout(() => {
    element.textContent = elementText;
    element.classList.remove(className);
    element.style.width = `${elementWidth}`;
    if (elementText === `New Password` || elementText === `Confirm New Password`) {
      element.style.transform = elementTransform;
      element.style.fontSize = elementFontSize;
    }
  }, timeLimit);
};

export const showLoadingMessage = (relativeElement, position, createdElement, createdElementClassNameOne, createdElementClassNameTwo, loadingMessage, timeLimit) => {
  if (relativeElement) {
    let elementCreated = document.createElement(createdElement);
    elementCreated.classList.add(createdElementClassNameOne);
    elementCreated.classList.add(createdElementClassNameTwo);
    elementCreated.textContent = `${loadingMessage}: ${timeLimit}`;
    let countdown = setInterval(() => {
      timeLimit--;
      elementCreated.textContent = `${loadingMessage}: ${timeLimit} Seconds`;
      if (timeLimit === 0) {
        clearInterval(countdown);
      }
    }, 1000);
    insertElement(position, relativeElement, elementCreated);

    setTimeout(() => {
      elementCreated.remove();
    }, timeLimit * 1000);
  }
};

export const setWithTimeUntilExpired = (key, value, timeLimit) => {
  const item = {
    value: value,
    timeLimit: Date.now() + timeLimit,
  };
  return localStorage.setItem(key, JSON.stringify(item));
};

export const getLocalStorageItem = (key) => {
  return localStorage.getItem(key);
};

const removeCachedKey = (key) => {
  return localStorage.removeItem(key);
};

const timeTillExpires = (key, subKey) => {
  return key.timeLimit - Date.now();
};

const expired = (expiresAt) => {
  return expiresAt && expiresAt < Date.now();
};

export function checkForKeyExpiration(key, subKey, storageKey) {
  let isExpired = JSON.parse(expired(key[subKey]));
  if (isExpired === true) {
    removeCachedKey(storageKey);
    reloadPage();
    return;
  } else {
    let storedItem = JSON.parse(localStorage.getItem(storageKey));
    let timeRemaining = timeTillExpires(storedItem, `world`);
    return { message: `I am NOT expired!`, expiredStatus: isExpired, timeRemaining: timeRemaining };
  }
}

export const translateText = async (text, from, to) => {
  return await translate(text, { from: from, to: to });
};

export const getTranslation = async (profile, elementText) => {
  let world = JSON.parse(getLocalStorageItem(`World`));
  let api = JSON.parse(getLocalStorageItem(`API`));
  let earth = world.value;
  let elementTranslation = earth[profile.countryName].Translations[elementText];
  if (!elementTranslation) {
    try {
      const response = await axios({
        method: `POST`,
        url: `/App/API/Translation`,
        data: qs.stringify({
          text: elementText,
          from: `en`,
          to: profile.locale.split('-')[0],
        }),
      });
      let earthLimit = world.timeLimit;
      elementTranslation = response.data.text;
      earth[profile.countryName].Translations[elementText] = elementTranslation;
      setWithTimeUntilExpired(`World`, earth, earthLimit);
      setWithTimeUntilExpired(`API`, api.value, earthLimit);
      return elementTranslation;
    } catch (error) {
      console.log(error);
    }
  }
  return elementTranslation;
};

export const getEnglishSpeakers = (earth) => {
  let earthArray = Object.entries(earth.value);
  let englishSpeakingCountries = [];
  earthArray.forEach((countryArray, i) => {
    countryArray[1].Languages.forEach((language) => {
      if (language[`iso639.1`] === `en`) {
        englishSpeakingCountries.push(countryArray[1].name);
      }
    });
  });
  return englishSpeakingCountries;
};

export const getEnglishTranslation = async (elementText, user) => {
  let world = JSON.parse(getLocalStorageItem(`World`));
  let api = JSON.parse(getLocalStorageItem(`API`));
  let earth = world.value;
  let utility = get('utility');

  let elementTranslation;
  let index = 0;
  do {
    elementTranslation = earth[utility.englishSpeakers[index]].Translations[elementText];
    if (!elementTranslation || elementTranslation === undefined) {
      try {
        const response = await axios({
          method: `POST`,
          url: `/App/API/Translation`,
          data: qs.stringify({
            text: elementText,
            from: user.locale.split('-')[0],
            to: `en`,
          }),
        });
        let earthLimit = world.timeLimit;
        let apiLimit = api.timeLimit;
        elementTranslation = response.data.text;
        utility.englishSpeakers.forEach((country) => {
          earth[country].Translations[elementText] = elementTranslation;
        });
        setWithTimeUntilExpired(`World`, earth, earthLimit);
        setWithTimeUntilExpired(`API`, api.value, earthLimit);
        return elementTranslation;
      } catch (error) {
        console.log(error);
      }
    }
    index++;
    return elementTranslation;
  } while (index < utility.englishSpeakers.length && elementTranslation === undefined);
};

export const formatPlaceholder = (amount) => {
  let utility = get(`utility`);
  if (utility.commaLocales.includes(utility.locale)) {
    let newAmount;
    newAmount = amount.replace(/[^d.]/, '');
    newAmount = newAmount.replace(/[,]/, '.');
    amount = utility.money.format(Number(newAmount));
    return amount;
  }
  if (!utility.commaLocales.includes(utility.locale)) {
    return (amount = utility.money.format(Number(amount.replace(/[^d.]/, ''))));
  }
};

export const formatAmount = (amount, profile) => {
  // The user's profile will need to be passed here.  I anticipate the error that will be coming here.
  let utility = get(`utility`);
  if (utility.commaLocales.includes(utility.locale)) {
    let newAmount;
    newAmount = amount.textContent.replace(/[^d.]/, '');
    newAmount = newAmount.replace(/[,]/, '.');
    amount.textContent = utility.money.format(Number(newAmount));
  }
  if (!utility.commaLocales.includes(utility.locale)) {
    amount.textContent = utility.money.format(Number(amount.textContent.replace(/[^d.]/)));
  }
};

export const resetInterval = (intervalName, intervalFunction, intervalTimeout) => {
  clearInterval(intervalName);
  return setTimeout(intervalFunction, intervalTimeout);
};

export const openPhotoUpdateModal = (modal) => {
  toggleClasses(modal, [`closed`, `open`]);
};

export const _closeTheForm = (form) => {
  toggleClasses(form, [`closed`, `open`]);
};

export const formatPhoneNumber = (value) => {
  if (!value) return value;
  let number;
  let phoneNumber = value.replace(/[^\d]/g, '');
  let phoneNumberLength = phoneNumber.length;
  if (phoneNumberLength <= 3) {
    return phoneNumber;
  }
  if (phoneNumberLength >= 4 && phoneNumberLength < 7) {
    return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}`;
  }
  number = `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)} - ${phoneNumber.slice(6)}`;
  return number;
};

export const openSubSections = (subSectionArray, className) => {
  subSectionArray.forEach((ss) => ss.classList.toggle(className));
};

export const toggleSubSections = (subSections, button) => {
  [subSections[0], subSections[1]].forEach((subSection) => {
    toggleClasses(subSection, [`closed`, `open`]);
  });
};

export const watchCommunicationSwitch = (profile) => {
  const communicationSwitch = document.getElementById('commSwitch');
  if (communicationSwitch) {
    communicationSwitch.addEventListener('click', (e) => {
      communicationSwitch.classList.toggle('form__input--comms--text-preferred');
      communicationSwitch.classList.toggle('form__input--comms');
      communicationSwitch.classList.contains('form__input--comms--text-preferred') ? (profile.communicationPreference = `Text`) : (profile.communicationPreference = `Email`);
    });
  }
};

export const watchLDSSwitch = () => {
  const latterDaySaintSwitch = document.querySelector('.form__input--latter-day-saint');
  const latterDaySaintValues = document.querySelectorAll('.form__input--latter-day-saint__text');
  latterDaySaintSwitch.addEventListener('click', (e) => {
    e.preventDefault();
    latterDaySaintSwitch.classList.toggle('form__input--latter-day-saint--switched');
    latterDaySaintSwitch.classList.toggle('r__form__input--latter-day-saint--switched');
    latterDaySaintValues.forEach((value) => {
      value.classList.toggle(`open`);
      value.classList.toggle(`closed`);
    });
  });
};

export const getPermissionStatus = (user, utility) => {
  let budgetIndex;
  user.budgets.forEach((budget, i) => {
    if (budget._id === window.location.href.split('/')[7]) {
      budgetIndex = i;
    }
  });
  let budget = user.budgets[budgetIndex];
  if (budget.associatedUsers.includes(user._id)) {
    utility.permissions.associated = true;
  }
  if (budget.budgetAdmins.includes(user._id)) {
    utility.permissions.admin = true;
  }
};

export const watchScreen = () => {
  window.addEventListener('resize', (e) => {
    e.preventDefault();
    reloadPage();
  });
};
