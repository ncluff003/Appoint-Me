import * as Utility from './../Utility';
import { DateTime, Info } from 'luxon';

const fillMakeAppointmentModal = (modal, dateText, hour) => {
  let months = Info.months('long');
  const header = document.createElement('header');
  Utility.addClasses(header, [`modal--select-time__header`, `r__modal--select-time__header`]);
  header.textContent = DateTime.fromISO(dateText.dataset.date).toLocaleString(DateTime.DATE_HUGE);

  let splitHour = hour.dataset.time.split(':');
  let splitMinutes = splitHour[1].split(' ');

  const subHeader = document.createElement('h3');
  Utility.addClasses(subHeader, [`modal--select-time__sub-header`, `r__modal--select-time__sub-header`]);
  subHeader.textContent = `Make Appointment`;
  Utility.insertElement(`beforeend`, modal, header);
  Utility.insertElement(`beforeend`, modal, subHeader);

  const form = document.createElement('form');
  Utility.addClasses(form, [`form--appointment`, `r__form--appointment`]);
  Utility.insertElement('beforeend', modal, form);

  const nameSection = document.createElement('section');
  Utility.addClasses(nameSection, [`form__section--names`, `r__form__section--names`]);
  Utility.insertElement(`beforeend`, form, nameSection);

  const nameSectionHalfOne = document.createElement('section');
  Utility.addClasses(nameSectionHalfOne, [`form__section--names__half`, `r__form__section--names__half`]);
  const nameSectionHalfTwo = document.createElement('section');
  Utility.addClasses(nameSectionHalfTwo, [`form__section--names__half`, `r__form__section--names__half`]);
  Utility.insertElements('beforeend', nameSection, [nameSectionHalfOne, nameSectionHalfTwo]);

  const firstnameInput = document.createElement('input');
  Utility.addClasses(firstnameInput, [`form__input`, `r__form__input`]);
  const lastnameInput = document.createElement('input');
  Utility.addClasses(lastnameInput, [`form__input`, `r__form__input`]);

  firstnameInput.placeholder = `John`;
  lastnameInput.placeholder = `Doe`;
  firstnameInput.id = `firstname`;
  firstnameInput.name = `firstname`;
  lastnameInput.id = `lastname`;
  lastnameInput.name = `lastname`;

  const firstnameLabel = document.createElement('label');
  Utility.addClasses(firstnameLabel, [`form__label`, `r__form__label`]);
  firstnameLabel.textContent = `First Name`;
  firstnameLabel.setAttribute(`for`, `firstname`);
  const lastnameLabel = document.createElement('label');
  Utility.addClasses(lastnameLabel, [`form__label`, `r__form__label`]);
  lastnameLabel.textContent = `Last Name`;
  lastnameLabel.setAttribute(`for`, `lastname`);

  Utility.insertElements('beforeend', nameSectionHalfOne, [firstnameInput, firstnameLabel]);
  Utility.insertElements('beforeend', nameSectionHalfTwo, [lastnameInput, lastnameLabel]);

  const timeSectionOne = document.createElement('section');
  Utility.addClasses(timeSectionOne, [`form__section`, `r__form-section`]);

  const toHeader = document.createElement('h3');
  Utility.addClasses(toHeader, [`form__section__to-header`, `r__form__section__to-header`]);
  toHeader.textContent = `To`;

  const timeSectionTwo = document.createElement('section');
  Utility.addClasses(timeSectionTwo, [`form__section`, `r__form-section`]);
  Utility.insertElements('beforeend', modal, [timeSectionOne, toHeader, timeSectionTwo]);

  const hourInputOne = document.createElement('input');
  hourInputOne.type = `number`;
  Utility.addClasses(hourInputOne, [`form__input--hour`, `r__form__input--hour`]);
  hourInputOne.placeholder = splitHour[0];
  hourInputOne.value = splitHour[0];
  hourInputOne.readOnly = `true`;

  const colonOne = document.createElement('p');
  Utility.addClasses(colonOne, [`colon`, `r__colon`]);
  colonOne.textContent = ` : `;

  const minuteInputOne = document.createElement('input');
  Utility.addClasses(minuteInputOne, [`form__input--minute`, `r__form__input--minute`]);
  minuteInputOne.placeholder = `00`;
  minuteInputOne.value = splitMinutes[0];
  minuteInputOne.type = `number`;
  minuteInputOne.min = 0;
  minuteInputOne.max = 59;

  const timeOfDayOne = document.createElement('p');
  Utility.addClasses(timeOfDayOne, [`form__section__tod`, `r__form__section__tod`]);
  timeOfDayOne.textContent = `${splitMinutes[1]}`;

  Utility.insertElements(`beforeend`, timeSectionOne, [hourInputOne, colonOne, minuteInputOne, timeOfDayOne]);

  const hourInputTwo = document.createElement('input');
  Utility.addClasses(hourInputTwo, [`form__input--hour`, `r__form__input--hour`]);
  hourInputTwo.placeholder = splitHour[0];
  hourInputTwo.type = `number`;
  hourInputTwo.min = Number(splitHour[0]);
  hourInputTwo.max = Number(splitHour[0]) + 2;
  if (Number(splitHour[0]) + 2 > 12) {
    hourInputTwo.max = Number(splitHour[0]) + 2 - 12;
  }

  const colonTwo = document.createElement('p');
  colonTwo.textContent = ` : `;
  Utility.addClasses(colonTwo, [`colon`, `r__colon`]);

  const minuteInputTwo = document.createElement('input');
  Utility.addClasses(minuteInputTwo, [`form__input--minute`, `r__form__input--minute`]);
  minuteInputTwo.placeholder = `00`;
  minuteInputTwo.type = `number`;
  minuteInputTwo.min = 0;
  minuteInputTwo.max = 59;

  const timeOfDayTwo = document.createElement('p');
  Utility.addClasses(timeOfDayTwo, [`form__section__tod`, `r__form__section__tod`]);

  Utility.insertElements(`beforeend`, timeSectionTwo, [hourInputTwo, colonTwo, minuteInputTwo, timeOfDayTwo]);

  /*
  
  * First Name
  * Last Name
  * Start Time
  * End Time
  * Phone Number
  * Email
  * Phone Call or Video Chat
  
  */
};

export const createIntervals = (hours, interval, utility) => {
  if (interval === `1-hour`) {
    hours.forEach((hour, i) => {
      let numberOfIntervals = 1,
        startingInterval = 0;
      while (startingInterval < numberOfIntervals) {
        let hourPart = document.createElement('section');
        Utility.addClasses(hourPart, [`hour__part`, `r__hour__part`, `one-hour`]);
        Utility.insertElement('beforeend', hour, hourPart);
        hourPart.dataset.time = hour.dataset.time;
        startingInterval++;
      }
    });
  }
  if (interval === `30-minutes`) {
    hours.forEach((hour, i) => {
      let numberOfIntervals = 2,
        startingInterval = 0;
      while (startingInterval < numberOfIntervals) {
        let hourPart = document.createElement('section');
        Utility.addClasses(hourPart, [`hour__part`, `r__hour__part`, `thirty-minutes`]);
        Utility.insertElement('beforeend', hour, hourPart);
        if (startingInterval === 0) {
          if (i >= 0 && i < 12) {
            hourPart.dataset.time = `${hour.dataset.time} - ${hour.dataset.time.split(':')[0]}:${60 / 2} AM`;
          } else {
            hourPart.dataset.time = `${hour.dataset.time} - ${hour.dataset.time.split(':')[0]}:${60 / 2} PM`;
          }
        } else {
          if (i >= 0 && i < 11) {
            hourPart.dataset.time = `${hour.dataset.time.split(':')[0]}:${60 / 2} AM - ${hours[i + 1].dataset.time}`;
          } else if (i >= 0 && i < 23) {
            hourPart.dataset.time = `${hour.dataset.time.split(':')[0]}:${60 / 2} PM - ${hours[i + 1].dataset.time}`;
          } else {
            console.log(hourPart, i);
            hourPart.dataset.time = `${hour.dataset.time.split(':')[0]}:${60 / 2} PM - ${hours[0].dataset.time}`;
          }
        }
        startingInterval++;
      }
    });
  }
  if (interval === `15-minutes`) {
    hours.forEach((hour, i) => {
      let numberOfIntervals = 4,
        startingInterval = 0;
      while (startingInterval < numberOfIntervals) {
        let hourPart = document.createElement('section');
        Utility.addClasses(hourPart, [`hour__part`, `r__hour__part`, `fifteen-minutes`]);
        Utility.insertElement('beforeend', hour, hourPart);
        if (startingInterval === 0) {
          if (i >= 0 && i < 12) {
            hourPart.dataset.time = `${hour.dataset.time} - ${hour.dataset.time.split(':')[0]}:${60 / 4} AM`;
          } else {
            hourPart.dataset.time = `${hour.dataset.time} - ${hour.dataset.time.split(':')[0]}:${60 / 4} PM`;
          }
        } else if (startingInterval === 1) {
          if (i >= 0 && i < 12) {
            hourPart.dataset.time = `${hour.dataset.time.split(':')[0]}:${60 / 4} AM - ${hour.dataset.time.split(':')[0]}:${60 / 2} AM`;
          } else {
            hourPart.dataset.time = `${hour.dataset.time.split(':')[0]}:${60 / 4} PM - ${hour.dataset.time.split(':')[0]}:${60 / 2} PM`;
          }
        } else if (startingInterval === 2) {
          if (i >= 0 && i < 12) {
            hourPart.dataset.time = `${hour.dataset.time.split(':')[0]}:${60 / 2} AM - ${hour.dataset.time.split(':')[0]}:${60 * 0.75} AM`;
          } else {
            hourPart.dataset.time = `${hour.dataset.time.split(':')[0]}:${60 / 2} PM - ${hour.dataset.time.split(':')[0]}:${60 * 0.75} PM`;
          }
        } else {
          if (i >= 0 && i < 12) {
            hourPart.dataset.time = `${hour.dataset.time.split(':')[0]}:${60 * 0.75} AM - ${hours[i + 1].dataset.time}`;
          } else if (i >= 12 && i < 23) {
            hourPart.dataset.time = `${hour.dataset.time.split(':')[0]}:${60 * 0.75} PM - ${hours[i + 1].dataset.time}`;
          } else {
            hourPart.dataset.time = `${hour.dataset.time.split(':')[0]}:${60 * 0.75} PM - ${hours[0].dataset.time}`;
          }
        }
        startingInterval++;
      }
    });
  }
};

export const fillDay = (container, intervals, utility) => {
  const timePickerModal = document.querySelector('.modal--select-time');
  let hours = 24;
  let startHour = 0;
  while (startHour < hours) {
    const hour = document.createElement('section');
    Utility.addClasses(hour, [`hour`, `r__hour`]);
    Utility.insertElement('beforeend', container, hour);

    hour.addEventListener(`click`, (e) => {
      e.preventDefault();
      Utility.replaceClassName(timePickerModal, `closed`, `open`);
      const date = document.querySelector('.appoint-me-container__sub-container__heading__date');
      fillMakeAppointmentModal(timePickerModal, date, hour);
    });

    const time = document.createElement('p');
    Utility.addClasses(time, [`hour__time`, `r__hour__time`]);

    if (startHour === 0) {
      time.textContent = `12:00 AM`;
      hour.dataset.time = `12:00 AM`;
    } else if (startHour > 0 && startHour < 12) {
      time.textContent = `${startHour}:00 AM`;
      hour.dataset.time = `${startHour}:00 AM`;
    } else if (startHour === 12) {
      time.textContent = `${startHour}:00 PM`;
      hour.dataset.time = `${startHour}:00 PM`;
    } else {
      time.textContent = `${startHour - 12}:00 PM`;
      hour.dataset.time = `${startHour - 12}:00 PM`;
    }
    Utility.insertElement(`beforeend`, hour, time);
    startHour++;
  }
};
