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
      let endHour = 3;
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

      const appointments = data.appointments;
      while (beginningHour < endHour) {
        Utility.removeClasses(hourSelectTwo.childNodes[firstHour], [`blacked-out`]);
        hourSelectTwo.childNodes[firstHour].disabled = '';
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
      let nearbyAppointments = appointments.filter((time, i) => {
        console.log(Number(DateTime.fromISO(time.start).hour), Number(DateTime.fromISO(time.end).hour), Number(currentHour.dataset.value));
        return Number(DateTime.fromISO(time.start).hour) === Number(currentHour.dataset.value) || Number(DateTime.fromISO(time.end).hour) === Number(currentHour.dataset.value);
      });

      console.log(nearbyAppointments);
      // CLEAR THE BLACKED OUT MINUTES EVERY SINGLE TIME AN HOUR IS CLICKED
      // -- This is to reset the day to show the correct blacked out minutes according to the hour.
      [...firstMinute.childNodes].forEach((minute, i) => {
        Utility.removeClasses(minute, [`blacked-out`]);
        minute.disabled = ``;
      });

      const hourBeforePrevious = hours[[...hours].indexOf(currentHour) - 2];
      const previousHour = hours[[...hours].indexOf(currentHour) - 1];
      const nextHour = hours[[...hours].indexOf(currentHour) + 1];
      const hourAfterNext = hours[[...hours].indexOf(currentHour) + 2];

      console.log(nextHour);
      appointments.forEach((time, i) => {
        const convertedStartTime = DateTime.fromISO(time.start).minus({ minutes: 15 });
        const convertedEndTime = DateTime.fromISO(time.end).plus({ minutes: 15 });
        if (DateTime.fromISO(time.date).day === DateTime.fromISO(date.dataset.date).day) {
          console.log(convertedStartTime.hour, convertedEndTime.hour);
          console.log(time);
          [...firstMinute.childNodes].forEach((minute, i) => {
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
            }
          });
          [...secondMinute.childNodes].forEach((minute, i) => {
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
            }
          });

          let newAvailableHours;
          // CHECK IF THERE IS AN APPOINTMENT THAT IS AT MOST 2 HOURS AWAY & THE DIFFERENCE IS GREATER THAN NEGATIVE ONE.
          if (Math.abs(Number(convertedStartTime.hour) - Number(currentHour.dataset.value) <= 2) && Number(convertedStartTime.hour) - Number(currentHour.dataset.value) > -1) {
            console.log(`An appointment is close by!`, currentHour.nextSibling);
            let hourDifference = Math.abs(Number(convertedStartTime.hour) - Number(currentHour.dataset.value));
            let nextHour = Number(currentHour.nextSibling.dataset.value);
            let hourAfterNext = Number(currentHour.nextSibling.nextSibling.dataset.value);
            console.log(nextHour, hourAfterNext, hourDifference);
            console.log(
              DateTime.local(
                Number(DateTime.fromISO(date.dataset.date).year),
                Number(DateTime.fromISO(date.dataset.date).month),
                Number(DateTime.fromISO(date.dataset.date).day),
                nextHour,
                Number(DateTime.fromISO(date.dataset.date).minute),
                Number(DateTime.fromISO(date.dataset.date).second)
              )
            );
            if (
              hourDifference === 0 ||
              (hourDifference === 1 &&
                convertedStartTime <=
                  DateTime.local(Number(DateTime.fromISO(date.dataset.date).year), Number(DateTime.fromISO(date.dataset.date).month), Number(DateTime.fromISO(date.dataset.date).day), nextHour, 0, 0))
            ) {
              // Black out the next two hours.  (ie. if it is anywhere from 9:00am to 10:00am, 10 and 11 are blacked out.)
              console.log(`Two Hours Blacked Out.`);
              [...hourSelectTwo.childNodes].forEach((hourItem) => {
                if (Number(hourItem.value) === nextHour || Number(hourItem.value) === hourAfterNext) {
                  Utility.addClasses(hourItem, [`blacked-out`]);
                  hourItem.disabled = 'true';
                }
              });
              newAvailableHours = [...hourSelectTwo.childNodes].filter((hour) => {
                return !hour.classList.contains('blacked-out');
              });
              hourSelectTwo.selectedIndex = Number(newAvailableHours[0].value);
              if (hourSelectTwo.selectedIndex > 12) {
                timeOfDayTwo.textContent = `PM`;
              }
            } else if (
              hourDifference === 1 &&
              convertedStartTime >=
                DateTime.local(Number(DateTime.fromISO(date.dataset.date).year), Number(DateTime.fromISO(date.dataset.date).month), Number(DateTime.fromISO(date.dataset.date).day), nextHour, 0, 0)
            ) {
              newAvailableHours = [...hourSelectTwo.childNodes].filter((hour) => {
                return !hour.classList.contains('blacked-out');
              });
              console.log(`One Hour Blacked Out.`);
              Utility.addClasses(newAvailableHours[2], [`blacked-out`]);
              newAvailableHours[2].disabled = 'true';
              hourSelectTwo.selectedIndex = Number(newAvailableHours[0].value);
              if (hourSelectTwo.selectedIndex > 12) {
                timeOfDayTwo.textContent = `PM`;
              }
            } else if (hourDifference === 2) {
              console.log(`Zero Hours Blacked Out.`);
              // Black out only the hour after the next.  (ie. if it is anywhere from 10:01am onwards, only 11 is blacked out.)
              hourSelectTwo.selectedIndex = Number(newAvailableHours[0].value);
              if (hourSelectTwo.selectedIndex > 12) {
                timeOfDayTwo.textContent = `PM`;
              }
            }
          }

          // DECLARE PREVIOUS APPOINTMENT AND NEXT APPOINTMENT
          let previousAppointment, nextAppointment;

          // IF NUMBER OF APPOINTMENTS ARE MORE THAN 0NE, THERE IS A PREVIOUS APPOINTMENT FROM SECOND ONWARDS.
          if (i > 0) {
            previousAppointment = appointments[i - 1];
          }
          if (appointments.length > 1) {
            // IF THERE IS A NEXT APPOINTMENT SET THE NEXT APPOINTMENT
            if (appointments[i + 1] !== undefined) {
              nextAppointment = appointments[i + 1];
            }
          }

          /*
            * STEPS TO SETTING UP AN APPOINTMENT
            x @ 1. Click on an hour.
              x @ a. Make starting hour the currently clicked hour.
              x @ b. Black out hours other than the clicked hour.
              x @ c. Black out available starting minutes.
              x @ d. Black out ending hours based on if an appointment is nearby or not.
            x @ 2. Check selected hour.
            @ 3. Select first minute to complete start time.
              @ a. Black out ending minutes based off of the selected starting minute. (Minutes before the selected starting time.)
            @ 4. Select ending hour.
              @ a. If there is an hour ahead of the time (ie 10am compared to 9am), black out the minutes as are needed upon the change of the second hour.
            @ 5. Select ending minute to complete selected appointment time.
          */
        } // END -- IF IT IS INSIDE OF THE CURRENT DAY
      }); // END OF APPOINTMENT LOOP
    }); // HOUR CLICKED
  }); // HOUR LOOP
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

  if ((startOfDay === `am` && endOfDay === `pm`) || (startOfDay === `am` && endOfDay === `am`) || (startOfDay === `pm` && endOfDay === `pm`)) {
    hours.forEach((hour, i) => {
      if (i < start || i + 1 > end) {
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
