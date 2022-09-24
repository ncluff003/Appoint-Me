import * as Utility from './../Utility';

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
