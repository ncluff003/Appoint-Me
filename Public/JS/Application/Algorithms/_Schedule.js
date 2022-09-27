import * as Utility from './../Utility';
import axios from 'axios';
import qs from 'qs';
import { DateTime, Info } from 'luxon';

export const submitAppointment = async (details) => {
  event.preventDefault();
  console.log(details);
  try {
    const response = await axios({
      method: 'POST',
      url: '/App/Appointment',
      data: qs.stringify(details),
    });

    console.log(response);
  } catch (error) {
    console.log(error);
  }
};

export const watchForAppointments = (app, data, utility) => {
  const timePickerModal = document.querySelector('.modal--select-time');
  const hours = document.querySelectorAll('.hour');
  [...hours].forEach((hour, i) => {
    let currentHour = hour;
    hour.addEventListener(`click`, (e) => {
      e.preventDefault();
      Utility.replaceClassName(timePickerModal, `closed`, `open`);
      const date = document.querySelector('.appoint-me-container__sub-container__heading__date');
      console.log(date, date.dataset.date, date.dataset);
      const modalDateHeader = document.querySelector('.modal--select-time__header');
      modalDateHeader.textContent = DateTime.fromISO(date.dataset.date).toLocaleString(DateTime.DATE_HUGE);
      modalDateHeader.dataset.date = date.dataset.date;
      let splitHour = currentHour.dataset.time.split(':');
      let splitMinutes = splitHour[1].split(' ');
      let hourSelectOne = document.querySelectorAll('.form__select--hour')[0];
      let hourSelectTwo = document.querySelectorAll('.form__select--hour')[1];
      [...hourSelectOne.childNodes].forEach((child) => {
        if (child.value !== 0 && currentHour.dataset.time === `12:00 AM`) {
          child.disabled = true;
          Utility.addClasses(child, [`blacked-out`]);
        } else if (currentHour.dataset.time !== `12:00 AM`) {
          if (splitMinutes[1] === `AM` && Number(child.value) !== Number(splitHour[0])) {
            child.disabled = true;
            Utility.addClasses(child, [`blacked-out`]);
          } else if (splitMinutes[1] === `PM` && Number(child.value) !== Number(splitHour[0]) + 12) {
            child.disabled = true;
            Utility.addClasses(child, [`blacked-out`]);
          } else {
            child.disabled = false;
            Utility.removeClasses(child, [`blacked-out`]);
          }
        } else {
          child.disabled = false;
          Utility.removeClasses(child, [`blacked-out`]);
        }
      });

      let firstHour;
      [...hourSelectTwo.childNodes].forEach((child) => {
        Utility.addClasses(child, [`blacked-out`]);
        child.disabled = true;
        let timeOfDay = splitMinutes[1];
        if (timeOfDay === `AM` || (timeOfDay === `PM` && Number(splitHour[0]) === 12)) {
          firstHour = Number(splitHour[0]);
        } else {
          firstHour = Number(splitHour[0]) + 12;
        }
      });

      let beginningHour = 0;
      let endHour = 4;

      // * Getting the selected schedule info.
      console.log(data);
      let scheduleEnd = data.schedule.split('-')[1];
      let timeOfDay, time;
      if (`${scheduleEnd}`.length === 3) {
        timeOfDay = `${scheduleEnd}`.slice(1);
        time = Number(`${scheduleEnd}`.slice(0, 1));
      } else if (`${scheduleEnd}`.length === 4) {
        timeOfDay = `${scheduleEnd}`.slice(2);
        time = Number(`${scheduleEnd}`.slice(0, 2));
      }

      let hour = Number(splitHour[0]);
      if (hour === time) {
        endHour = 1;
      } else if (hour === time - 1) {
        endHour = 2;
      } else if (hour === time - 2) {
        endHour = 3;
      }

      while (beginningHour < endHour) {
        Utility.removeClasses(hourSelectTwo.childNodes[firstHour], [`blacked-out`]);
        hourSelectTwo.childNodes[firstHour].disabled = false;
        firstHour += 1;
        beginningHour++;
      }

      let timeOfDayOne = document.querySelectorAll('.form__section__tod')[0];
      if (splitMinutes[1] === `PM`) {
        timeOfDayOne.textContent = `PM`;
      }
      let timeOfDayTwo = document.querySelectorAll('.form__section__tod')[1];

      hourSelectTwo.addEventListener(`change`, (e) => {
        e.preventDefault();
        if (hourSelectTwo.value >= 12) {
          timeOfDayTwo.textContent = `PM`;
        } else {
          timeOfDayTwo.textContent = `AM`;
        }
      });
    });
  });
};

export const buildSchedule = (container, schedule, data, utility) => {
  const hours = document.querySelectorAll('.hour');
  let startOfDay, endOfDay, start, end;

  if (schedule.split('-')[0].length === 3) {
    startOfDay = schedule.split('-')[0].split('').slice(1, 3).join('');
    start = schedule.split('-')[0].split('')[0];
  } else if (schedule.split('-')[0].length === 4) {
    startOfDay = schedule.split('-')[0].split('').slice(2, 4).join('');
    start = [schedule.split('-')[0].split('')[0], schedule.split('-')[0].split('')[1]].join('');
  }

  if (schedule.split('-')[1].length === 3) {
    endOfDay = schedule.split('-')[1].split('').slice(1, 3).join('');
    end = schedule.split('-')[1].split('')[0];
  } else if (schedule.split('-')[1].length === 4) {
    endOfDay = schedule.split('-')[1].split('').slice(2, 4).join('');
    end = [schedule.split('-')[1].split('')[0], schedule.split('-')[1].split('')[1]].join('');
  }

  start = Number(start);
  end = Number(end);

  if (startOfDay === `pm`) {
    start += 12;
  }
  if (endOfDay === `pm`) {
    end += 12;
  }

  console.log(startOfDay, endOfDay, start, end);

  if ((startOfDay === `am` && endOfDay === `pm`) || (startOfDay === `am` && endOfDay === `am`) || (startOfDay === `pm` && endOfDay === `pm`)) {
    hours.forEach((hour, i) => {
      if (i < start || i > end) {
        Utility.addClasses(hour, [`blacked-out`]);
        hour.style.pointerEvents = 'none';
      }
    });
  } else if (startOfDay === `pm` && endOfDay === `am`) {
    hours.forEach((hour, i) => {
      if (i > end && i < start) {
        Utility.addClasses(hour, [`blacked-out`]);
        hour.style.pointerEvents = 'none';
      }
    });
  }
};
