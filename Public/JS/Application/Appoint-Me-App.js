import axios from 'axios';
import qs from 'qs';
import * as Utility from './Utility';
import { get, getAll, set, timeTillExpires, remove, useNamespace } from './../Classes/Cache';
import { fillDay, createIntervals } from './Algorithms/_Intervals';
import { buildSchedule, watchForAppointments } from './Algorithms/_Schedule';
import { DateTime, Info, Duration } from 'luxon';

export const adjustDeclinedAppointment = (data, container, utility) => {
  console.log(data);
  const date = document.querySelector('.appointment-declined-container__heading__date');
  const requestedDate = date.textContent;
  const currentDate = DateTime.now();
  date.textContent = currentDate.toLocaleString(DateTime.DATE_HUGE);
  const company = container.dataset.company;
  const email = container.dataset.email;
  const start = container.dataset.start;
  const end = container.dataset.end;

  const submitMessageButton = document.querySelector('.form--declined__button');
  submitMessageButton.addEventListener(`click`, async (e) => {
    e.preventDefault();
    try {
      console.log(company, email, start, end, requestedDate, currentDate);
      const name = document.querySelector('.appointment-declined-container__heading__to').textContent.split(' ');
      console.log(document.querySelector('.appointment-declined-container__heading__to').textContent);
      const message = document.querySelector('.form--declined__message-input').value;
      const inputs = document.querySelectorAll('.form--declined__section__input');
      const subject = inputs[0].value;
      const messageObject = {
        firstname: name[1],
        lastname: name[2],
        email: email,
        subject: subject,
        message: message,
      };
      // `/App/Appointments/Declined/:date/:startTime/:endTime/:start/:end/:email/:firstname/:lastname/:myFirstName/:myLastName/:myCompany`
      const response = await axios({
        method: `POST`,
        url: `/App/Appointments/Declined/`,
        data: qs.stringify(messageObject),
      });
    } catch (error) {
      console.log(error);
    }
  });
};

const fillDateModal = (modal, dateText, data) => {
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
    if (DateTime.fromISO(selectedDate).day < DateTime.now().day) return;
    dateText.dataset.date = DateTime.local(selectedDate.year, selectedDate.month, selectedDate.day).toISO();
    dateText.textContent = DateTime.local(selectedDate.year, selectedDate.month, selectedDate.day).toLocaleString(DateTime.DATE_HUGE);
    Utility.replaceClassName(modal, `open`, `closed`);

    // * From here, the appointments that are on the selected day would need to be found and rendered from right here.

    const oldAppointments = document.querySelectorAll('.appointment');
    [...oldAppointments].forEach((app) => app.remove());
    console.log(`Appointments Removed`);

    data.appointments.forEach((time, i) => {
      console.log(DateTime.fromISO(dateText.dataset.date).day, DateTime.fromISO(time.date).day);
      if (DateTime.fromISO(dateText.dataset.date).day === DateTime.fromISO(time.date).day) {
        const day = document.querySelector('.appoint-me-container__sub-container__calendar');
        const appointment = document.createElement(`section`);
        Utility.addClasses(appointment, [`appointment`, `r__appointment`]);
        Utility.insertElement('beforeend', day, appointment);
        appointment.dataset.start = time.start;
        appointment.dataset.end = time.end;
        const appointmentHeader = document.createElement('h3');
        Utility.addClasses(appointmentHeader, [`appointment__header`, `r__appointment__header`]);
        appointmentHeader.textContent = `Appointment at ${time.startTime} to ${time.endTime}`;
        Utility.insertElement('beforeend', appointment, appointmentHeader);

        console.log(Number(DateTime.fromISO(time.start).hour));
        const startHour = Number(DateTime.fromISO(time.start).hour);
        const startMinute = Number(DateTime.fromISO(time.start).minute);
        const startDivisor = startMinute / 60;

        const endHour = Number(DateTime.fromISO(time.end).hour);
        const endMinute = Number(DateTime.fromISO(time.end).minute);
        const endDivisor = startMinute / 60;

        let timeDifference, hourDifference, minuteDifference, timeOfDay, appointmentHeight;

        minuteDifference = DateTime.fromISO(time.end).diff(DateTime.fromISO(time.start), ['hours', 'minutes']).toObject().minutes / 60;
        hourDifference = DateTime.fromISO(time.end).diff(DateTime.fromISO(time.start), ['hours', 'minutes']).toObject().hours;
        console.log(DateTime.fromISO(time.end).diff(DateTime.fromISO(time.start), ['hours', 'minutes'], { conversionAccuracy: 'longterm' }).toObject());
        console.log(DateTime.fromISO(time.end).diff(DateTime.fromISO(time.start), ['hours', 'minutes']).toObject());
        console.log(DateTime.fromISO(time.start));
        console.log(DateTime.fromISO(time.end), DateTime.fromISO(time.end).toFormat('a'));

        // IF TIME OF DAY IS ANTE MERIDIEM DO THESE THINGS:
        if (DateTime.fromISO(time.start).toFormat('a') === `AM`) {
          // PLACE APPOINTMENT
          appointment.style.top = `${(startHour + minuteDifference) * 8}rem`;

          // CALCULATE HEIGHT
          appointmentHeight = (hourDifference + minuteDifference) * 8;

          // SET APPOINTMENT LENGTH
          appointment.style.height = `${appointmentHeight}rem`;

          // * -- BELOW HERE IS FOR PM APPOINTMENT STARTS --
          // IF TIME OF DAY IS POST MERIDIEM DO THESE THINGS:
        } else if (DateTime.fromISO(time.start).toFormat('a') === `PM`) {
          // PLACE APPOINTMENT
          appointment.style.top = `${(startHour + minuteDifference) * 8}rem`;

          // CHECK IF APPOINTMENT DOES NOT GO PAST 11:59 PM
          if (DateTime.fromISO(time.end).toFormat('a') === `PM`) {
            // CALCULATE HEIGHT
            appointmentHeight = (hourDifference + minuteDifference) * 8;

            // SET APPOINTMENT LENGTH
            appointment.style.height = `${appointmentHeight}rem`;
          }
        }
      }
    });
  });
};

export const retrieveInfo = async () => {
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

const renderAppointments = (appointments, hours) => {
  const day = document.querySelector('.appoint-me-container__sub-container__calendar');
  const date = document.querySelector('.appoint-me-container__sub-container__heading__date');
  appointments.forEach((time, i) => {
    if (DateTime.fromISO(time.date).day === DateTime.fromISO(date.dataset.date).day) {
      console.log(DateTime.fromISO(date.dataset.date).day);
      const appointment = document.createElement(`section`);
      Utility.addClasses(appointment, [`appointment`, `r__appointment`]);
      Utility.insertElement('beforeend', day, appointment);
      appointment.dataset.start = time.start;
      appointment.dataset.end = time.end;
      const appointmentHeader = document.createElement('h3');
      Utility.addClasses(appointmentHeader, [`appointment__header`, `r__appointment__header`]);
      appointmentHeader.textContent = `Appointment at ${time.startTime} to ${time.endTime}`;
      Utility.insertElement('beforeend', appointment, appointmentHeader);

      if (i > 0) {
        console.log(
          Math.abs(
            DateTime.fromISO(appointments[i - 1].end)
              .diff(DateTime.fromISO(time.start).minus({ minutes: 15 }), ['minutes'])
              .toObject().minutes
          )
        );
        let previousAppointment = appointments[i - 1];
        let allDomAppointments = document.querySelectorAll('.appointment');
        let previousDomAppointment = allDomAppointments[allDomAppointments.length - 1];
        if (Math.abs(DateTime.fromISO(previousAppointment.end).diff(DateTime.fromISO(time.start), ['minutes']).toObject().minutes) < 45) {
          const spacer = document.createElement('div');
          Utility.addClasses(spacer, [`appointment--spacer`, `r__appointment--spacer`]);

          const convertedEndTime = DateTime.fromISO(previousAppointment.end).plus({ minutes: 0 });

          const appointmentEndHour = convertedEndTime.hour;
          const appointmentEndMinute = convertedEndTime.minute / 60;
          const appointmentEndSecond = convertedEndTime.second / 3600;

          Utility.insertElement('afterend', previousDomAppointment, spacer);
          spacer.style.top = `${(Number(appointmentEndHour) + Number(appointmentEndMinute) + Number(appointmentEndSecond)) * 8}rem`;
          spacer.style.height = `${
            (Math.abs(
              DateTime.fromISO(appointments[i - 1].end)
                .diff(DateTime.fromISO(time.start).minus({ minutes: 15 }), [`minutes`])
                .toObject().minutes
            ) /
              60) *
            8
          }rem`;
        }
      }

      /*
        * HERE IS WHAT NEEDS TO HAPPEN
        @ 1. Place start of hour where it is scheduled with the lentgth going as planned.
        @ 2. Subtract 7 1/2 minutes from the start so it is moved back.
        @ 3. Add 15 minutes so it goes to the length of having 7 1/2 minutes of a buffer on either end.


        * THERE NEEDS TO BE ENOUGH SPACE TO PLACE AN APPOINTMENT.  PREFERRABLY 45 MINUTES IN BETWEEN APPOINTMENTS.
      */

      const convertedStartTime = DateTime.fromISO(time.start).minus({ minutes: 15 });
      const convertedEndTime = DateTime.fromISO(time.end).plus({ minutes: 0 });

      const appointmentStartHour = convertedStartTime.hour;
      const appointmentStartMinute = convertedStartTime.minute / 60;
      const appointmentStartSecond = convertedStartTime.second / 3600;

      const appointmentEndHour = convertedEndTime.hour;
      const appointmentEndMinute = convertedEndTime.minute / 60;
      const appointmentEndSecond = convertedEndTime.second / 3600;

      console.log(convertedStartTime, convertedEndTime);

      let hourDifference, minuteDifference, secondDifference, appointmentHeight;

      hourDifference = convertedEndTime.diff(convertedStartTime, ['hours', 'minutes', 'seconds']).toObject().hours;
      minuteDifference = convertedEndTime.diff(convertedStartTime, ['hours', 'minutes', 'seconds']).toObject().minutes / 60;
      secondDifference = convertedEndTime.diff(convertedStartTime, ['hours', 'minutes', 'seconds']).toObject().seconds / 3600;
      // IF TIME OF DAY IS ANTE MERIDIEM DO THESE THINGS:
      if (DateTime.fromISO(time.start).toFormat('a') === `AM`) {
        // PLACE APPOINTMENT
        appointment.style.top = `${(appointmentStartHour + appointmentStartMinute + appointmentStartSecond) * 8}rem`;

        // CALCULATE HEIGHT
        appointmentHeight = (hourDifference + minuteDifference + secondDifference) * 8;
        console.log(appointmentHeight);

        // SET APPOINTMENT LENGTH
        appointment.style.height = `${appointmentHeight}rem`;

        // * -- BELOW HERE IS FOR PM APPOINTMENT STARTS --
        // IF TIME OF DAY IS POST MERIDIEM DO THESE THINGS:
      } else if (DateTime.fromISO(time.start).toFormat('a') === `PM`) {
        console.log(minuteDifference);
        // PLACE APPOINTMENT
        appointment.style.top = `${(appointmentStartHour + appointmentStartMinute + appointmentStartSecond) * 8}rem`;

        // CHECK IF APPOINTMENT DOES NOT GO PAST 11:59 PM
        if (DateTime.fromISO(time.end).toFormat('a') === `PM`) {
          // CALCULATE HEIGHT
          appointmentHeight = (hourDifference + minuteDifference + secondDifference) * 8;
          console.log(appointmentHeight);

          // SET APPOINTMENT LENGTH
          appointment.style.height = `${appointmentHeight}rem`;
        }
      }
    }
  });
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
  heading.textContent = `Request An Appointment`;
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

  fillDay(calendar, app.dataset.intervals, data, utility);
  createIntervals(document.querySelectorAll('.hour'), app.dataset.intervals, timeModal, data, utility);

  watchForAppointments(calendar, data, utility);

  fillDateModal(dateModal, date, data);
  buildSchedule(calendar, app.dataset.schedule, data, utility);

  const oldAppointments = document.querySelectorAll('.appointment');
  [...oldAppointments].forEach((app) => app.remove());

  const appointments = data.appointments;
  renderAppointments(appointments, document.querySelectorAll('.hour'));

  const hourSelects = document.querySelectorAll('.form__select--hour');
  const minuteSelects = document.querySelectorAll('.form__select--minute');
  let firstHour = hourSelects[0];
  let secondHour = hourSelects[1];
  let firstMinute = minuteSelects[0];
  let secondMinute = minuteSelects[1];
  firstMinute.addEventListener(`change`, (e) => {
    e.preventDefault();
    let endingAppointments = [];
    let beginningAppointments = [];
    // Generally, on change, the second minute select should have the minutes before and on the value of the first minute blacked out.

    // REMOVE BLACKED OUT CLASS FOR EACH SECOND TIME MINUTE.
    [...secondMinute.childNodes].forEach((minute, i) => {
      Utility.removeClasses(minute, [`blacked-out`]);
      minute.disabled = '';
    });

    const date = DateTime.fromISO(document.querySelector('.appoint-me-container__sub-container__heading__date').dataset.date);

    appointments.forEach((time, i) => {
      const convertedStartTime = DateTime.fromISO(time.start).minus({ minutes: 15 });
      const convertedEndTime = DateTime.fromISO(time.end).plus({ minutes: 15 });

      // USE APPOINTMENTS THAT ARE ON THIS DAY ONLY
      if (DateTime.fromISO(time.date).day === date.day) {
        // GET THE MINIMUM HOUR THAT IS ABLE TO BE SELECTED BY THE USER FOR THE FIRST VALUE.
        let minimumTime = DateTime.local(Number(date.year), Number(date.month), Number(date.day), Number(firstHour.value), 0, 0);
        // GET THE MAXIMUM TIME THAT CAN BE SELECTED.
        let maximumTime = DateTime.local(Number(date.year), Number(date.month), Number(date.day), Number(firstHour.value), 59, 0);
        // GET THE USER'S SELECTED STARTING TIME
        let firstSelectedTime = DateTime.local(Number(date.year), Number(date.month), Number(date.day), Number(firstHour.value), Number(firstMinute.value), 0);
        let secondSelectedTime = DateTime.local(Number(date.year), Number(date.month), Number(date.day), Number(secondHour.value), Number(firstMinute.value), 0);

        // GATHER APPOINTMENTS THAT END ON THE SELECTED HOUR
        if (convertedEndTime >= minimumTime) {
          endingAppointments.push([convertedStartTime, convertedEndTime]);
        }
        // GATHER APPOINTMENTS THAT BEGIN ON OR AFTER THE SELECTED HOUR
        if (convertedStartTime >= minimumTime) {
          beginningAppointments.push([convertedStartTime, convertedEndTime]);
        }

        if (endingAppointments.length > 0) {
          endingAppointments.forEach((appointment) => {
            // BLACK OUT BASED ON THE ENDING APPOINTMENT ONLY IF THE SELECTED HOURS MATCH
            if (Number(secondSelectedTime.hour) === Number(firstSelectedTime.hour)) {
              [...secondMinute.childNodes].forEach((minute) => {
                let minuteCheckedTime = DateTime.local(Number(date.year), Number(date.month), Number(date.day), Number(firstSelectedTime.hour), Number(minute.value), 0);
                if (minuteCheckedTime <= appointment[1]) {
                  if (minuteCheckedTime <= firstSelectedTime) {
                    Utility.addClasses(minute, [`blacked-out`]);
                    minute.disabled = 'true';
                  }
                }
              });
            }
          });
        }

        let sameHourAppointments = [];
        if (beginningAppointments.length > 0) {
          beginningAppointments.forEach((appointment, i) => {
            if (Number(appointment[0].hour) === Number(secondSelectedTime.hour)) {
              sameHourAppointments.push(appointment);
            }
          });
        }

        if (sameHourAppointments.length >= 1) {
          // EVERY APPOINTMENT IS THE FOLLOWING ARRAY: [BEGINNING, END].
          sameHourAppointments.forEach((appointment, i) => {
            [...secondMinute.childNodes].forEach((minute, i) => {
              let minuteCheckedTime = DateTime.local(Number(date.year), Number(date.month), Number(date.day), Number(secondSelectedTime.hour), Number(minute.value), 0);
              if (minuteCheckedTime >= appointment[0] && minuteCheckedTime <= appointment[1]) {
                Utility.addClasses(minute, [`blacked-out`]);
                minute.disabled = 'true';
              }
            });
          });
        }
      }
    });
  });
};
