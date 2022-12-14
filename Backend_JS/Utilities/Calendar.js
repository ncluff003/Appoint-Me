////////////////////////////////////////////
//  Core Modules

////////////////////////////////////////////
//  Third Party Modules

////////////////////////////////////////////
//  Third Party Module Instances

////////////////////////////////////////////
//  Third Party Config Files

////////////////////////////////////////////
//  Third Party Middleware
const { DateTime } = require('luxon');

////////////////////////////////////////////
//  My Middleware

////////////////////////////////////////////
//  Routing Middleward

////////////////////////////////////////////
//  My Modules

/////////////////////////////////////////
//  Calendar Model
class Calendar {
  constructor() {
    this.date = new Date();
    this.days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    this.months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
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

  getYear() {
    return this.date.getFullYear();
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

  getDaySuffix(date) {
    if (`${date}`[`${date}`.length - 1] === 1) {
      return `st`;
    } else if (`${date}`[`${date}`.length - 1] === 2) {
      return `nd`;
    } else if (`${date}`[`${date}`.length - 1] === 3) {
      return `rd`;
    } else {
      return `th`;
    }
  }

  getLongDate(date) {
    console.log(DateTime.fromISO(date).toLocaleString(DateTime.DATETIME_HUGE));
    // return `${this.days[new Date(date).getDay()]}, the ${new Date(date).getDate()}${this.getDaySuffix(date)} of ${this.months[new Date(date).getMonth()]} ${new Date(date).getFullYear()}`;
    return `${DateTime.fromISO(date).toLocaleString(DateTime.DATETIME_HUGE)}`;
  }
}

const myCalendar = new Calendar(Date.now());

module.exports = myCalendar;
