import axios from 'axios';
import * as Utility from './Utility';
import { get, getAll, set, timeTillExpires, remove, useNamespace } from './../Classes/Cache';
import { fillDay, createIntervals } from './Algorithms/_Intervals';
import { buildSchedule } from './Algorithms/_Schedule';
import { DateTime, Info } from 'luxon';

const fillDateModal = (modal, dateText) => {
  let months = Info.months('long');
  const header = document.createElement('header');
  Utility.addClasses(header, [`modal--select-date__header`, `r__modal--select-date__header`]);
  header.textContent = `Select A Date`;

  const subHeader = document.createElement('h3');
  Utility.addClasses(subHeader, [`modal--select-date__sub-header`, `r__modal--select-date__sub-header`]);
  subHeader.textContent = `( Example: DD/MM/YYYY )`;

  const datePickerContainer = document.createElement('section');
  Utility.addClasses(datePickerContainer, [`modal--select-date__date-picker-container`, `r__modal--select-date__date-picker-container`]);

  const dayInput = document.createElement('input');
  const monthInput = document.createElement('select');
  const yearInput = document.createElement('input');

  dayInput.type = `number`;
  yearInput.type = `number`;

  dayInput.placeholder = 4;
  monthInput.placeholder = `February`;
  yearInput.placeholder = 1987;

  Utility.addClasses(dayInput, [`modal--select-date__date-picker-container__day`, `r__modal--select-date__date-picker-container__day`]);
  Utility.addClasses(monthInput, [`modal--select-date__date-picker-container__month`, `r__modal--select-date__date-picker-container__month`]);
  Utility.addClasses(yearInput, [`modal--select-date__date-picker-container__year`, `r__modal--select-date__date-picker-container__year`]);

  console.log(months);
  months.forEach((month, i) => {
    const option = document.createElement('option');
    Utility.addClasses(option, [`modal--select-date__date-picker-container__month__option`, `r__modal--select-date__date-picker-container__month__option`]);
    option.textContent = month;
    option.value = i;
    Utility.insertElement(`beforeend`, monthInput, option);
  });

  const submitDateButton = document.createElement('button');
  Utility.addClasses(submitDateButton, [`button--modal`, `r__button--modal`]);
  submitDateButton.textContent = `Select Date`;

  Utility.insertElement(`beforeend`, modal, header);
  Utility.insertElement(`beforeend`, modal, subHeader);
  Utility.insertElement(`beforeend`, modal, datePickerContainer);

  Utility.insertElement(`beforeend`, datePickerContainer, dayInput);
  Utility.insertElement(`beforeend`, datePickerContainer, monthInput);
  Utility.insertElement(`beforeend`, datePickerContainer, yearInput);

  console.log(monthInput[monthInput.options.selectedIndex].value);
  let date = DateTime.local(Number(yearInput.placeholder), Number(monthInput.value + 1), Number(dayInput.placeholder));
  dayInput.min = 1;
  dayInput.max = date.daysInMonth;
  yearInput.min = 2022;
  yearInput.max = DateTime.now().year + 10;

  monthInput.addEventListener(`change`, (e) => {
    e.preventDefault();
    dayInput.value === '' ? (dayInput.value = Number(dayInput.placeholder)) : (dayInput.value = Number(dayInput.value));
    yearInput.value === '' ? (yearInput.value = Number(yearInput.placeholder)) : (yearInput.value = Number(yearInput.value));

    let currentDaySetting = dayInput.value;
    dayInput.value = 28;
    date = DateTime.local(Number(yearInput.value), Number(monthInput.value) + 1, Number(dayInput.value));

    dayInput.max = date.daysInMonth;
    if (currentDaySetting > dayInput.max) {
      dayInput.value = dayInput.max;
    }
  });

  yearInput.addEventListener(`change`, (e) => {
    e.preventDefault();
    dayInput.value === '' ? (dayInput.value = Number(dayInput.placeholder)) : (dayInput.value = Number(dayInput.value));
    yearInput.value === '' ? (yearInput.value = Number(yearInput.placeholder)) : (yearInput.value = Number(yearInput.value));

    let currentDaySetting = dayInput.value;
    dayInput.value = 28;
    date = DateTime.local(Number(yearInput.value), Number(monthInput.value) + 1, Number(dayInput.value));
    dayInput.max = date.daysInMonth;
    if (currentDaySetting > dayInput.max) {
      dayInput.value = dayInput.max;
    }
  });

  Utility.insertElement('beforeend', modal, submitDateButton);

  submitDateButton.addEventListener(`click`, (e) => {
    e.preventDefault();
    dayInput.value === '' ? (dayInput.value = Number(dayInput.placeholder)) : (dayInput.value = Number(dayInput.value));
    yearInput.value === '' ? (yearInput.value = Number(yearInput.placeholder)) : (yearInput.value = Number(yearInput.value));
    let selectedDate = DateTime.local(Number(yearInput.value), Number(monthInput.value) + 1, Number(dayInput.value));
    if (selectedDate < DateTime.now()) return;
    dateText.dataset.date = DateTime.local(selectedDate.year, selectedDate.month, selectedDate.day).toISO();
    dateText.textContent = DateTime.local(selectedDate.year, selectedDate.month, selectedDate.day).toLocaleString(DateTime.DATE_HUGE);
    Utility.replaceClassName(modal, `open`, `closed`);
  });
};

const retrieveInfo = async () => {
  try {
    const response = await axios({
      method: `GET`,
      url: `/App/Info`,
    });
    console.log(response);
    return response.data.data;
  } catch (error) {
    console.log(error);
  }
};

export const buildApp = async (app) => {
  console.log(`Building...`);

  // * INITIALIZE UTILITY OBJECT
  Utility.build();
  let utility = get(`utility`);

  const data = await retrieveInfo();
  app.dataset.schedule = data.schedule;
  app.dataset.email = data.email;
  app.dataset.theme = data.theme;
  app.dataset.intervals = data.preferredCalendarIncrements;

  console.log(app.dataset);
  Utility.addClasses(app, [utility.theme[app.dataset.theme]]);

  const header = document.createElement('header');
  Utility.addClasses(header, [`appoint-me-header`, `r__appoint-me-header`]);
  Utility.insertElement('beforeend', app, header);

  const logo = document.createElement('span');
  Utility.addClasses(logo, [`icon`, `icon-appoint-me-logo`]);
  Utility.insertElement('beforeend', header, logo);

  const appTitle = document.createElement('p');
  Utility.addClasses(appTitle, [`appoint-me-header__title`, `r__appoint-me-header__title`]);
  appTitle.textContent = `Appoint-Me`;
  Utility.insertElement('beforeend', header, appTitle);

  const container = document.createElement('div');
  Utility.addClasses(container, [`appoint-me-container`, `appoint-me-container`]);
  Utility.insertElement('beforeend', app, container);

  const heading = document.createElement('h2');
  Utility.addClasses(heading, [`appoint-me-container__heading`, `r__appoint-me-container__heading`]);
  heading.textContent = `Make An Appointment`;
  Utility.insertElement('beforeend', container, heading);

  const subContainer = document.createElement('div');
  Utility.addClasses(subContainer, [`appoint-me-container__sub-container`, `r__appoint-me-container__sub-container`]);
  Utility.insertElement('beforeend', container, subContainer);

  const subContainerHeading = document.createElement('div');
  Utility.addClasses(subContainerHeading, [`appoint-me-container__sub-container__heading`, `r__appoint-me-container__sub-container__heading`]);
  Utility.insertElement('beforeend', subContainer, subContainerHeading);

  const date = document.createElement(`h2`);
  Utility.addClasses(date, [`appoint-me-container__sub-container__heading__date`, `r__appoint-me-container__sub-container__heading__date`]);
  date.dataset.date = DateTime.now().toISO();
  date.textContent = DateTime.now().toLocaleString(DateTime.DATE_HUGE);
  Utility.insertElement('beforeend', subContainerHeading, date);

  const dateModalButton = document.createElement('button');
  Utility.addClasses(dateModalButton, [`select-date-button`, `r__select-date-button`]);
  Utility.insertElement('beforeend', subContainerHeading, dateModalButton);

  const dateModalButtonText = document.createElement('p');
  Utility.addClasses(dateModalButtonText, [`select-date-button__text`, `r__select-date-button__text`]);
  dateModalButtonText.textContent = `Select Date`;
  Utility.insertElement('beforeend', dateModalButton, dateModalButtonText);

  const dateModalButtonIcon = document.createElement('span');
  Utility.addClasses(dateModalButtonIcon, [`icon`, `icon-appoint-me-logo`, `select-date-button__icon`, `r__select-date-button__icon`]);
  Utility.insertElement('beforeend', dateModalButton, dateModalButtonIcon);

  const calendar = document.createElement('section');
  Utility.addClasses(calendar, [`appoint-me-container__sub-container__calendar`, `r__appoint-me-container__sub-container__calendar`]);
  Utility.insertElement('beforeend', subContainer, calendar);

  console.log(app.dataset.intervals, app.dataset.schedule);

  const dateModal = document.createElement('section');
  Utility.addClasses(dateModal, [`modal--select-date`, `r__modal--select-date`, `closed`]);
  Utility.insertElement(`afterbegin`, subContainer, dateModal);

  const timeModal = document.createElement('section');
  Utility.addClasses(timeModal, [`modal--select-time`, `r__modal--select-time`, `closed`]);
  Utility.insertElement(`afterbegin`, subContainer, timeModal);

  dateModalButton.addEventListener(`click`, (e) => {
    e.preventDefault();
    Utility.replaceClassName(dateModal, `closed`, `open`);
  });

  [dateModal, timeModal].forEach((modal, i) => {
    const modalCloseIcon = document.createElement('i');
    Utility.addClasses(modalCloseIcon, [`fas`, `fa-window-close`, `modal-close-icon`, `r__modal-close-icon`]);
    Utility.insertElement('beforeend', modal, modalCloseIcon);
    modalCloseIcon.addEventListener(`click`, (e) => {
      e.preventDefault();
      Utility.replaceClassName(modal, `open`, `closed`);
    });
  });

  fillDay(calendar, app.dataset.intervals, utility);
  createIntervals(document.querySelectorAll('.hour'), app.dataset.intervals, utility);

  fillDateModal(dateModal, date);
  buildSchedule(calendar, app.dataset.schedule, utility);
};
