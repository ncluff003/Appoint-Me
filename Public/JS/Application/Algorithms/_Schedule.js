import * as Utility from './../Utility';

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
