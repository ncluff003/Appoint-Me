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
  // THIS FIRST THING IS TO GET THE FREELANCER'S SCHEDULE MADE
  const timePickerModal = document.querySelector('.modal--select-time');
  const hours = document.querySelectorAll('.hour');
  [...hours].forEach((hour, i) => {
    let currentHour = hour;
    hour.addEventListener(`click`, (e) => {
      e.preventDefault();
      const date = document.querySelector('.appoint-me-container__sub-container__heading__date');
      Utility.replaceClassName(timePickerModal, `closed`, `open`);
      const modalDateHeader = document.querySelector('.modal--select-time__header');
      modalDateHeader.textContent = DateTime.fromISO(date.dataset.date).toLocaleString(DateTime.DATE_HUGE);
      modalDateHeader.dataset.date = date.dataset.date;
      let splitHour = currentHour.dataset.time.split(':');
      let splitMinutes = splitHour[1].split(' ');
      let hourSelectOne = document.querySelectorAll('.form__select--hour')[0];
      let hourSelectTwo = document.querySelectorAll('.form__select--hour')[1];

      hourSelectOne.selectedIndex = Number(currentHour.dataset.value);
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
      } else {
        timeOfDayOne.textContent = `AM`;
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

      // GETTING THE PREVIOUSLY ACCEPTED APPOINTMENTS TIME'S BLACKED OUT FOR POTENTIAL CLIENTS SO THEY COULD NOT ACCIDENTALLY OVERLAP ONTO PREVIOUS APPOINTMENTS.

      const minuteSelects = document.querySelectorAll('.form__select--minute');
      let firstMinute = minuteSelects[0];
      let secondMinute = minuteSelects[1];
      const appointments = data.appointments;
      let nearbyAppointments = appointments.filter((time, i) => {
        console.log(Number(DateTime.fromISO(time.start).hour), Number(DateTime.fromISO(time.end).hour), Number(currentHour.dataset.value));
        return Number(DateTime.fromISO(time.start).hour) === Number(currentHour.dataset.value) || Number(DateTime.fromISO(time.end).hour) === Number(currentHour.dataset.value);
      });
      console.log(nearbyAppointments);
      appointments.forEach((time, i) => {
        const convertedStartTime = DateTime.fromISO(time.start).minus({ minutes: 15 });
        const convertedEndTime = DateTime.fromISO(time.end).plus({ minutes: 15 });
        if (DateTime.fromISO(time.date).day === DateTime.fromISO(date.dataset.date).day) {
          console.log(time);
          [...firstMinute.childNodes].forEach((minute, i) => {
            Utility.removeClasses(minute, [`blacked-out`]);
            minute.disabled = ``;
            if (
              DateTime.local(
                DateTime.fromISO(date.dataset.date).year,
                DateTime.fromISO(date.dataset.date).month,
                DateTime.fromISO(date.dataset.date).day,
                Number(currentHour.dataset.value),
                Number(minute.textContent),
                0
              ) >=
                DateTime.local(
                  DateTime.fromISO(time.start).year,
                  DateTime.fromISO(time.start).month,
                  DateTime.fromISO(time.start).day,
                  DateTime.fromISO(time.start).hour,
                  DateTime.fromISO(time.start).minute,
                  DateTime.fromISO(time.start).millisecond
                ).minus({ minutes: 15 }) &&
              DateTime.local(
                DateTime.fromISO(date.dataset.date).year,
                DateTime.fromISO(date.dataset.date).month,
                DateTime.fromISO(date.dataset.date).day,
                Number(currentHour.dataset.value),
                Number(minute.textContent),
                0
              ) <=
                DateTime.local(
                  DateTime.fromISO(time.end).year,
                  DateTime.fromISO(time.end).month,
                  DateTime.fromISO(time.end).day,
                  DateTime.fromISO(time.end).hour,
                  DateTime.fromISO(time.end).minute,
                  DateTime.fromISO(time.end).millisecond
                ).plus({ minutes: 15 })
            ) {
              Utility.addClasses(minute, [`blacked-out`]);
              minute.disabled = `true`;
            } else {
              minute.disabled = '';
            }
          });

          // NEXT IS TO MAKE IT SO POTENTIAL CLIENTS WILL NOT OVERLAP APPOINTMENTS BEFORE THEY TRY TO REQUEST A TIME.

          // * THIS CONDITION IS FOR CHECKING IF THE DAY IS RIGHT FOR THE CURRENT APPOINTMENTS.
          // From here, since the first hour is chosen, the appointments need to be looped through to check if ANY of them are on the SAME day AND between the self-same hour to 3 hours from then.  If there is appointments, then ONLY all the way to the upcoming appointment should be the ONLY available times.  I might even add a buffer for the appointments themselves, just in case.  Maybe 10-15 minutes.
          if (Number(currentHour.dataset.value) <= Number(DateTime.fromISO(time.start).hour) + 3) {
            // [...secondMinute.childNodes].forEach((minute, i) => {
            //   Utility.removeClasses(minute, [`blacked-out`]);
            //   minute.disabled = '';
            // });
            console.log(`Appointment Close By`, Number(DateTime.fromISO(time.start).hour) - Number(currentHour.dataset.value));
          }
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
