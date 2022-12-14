import * as Utility from './../Utility';
import axios from 'axios';
import qs from 'qs';
import { get, getAll, set, timeTillExpires, remove, useNamespace } from './../../Classes/Cache';
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

const getScheduleEndings = (time) => {
  let endScheduleMeridiem, endScheduleHour;
  if (time.length === 3) {
    endScheduleHour = Number(time[0]);
    endScheduleMeridiem = time.slice(1).toUpperCase();
  } else if (time.length === 4) {
    endScheduleHour = Number(time.slice(0, 1));
    endScheduleMeridiem = time.slice(2).toUpperCase();
  }
  return { endScheduleHour, endScheduleMeridiem };
};

const disableAllOptions = (select) => {
  [...select.childNodes].forEach((child) => {
    Utility.addClasses(child, [`blacked-out`]);
    child.disabled = 'true';
  });
};

const enableAllOptions = (select) => {
  [...select.childNodes].forEach((child) => {
    Utility.removeClasses(child, [`blacked-out`]);
    child.disabled = '';
  });
};

export const watchForAppointments = (app, data, utility) => {
  const schedule = data.schedule;
  const appointments = data.appointments;
  // THIS FIRST THING IS TO GET THE FREELANCER'S SCHEDULE MADE
  const appointmentRequestModal = document.querySelector('.modal--select-time');
  const hours = document.querySelectorAll('.hour');
  [...hours].forEach((hour, i) => {
    let currentHour = hour;
    hour.addEventListener(`click`, (e) => {
      e.preventDefault();
      // DECLARE ESSENTIAL VARIABLES TO THE PROCESS OF REQUESTING AN APPOINTMENT
      const dateText = document.querySelector('.appoint-me-container__sub-container__heading__date');
      const date = document.querySelector('.appoint-me-container__sub-container__heading__date').dataset.date;
      const modalHeader = document.querySelector('.modal--select-time__header');
      let hourSelectOne = document.querySelectorAll('.form__select--hour')[0];
      let hourSelectTwo = document.querySelectorAll('.form__select--hour')[1];
      let timeOfDayOne = document.querySelectorAll('.form__section__tod')[0];
      let timeOfDayTwo = document.querySelectorAll('.form__section__tod')[1];

      // SET UP APPOINTMENT REQUEST MODAL
      // Open the modal
      Utility.replaceClassName(appointmentRequestModal, `closed`, `open`);

      // Set the text and the data for the modal's header.
      modalHeader.textContent = DateTime.fromISO(date).toLocaleString(DateTime.DATE_HUGE);
      modalHeader.dataset.date = date;

      // Set the select values to the hour that was selected.
      hourSelectOne.selectedIndex = Number(currentHour.dataset.value);
      hourSelectTwo.value = Number(currentHour.dataset.value);

      // Set the first hour select element's value.
      if (hourSelectOne.value >= 12) {
        timeOfDayOne.textContent = `PM`;
      } else {
        timeOfDayOne.textContent = `AM`;
      }

      // Set the second hour select element's value.
      if (hourSelectTwo.value >= 12) {
        timeOfDayTwo.textContent = `PM`;
      } else {
        timeOfDayTwo.textContent = `AM`;
      }

      // Handling a schedule that is NOT an overnight one.
      if (utility.overnight === false) {
        // Making only the selected hour be available for the start of the requested appointment.
        // First, enable all first hour options.
        enableAllOptions(hourSelectOne);

        // Disable all but the selected hour.
        [...hourSelectOne.childNodes].forEach((child, i) => {
          if (i !== hourSelectOne.selectedIndex) {
            Utility.addClasses(child, [`blacked-out`]);
            child.disabled = 'true';
          }
        });

        // Disable all second hour select options.
        disableAllOptions(hourSelectTwo);

        // Get the first hour that needs to be available to select for the end time of the potential appointment.
        let firstHour = hourSelectTwo.selectedIndex;

        // Get max appointment length.
        const maxAppointmentLength = Number(data.maxAppointmentLength.split(' ')[0]);

        // Set the starting hour count.
        let hourCounter = 0;
        // Set default values for limiting how many hours in advance appointments can be made.
        let endHour = maxAppointmentLength;

        // Split the schedule
        const splitSchedule = schedule.split('-');
        const scheduleStart = splitSchedule[0];
        const scheduleEnd = splitSchedule[1];

        // Get the end of the schedule
        let { endScheduleHour, endScheduleMeridiem } = getScheduleEndings(scheduleEnd);

        // Get maximum hours able to be selected for the potential requested appointment.
        let endCheckTime, selectedTime;
        selectedTime = DateTime.local(DateTime.fromISO(date).year, DateTime.fromISO(date).month, DateTime.fromISO(date).day, Number(currentHour.dataset.value), 0, 0);
        if (endScheduleMeridiem === 'PM' && endScheduleHour !== 12) {
          endScheduleHour += 12;
          endCheckTime = DateTime.local(DateTime.fromISO(date).year, DateTime.fromISO(date).month, DateTime.fromISO(date).day, endScheduleHour, 0, 0);
        } else if (endScheduleMeridiem === `AM` && endScheduleHour === 12) {
          endScheduleHour = 0;
          endCheckTime = DateTime.local(DateTime.fromISO(date).year, DateTime.fromISO(date).month, DateTime.fromISO(date).day, endScheduleHour, 0, 0).plus({ days: 1 });
        } else {
          endCheckTime = DateTime.local(DateTime.fromISO(date).year, DateTime.fromISO(date).month, DateTime.fromISO(date).day, endScheduleHour, 0, 0);
        }

        if (endCheckTime.diff(selectedTime, ['hours']).toObject().hours === 0) {
          endHour = 1;
        } else if (endCheckTime.diff(selectedTime, ['hours']).toObject().hours === 1) {
          endHour = 2;
        } else {
          endHour = maxAppointmentLength;
        }

        // Enable the available hours for the potential requested appointment.
        while (hourCounter < endHour) {
          Utility.removeClasses(hourSelectTwo.childNodes[firstHour], [`blacked-out`]);
          hourSelectTwo.childNodes[firstHour].disabled = '';
          firstHour += 1;
          hourCounter++;
        }

        // Change the time of day text as needed upon the change of the second hour select element.
        hourSelectTwo.addEventListener(`change`, (e) => {
          e.preventDefault();
          if (hourSelectTwo.value >= 12) {
            timeOfDayTwo.textContent = `PM`;
          } else {
            timeOfDayTwo.textContent = `AM`;
          }
        });

        /*
          * THIS IS WHERE I AM -- THE SECOND HOUR SELECT IS NOW SHOWING HOURS BASED OFF OF THE FREELANCER'S CLOCK OUT TIME OR END OF SCHEDULE.  NEXT STEPS ARE AS FOLLOWS:

          @ 1. Adjust the now available hours based on appointments.
          @ 2. Adjust the available minutes to be selected on the first minute select element based on nearby appointments in the selected hour.

          ~ -- The following steps happen in the Appoint-Me-App JavaScript file.
          @ 3. Adjust the second minute select element available minutes based on the first minute selection.
          @ 4. Adjust the second minute select element further based on the second hour selection.
        */
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

        console.log(utility.overnight);

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
                    DateTime.local(
                      Number(DateTime.fromISO(date.dataset.date).year),
                      Number(DateTime.fromISO(date.dataset.date).month),
                      Number(DateTime.fromISO(date.dataset.date).day),
                      nextHour,
                      0,
                      0
                    ))
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
                console.log(utility.overnight);
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
                x @ 3. Select first minute to complete start time.
                  x @ a. Black out ending minutes based off of the selected starting minute. (Minutes before the selected starting time.)
                x @ 4. Select ending hour.
                  x @ a. If there is an hour ahead of the time (ie 10am compared to 9am), black out the minutes as are needed upon the change of the second hour.
                x @ 5. Select ending minute to complete selected appointment time.
              */
          } // END -- IF IT IS INSIDE OF THE CURRENT DAY
          // INSIDE OF THE CHECK IF THE DAY IS NOT AN OVERNIGHT SCHEDULE
        }); // END OF APPOINTMENT LOOP
        // END OF WORKING ON SCHEDULE NOT OVERNIGHT
      } else if (utility.overnight === true) {
        console.log(`Hi`);
        [...hourSelectOne.childNodes].forEach((child) => {
          if (child.value !== '0' && currentHour.dataset.time === `12:00 AM`) {
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

        // DECLARING THE FIRST HOUR THAT IS AVAILABLE TO THE SECOND HOUR SELECT
        let firstHour;
        [...hourSelectTwo.childNodes].forEach((child) => {
          Utility.addClasses(child, [`blacked-out`]);
          child.disabled = true;
          let timeOfDay = splitMinutes[1];
          console.log(timeOfDay, Number(splitHour[0]), timeOfDay === `AM` && Number(splitHour[0] === 12));
          if (timeOfDay === `AM` && Number(splitHour[0]) === 12) {
            firstHour = 0;
          } else if (timeOfDay === `AM` && Number(splitHour[0]) !== 12) {
            firstHour = Number(splitHour[0]);
          } else if (timeOfDay === `PM` && Number(splitHour[0]) === 12) {
            firstHour = Number(splitHour[0]);
          } else {
            firstHour = Number(splitHour[0]) + 12;
          }
        });
        console.log(firstHour);

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

        // WORKING OUT HOW MANY HOURS UNTIL THE END OF THE HOURS THAT ARE SELECTABLE BY THE POTENTIAL CLIENT.
        let hour = Number(splitHour[0]);
        if (hour === time) {
          endHour = 1;
        } else if (hour === time - 1) {
          endHour = 2;
        } else if (hour === time - 2) {
          endHour = 3;
        } else {
          endHour = 3;
        }

        console.log(endHour);

        const appointments = data.appointments;
        while (beginningHour < endHour) {
          Utility.removeClasses(hourSelectTwo.childNodes[firstHour], [`blacked-out`]);
          hourSelectTwo.childNodes[firstHour].disabled = '';
          if (hourSelectTwo.childNodes[firstHour] === hourSelectTwo.childNodes[23]) {
            firstHour = -1;
          }
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

        // * THIS IS WHERE I AM CURRENTLY.  GETTING THE PROPER REQUESTED TIME FOR OVERNIGHT SCHEDULES IS DONE, BUT DOING IT AROUND OTHER APPOINTMENTS HAPPENS AFTER THIS.  THAT ONLY CAN HAPPEN WITH THE APPROPRIATE APPOINTMENTS TO DEAL WITH.

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

        console.log(utility.overnight);

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
                    DateTime.local(
                      Number(DateTime.fromISO(date.dataset.date).year),
                      Number(DateTime.fromISO(date.dataset.date).month),
                      Number(DateTime.fromISO(date.dataset.date).day),
                      nextHour,
                      0,
                      0
                    ))
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
                console.log(utility.overnight);
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
                x @ 3. Select first minute to complete start time.
                  x @ a. Black out ending minutes based off of the selected starting minute. (Minutes before the selected starting time.)
                x @ 4. Select ending hour.
                  x @ a. If there is an hour ahead of the time (ie 10am compared to 9am), black out the minutes as are needed upon the change of the second hour.
                x @ 5. Select ending minute to complete selected appointment time.
              */
          } // END -- IF IT IS INSIDE OF THE CURRENT DAY
          // INSIDE OF THE CHECK IF THE DAY IS NOT AN OVERNIGHT SCHEDULE
        }); // END OF APPOINTMENT LOOP
      } // END OF WORKING WITH OVERNIGHT SCHEDULE
    }); // HOUR CLICKED
  }); // HOUR LOOP
};

/*
  Something just occurred to me.  The times from 12am - 5am in an overnight 9pm - 5am schedule are for the previous day.  So..., in essence, this app must take into account the idea that if the schedule is one way, it is an 'overnight' schedule, and if it is another, it is NOT an 'overnight' schedule.  In other words, this should actually be two ways of handling the schedule, and setting appointments entirely.  This will be a huge overhaul to be sure things are working as they should, but it WILL be worth it.
*/

export const buildSchedule = (container, schedule, data, utility) => {
  utility.overnight = false;
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

  if (startOfDay === 'pm' && endOfDay === 'am') {
    utility.overnight = true;
  }

  console.log(utility.overnight);

  if ((startOfDay === `am` && endOfDay === `pm`) || (startOfDay === `am` && endOfDay === `am`) || (startOfDay === `pm` && endOfDay === `pm`)) {
    // THESE ARE FOR ALL OTHER SCHEDULES
    hours.forEach((hour, i) => {
      if (i < start || i + 1 > end) {
        Utility.addClasses(hour, [`blacked-out`]);
        hour.style.pointerEvents = 'none';
      }
    });
  } else if (startOfDay === `pm` && endOfDay === `am`) {
    // THIS IS FOR OVERNIGHT SCHEDULES
    hours.forEach((hour, i) => {
      console.log(end);
      if (Number(hour.dataset.value) < end) {
        Utility.addClasses(hour, [`previous-day`]);
      }
      if (i + 1 > end && i < start) {
        Utility.addClasses(hour, [`blacked-out`]);
        hour.style.pointerEvents = 'none';
      }
    });
  }
};
