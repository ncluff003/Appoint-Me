import * as Utility from './../Application/Utility';
import { DateTime, Duration, Info } from 'luxon';

class Calendar {
  constructor() {
    this.date = new Date();
    this.days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    this.months = Info.months(`long`);
    this.monthIndex = this.date.getMonth();
    this.hours = this.date.getHours();
    this.day = this.date.getDay();
  }

  getMinutes() {
    return this.date.getMinutes() < 10 ? `0${this.date.getMinutes()}` : this.date.getMinutes();
  }

  getHour() {
    if (this.hours === 0 || this.hours === 24) return (this.hours = 12);
    if (this.hours >= 13 && this.getMinutes() >= 0) {
      return (this.hours = this.hours - 12);
    }
    return this.hours;
  }

  getTimeOfDay() {
    return this.date.getHours() < 12 ? (this.timeOfDay = `AM`) : (this.timeOfDay = `PM`);
  }

  getDay() {
    return this.date.getDate();
  }

  getDaySuffix(day) {
    if (day[day.length - 1] === 1) return `st`;
    if (day[day.length - 1] === 2) return `nd`;
    if (day[day.length - 1] === 3) return `rd`;
    return `th`;
  }

  getGreeting() {
    if (this.hours < 12) {
      return (this.greeting = `Good Morning`);
    }
    if (this.hours >= 12 && this.hours < 18) {
      return (this.greeting = `Good Afternoon`);
    }
    if (this.hours >= 18) {
      return (this.greeting = `Good Evening`);
    }
  }

  getWeekday() {
    return this.days[this.day];
  }

  getMonth() {
    return this.months[this.monthIndex];
  }

  getMonthIndex() {
    return this.date.getMonth();
  }

  getYear() {
    return this.date.getFullYear();
  }

  compareEndOfYear(date) {
    let currentDate = new Date();
    let endDate = new Date(currentDate.getFullYear(), 11, 31);
    console.log(date, endDate);
    return new Date(date) > currentDate && new Date(date) < endDate;
  }

  getRemainingMonths() {
    let currentDate = new Date();
    let endDate = new Date(currentDate.getFullYear(), 11, 31);
    let months = 0;
    while (currentDate <= endDate) {
      currentDate = new Date(currentDate.setMonth(new Date(currentDate).getMonth() + 1));
      months++;
    }
    return months;
  }

  getYearRemaining(date, timing) {
    let endDate = new Date(date.getFullYear(), 11, 31);
    console.log(date, `|`, timing, `|`, endDate);
    let numberOfTimes = 0;

    if (timing === `Weekly`) {
      while (date <= endDate) {
        date = new Date(date.setDate(new Date(date).getDate() + 7));
        numberOfTimes++;
      }
      numberOfTimes = numberOfTimes - 1;
      console.log(numberOfTimes);
    }

    if (timing === `Bi-Weekly`) {
      while (date <= endDate) {
        date = new Date(date.setDate(new Date(date).getDate() + 14));
        numberOfTimes++;
      }
      numberOfTimes = numberOfTimes - 1;
      console.log(numberOfTimes);
    }

    if (timing === `Monthly`) {
      while (date <= endDate) {
        date = new Date(date.setMonth(new Date(date).getMonth() + 1));
        numberOfTimes++;
        console.log(date, numberOfTimes);
      }
      numberOfTimes = numberOfTimes - 1;
      console.log(date, numberOfTimes);
    }
  }

  monthRemaining() {
    let days;
    const currentMonth = this.getMonth();
    const currentDay = this.getDay();
    if (
      currentMonth === `January` ||
      currentMonth === `March` ||
      currentMonth === `May` ||
      currentMonth === `July` ||
      currentMonth === `August` ||
      currentMonth === `October` ||
      currentMonth === `December`
    ) {
      days = 31;
    }
    if (currentMonth === `April` || currentMonth === `June` || currentMonth === `September` || currentMonth === `November`) {
      days = 30;
    }
    if (currentMonth === `February`) {
      (this.getYear() % 4 === 0 && !(this.getYear() % 100 === 0)) || this.getYear() % 400 === 0 ? (days = 29) : (days = 28);
    }
    const remaining = days - currentDay;
    const percentage = remaining / days;
    const calculatedPercent = (100 * percentage).toFixed(0);
    return `${calculatedPercent}%`;
  }

  goBackAMonth(month, year, dayClass, currentDayClass, unusedDayClass, utility, user) {
    let selectedMonth = this.months[month];
    this.makeCalendar(month, selectedMonth, year, dayClass, currentDayClass, unusedDayClass, utility, user);
  }

  goForwardAMonth(month, year, dayClass, currentDayClass, unusedDayClass, utility, user) {
    let selectedMonth = this.months[month];
    this.makeCalendar(month, selectedMonth, year, dayClass, currentDayClass, unusedDayClass, utility, user);
  }

  _selectDay(monthDays, singleDay) {
    monthDays.forEach((day, i) => {
      day.classList.remove('bill-calendar__days__single-day--current-day');
    });
    singleDay.classList.add('bill-calendar__days__single-day--current-day');
  }

  _setupMonth(monthIndex, monthDays, year, dayClass, currentDayClass, unusedDayClass, utility) {
    let dayStart = 1;
    const days = document.querySelectorAll(dayClass);

    // GETTING A NEW DATE BASED OFF CURRENT DATE INFORMATION
    const startDate = new Date(year, monthIndex, 1);
    let manipulatedDate = new Date(year, monthIndex, 1);
    let currentDate = new Date(year, monthIndex, this.getDay());

    // CURRENT DAY'S INDEX IN THE WEEK
    let dayIndex = startDate.getDay();
    days.forEach((d) => (d.textContent = ''));
    if ((dayStart && dayIndex) || (dayStart && dayIndex === 0)) {
      while (dayStart <= monthDays) {
        if (dayStart === 1) {
          if (days[dayIndex]) {
            days[dayIndex].textContent = utility.number.format(dayStart);
            dayStart++;
            dayIndex++;
          }
        }
        manipulatedDate = new Date(manipulatedDate.setDate(manipulatedDate.getDate() + 1));
        if (days[dayIndex]) {
          days[dayIndex].textContent = utility.number.format(manipulatedDate.getDate());
        }
        dayStart++;
        dayIndex++;
      }
    }
    let currentDayIndex = currentDate.getDate();
    days.forEach((d, i) => {
      d.classList.remove(currentDayClass);
      if (d.textContent === '') Utility.addClasses(d, [unusedDayClass, `r__${unusedDayClass}`]);
      if (d.textContent !== '') {
        if (d.classList.contains('un-used-day')) d.classList.remove('un-used-day');
        if (d.classList.contains('r__un-used-day')) d.classList.remove('r__un-used-day');
        if (Number(d.textContent) === utility.number.format(currentDayIndex) || d.textContent === utility.number.format(currentDayIndex)) {
          d.classList.add(currentDayClass);
        }
        d.addEventListener('click', (e) => {
          this._selectDay(days, d);
        });
      }
    });
  }

  _getDaysInMonth(month, value, year) {
    if (month === `January` || month === `March` || month === `May` || month === `July` || month === `August` || month === `October` || month === `December`) {
      value = 31;
    }
    if (month === `April` || month === `June` || month === `September` || month === `November`) {
      value = 30;
    }
    if (month === `February`) {
      (year % 4 === 0 && !(year % 100 === 0)) || year % 400 === 0 ? (value = 29) : (value = 28);
    }
    return value;
  }

  async makeCalendar(monthIndex, month, year, dayClass, currentDayClass, unusedDayClass, utility, user) {
    let daysInMonth;
    daysInMonth = this._getDaysInMonth(month, daysInMonth, year);
    const billMonth = document.querySelector('.bill-calendar__header__title');
    const weekdays = document.querySelectorAll('.bill-calendar__weekdays__weekday');
    const weekdayDays = this.days;

    weekdays.forEach(async (weekday, i) => {
      let weekdayText = await Utility.getTranslation(user, weekdayDays[i]);
      if (weekdayText !== undefined) {
        weekday.textContent = weekdayText[0].toUpperCase();
      }
    });

    if (billMonth) {
      // GET MONTH TRANSLATION
      let monthTranslation = await Utility.getTranslation(user, month);
      billMonth.textContent = `${monthTranslation} | ${utility.number.format(year).replace(/[,.]/g, '')}`;
    }
    this._setupMonth(monthIndex, daysInMonth, year, dayClass, currentDayClass, unusedDayClass, utility);
  }
}

export const myCalendar = new Calendar(Date.now());
