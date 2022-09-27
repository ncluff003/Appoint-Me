import * as Utility from './../Utility';
import { DateTime, Info } from 'luxon';
import { get, getAll, set, timeTillExpires, remove, useNamespace } from './../../Classes/Cache';
import { submitAppointment } from './_Schedule';

const fillMakeAppointmentModal = (modal, dateText, hour) => {
  // * Eventually what will happen here is literally ONLY the filling up of everything, and it will ONLY happen once.
  let splitHour = hour.dataset.time.split(':');
  let splitMinutes = splitHour[1].split(' ');

  console.log(splitHour);

  if (modal.childNodes.length === 1) {
    let months = Info.months('long');
    let utility = get(`utility`);
    const header = document.createElement('header');
    Utility.addClasses(header, [`modal--select-time__header`, `r__modal--select-time__header`]);
    header.textContent = DateTime.fromISO(dateText.dataset.date).toLocaleString(DateTime.DATE_HUGE);

    const subHeader = document.createElement('h3');
    Utility.addClasses(subHeader, [`modal--select-time__sub-header`, `r__modal--select-time__sub-header`]);
    subHeader.textContent = `Make Appointment`;
    Utility.insertElement(`beforeend`, modal, header);
    Utility.insertElement(`beforeend`, modal, subHeader);

    const form = document.createElement('form');
    Utility.addClasses(form, [`form--appointment`, `r__form--appointment`]);
    Utility.insertElement(`beforeend`, modal, form);

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
    Utility.insertElements('beforeend', form, [timeSectionOne, toHeader, timeSectionTwo]);

    const hourSelectOne = document.createElement('select');
    Utility.addClasses(hourSelectOne, [`form__select--hour`, `r__form__select--hour`]);

    let hourStart = 0;
    let numberOfHours = 24;

    const colonOne = document.createElement('p');
    Utility.addClasses(colonOne, [`colon`, `r__colon`]);
    colonOne.textContent = ` : `;

    const minuteSelectOne = document.createElement('select');
    Utility.addClasses(minuteSelectOne, [`form__select--minute`, `r__form__select--minute`]);

    let minuteStart = 0;
    let minuteEnd = utility.minutes.length;

    while (minuteStart < minuteEnd) {
      let option = document.createElement('option');
      Utility.addClasses(option, [`form__select--minute__option`, `r__form__select--minute__option`]);
      if (minuteStart === 0) {
        option.selected = true;
      }
      option.textContent = utility.minutes[minuteStart];
      option.value = Number(utility.minutes[minuteStart]);
      Utility.insertElement(`beforeend`, minuteSelectOne, option);
      minuteStart++;
    }

    const timeOfDayOne = document.createElement('p');
    Utility.addClasses(timeOfDayOne, [`form__section__tod`, `r__form__section__tod`]);
    timeOfDayOne.textContent = `${splitMinutes[1]}`;

    Utility.insertElements(`beforeend`, timeSectionOne, [hourSelectOne, colonOne, minuteSelectOne, timeOfDayOne]);

    const hourSelectTwo = document.createElement('select');
    Utility.addClasses(hourSelectTwo, [`form__select--hour`, `r__form__select--hour`]);

    while (hourStart < numberOfHours) {
      let optionOne = document.createElement('option');
      let optionTwo = document.createElement('option');

      Utility.addClasses(optionOne, [`form__select--hour__option`, `r__form__select--hour__option`]);
      Utility.addClasses(optionTwo, [`form__select--hour__option`, `r__form__select--hour__option`]);
      if (hourStart === 0) {
        optionOne.textContent = 12;
        optionTwo.textContent = 12;
        optionOne.value = hourStart;
        optionTwo.value = hourStart;
        optionOne.selected = true;
        optionTwo.selected = true;
      } else if (hourStart > 12) {
        optionOne.textContent = hourStart - 12;
        optionTwo.textContent = hourStart - 12;
        optionOne.value = hourStart;
        optionTwo.value = hourStart;
      } else {
        optionOne.textContent = hourStart;
        optionTwo.textContent = hourStart;
        optionOne.value = hourStart;
        optionTwo.value = hourStart;
      }
      Utility.insertElement(`beforeend`, hourSelectOne, optionOne);
      Utility.insertElement(`beforeend`, hourSelectTwo, optionTwo);

      hourStart++;
    }

    const colonTwo = document.createElement('p');
    colonTwo.textContent = ` : `;
    Utility.addClasses(colonTwo, [`colon`, `r__colon`]);

    const minuteSelectTwo = document.createElement('select');
    Utility.addClasses(minuteSelectTwo, [`form__select--minute`, `r__form__select--minute`]);

    let minuteStartTwo = 0;
    let minuteEndTwo = utility.minutes.length;

    while (minuteStartTwo < minuteEndTwo) {
      let option = document.createElement('option');
      Utility.addClasses(option, [`form__select--minute__option`, `r__form__select--minute__option`]);
      if (minuteStartTwo === 0) {
        option.selected = true;
      }
      option.textContent = utility.minutes[minuteStartTwo];
      option.value = Number(utility.minutes[minuteStartTwo]);
      Utility.insertElement(`beforeend`, minuteSelectTwo, option);
      minuteStartTwo++;
    }

    const timeOfDayTwo = document.createElement('p');
    Utility.addClasses(timeOfDayTwo, [`form__section__tod`, `r__form__section__tod`]);
    timeOfDayTwo.textContent = `AM`;

    Utility.insertElements(`beforeend`, timeSectionTwo, [hourSelectTwo, colonTwo, minuteSelectTwo, timeOfDayTwo]);

    const emailSection = document.createElement('section');
    Utility.addClasses(emailSection, [`form__section--email`, `r__form__section--email`]);

    const emailInput = document.createElement('input');
    emailInput.id = `email`;
    emailInput.name = `email`;
    emailInput.type = `email`;
    emailInput.pattern = `[^@]+@[^@]+[\.]+(com|net|org|io|edu|(co.uk)|me|tech|money)+$`;
    emailInput.placeholder = `Enter Email Address`;
    Utility.addClasses(emailInput, [`form__input--email`, `r__form__input--email`]);
    Utility.insertElement(`beforeend`, emailSection, emailInput);

    const emailLabel = document.createElement('label');
    Utility.addClasses(emailLabel, [`form__label--email`, `r__form__label--email`]);
    Utility.insertElement(`beforeend`, emailSection, emailLabel);
    emailLabel.textContent = `Email Address`;
    emailLabel.setAttribute(`for`, `email`);

    const phoneSection = document.createElement('section');
    Utility.addClasses(phoneSection, [`form__section--phone`, `r__form__section--phone`]);

    const phoneInput = document.createElement('input');
    phoneInput.id = `phone`;
    phoneInput.name = `phone`;
    phoneInput.type = `tel`;
    phoneInput.placeholder = `Enter Phone Number`;
    Utility.addClasses(phoneInput, [`form__input--phone`, `r__form__input--phone`]);
    Utility.insertElement(`beforeend`, phoneSection, phoneInput);

    const phoneLabel = document.createElement('label');
    Utility.addClasses(phoneLabel, [`form__label--phone`, `r__form__label--phone`]);
    Utility.insertElement(`beforeend`, phoneSection, phoneLabel);
    phoneLabel.textContent = `Phone Number`;
    phoneLabel.setAttribute(`for`, `phone`);

    Utility.insertElements(`beforeend`, form, [emailSection, phoneSection]);

    const commPreferenceHeader = document.createElement('h3');
    Utility.addClasses(commPreferenceHeader, [`communication-preference-header`, `r__communication-preference-header`]);
    commPreferenceHeader.textContent = `Select Preference For Discussing Details`;
    Utility.insertElement(`beforeend`, form, commPreferenceHeader);

    const communicationPreferenceSection = document.createElement('section');
    Utility.addClasses(communicationPreferenceSection, [`form__section--commPreference`, `r__form__section--commPreference`]);
    Utility.insertElement(`beforeend`, form, communicationPreferenceSection);

    const phoneCallInput = document.createElement('input');
    phoneCallInput.type = `checkbox`;

    const phoneCallLabel = document.createElement('label');
    phoneCallLabel.textContent = `Phone Call`;

    const videoChatlInput = document.createElement('input');
    videoChatlInput.type = `checkbox`;

    const videoChatLabel = document.createElement('label');
    videoChatLabel.textContent = `Video Chat`;

    [phoneCallLabel, videoChatLabel].forEach((label) => {
      label.addEventListener(`click`, (e) => {
        e.preventDefault();
        [phoneCallLabel, videoChatLabel].forEach((label) => Utility.removeClasses(label, [`clicked`]));
        Utility.addClasses(label, [`clicked`]);
      });
    });

    Utility.insertElements(`beforeend`, communicationPreferenceSection, [phoneCallInput, phoneCallLabel, videoChatlInput, videoChatLabel]);

    const submitAppointmentButton = document.createElement('button');
    submitAppointmentButton.textContent = `Submit Appointment`;
    Utility.addClasses(submitAppointmentButton, [`button--modal`, `button--modal`]);
    Utility.insertElement('beforeend', form, submitAppointmentButton);
  }

  let number;
  const phoneInput = document.querySelector('.form__input--phone');
  phoneInput.addEventListener(`keyup`, (e) => {
    e.preventDefault();
    let phoneNumber = Utility.formatPhoneNumber(phoneInput.value);
    phoneInput.value = phoneNumber;

    let numberSplit = phoneNumber.split(' ');
    let areacodeSplit = numberSplit[0].split('');
    let areacode = [areacodeSplit[1], areacodeSplit[2], areacodeSplit[3]].join('');
    number = [areacode, numberSplit[1], numberSplit[3]].join('');
  });

  let hourSelectOne = document.querySelectorAll('.form__select--hour')[0];

  [...hourSelectOne.childNodes].forEach((child) => {
    Utility.removeClasses(child, [`blacked-out`]);
  });
};

export const createIntervals = (hours, interval, modal, utility) => {
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

  const scheduleHours = document.querySelectorAll('.hour');
  const date = document.querySelector('.appoint-me-container__sub-container__heading__date');
  scheduleHours.forEach((hour, i) => {
    fillMakeAppointmentModal(modal, date, hour);
  });

  const hoursSelections = document.querySelectorAll('.form__select--hour');
  const minutes = document.querySelectorAll('.form__select--minute');
  const start = hoursSelections[0];
  const end = hoursSelections[1];
  const startMinute = minutes[0];
  const endMinute = minutes[1];
  console.log(start.value, end.value, startMinute.value, endMinute.value);

  const submitAppointmentButton = document.querySelectorAll(`.button--modal`)[0];
  const appointmentForm = document.querySelectorAll('.form--appointment');
  console.log(submitAppointmentButton, appointmentForm, modal);

  let timeOfDayOne = document.querySelectorAll('.form__section__tod')[0];
  let hourSelectOne = document.querySelectorAll('.form__select--hour')[0];
  let timeOfDayTwo = document.querySelectorAll('.form__section__tod')[1];
  let hourSelectTwo = document.querySelectorAll('.form__select--hour')[1];

  submitAppointmentButton.addEventListener(`click`, (e) => {
    e.preventDefault();
    if (start.value > 12) {
      start.value -= 12;
    } else if (end.value > 12) {
      end.value -= 12;
    }

    // * If startMinute is one digit it needs a padded zero.
    let hourOne = start.value;
    let hourTwo = end.value;
    let minutesOne = startMinute.value;
    let minutesTwo = endMinute.value;

    if (`${minutesOne}`.length === 1) {
      minutesOne = `${minutesOne}`.padStart(2, 0);
    }
    if (`${minutesTwo}`.length === 1) {
      minutesTwo = `${minutesTwo}`.padStart(2, 0);
    }

    const firstname = document.querySelector('#firstname').value;
    const lastname = document.querySelector('#lastname').value;
    const email = document.querySelector('#email').value;
    const phone = document.querySelector('#phone').value;
    let communicationPreference;

    const commPreferenceChildren = document.querySelector('.form__section--commPreference').childNodes;
    commPreferenceChildren.forEach((child) => {
      if (child.classList.contains('clicked')) {
        communicationPreference = child.textContent;
      }
    });

    submitAppointment({
      date: date.dataset.date,
      startTime: `${hourOne}:${minutesOne} ${timeOfDayOne.textContent}`,
      endTime: `${hourTwo}:${minutesTwo} ${timeOfDayTwo.textContent}`,
      firstname: firstname,
      lastname: lastname,
      email: email,
      phoneNumber: phone,
      communicationPreference: communicationPreference,
    });
  });
};

export const fillDay = (container, intervals, data, utility) => {
  const timePickerModal = document.querySelector('.modal--select-time');
  let hours = 24;
  let startHour = 0;
  while (startHour < hours) {
    const hour = document.createElement('section');
    console.log(hour);
    Utility.addClasses(hour, [`hour`, `r__hour`]);
    Utility.insertElement('beforeend', container, hour);

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
