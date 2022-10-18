import moment from 'moment';
import * as Utility from './Utility';
import { get, getAll, set, timeTillExpires, remove, useNamespace } from './../Classes/Cache';
import { buildApp, retrieveInfo, adjustDeclinedAppointment } from './Appoint-Me-App';

(function () {
  class App {
    constructor() {
      this._startApp();
    }

    async _startApp() {
      let loginStatus = false;
      console.log(`App Has Started!`);
      moment.locale(navigator.language);

      // * WATCHING FOR SCREEN CHANGES
      Utility.watchScreen();

      if (!`${window.location.href}`.includes(`Declined`)) {
        console.log(`NOT DENIED`);
        if (document.querySelector('.calendar') || document.querySelector('.r__calendar')) {
          const app = document.querySelector('.calendar');
          await buildApp(app);
        }
      } else {
        console.log(`Appointment Denied`);
        Utility.build();
        let utility = get(`utility`);
        const declinedAppointmentContainer = document.querySelector('.appointment-declined-container');
        const data = await retrieveInfo();
        Utility.addClasses(declinedAppointmentContainer, [utility.theme[data.theme]]);
        adjustDeclinedAppointment(data, declinedAppointmentContainer, utility);
      }

      // * WATCHING FOR USER LOGIN
      // Login.watch();

      // * WATCHING FOR USER SIGNUP
      // Signup.watch();

      // * WATCHING FOR USER IN NEED OF RESETTING THEIR PASSWORD
      // Reset.watch();

      // * CHECK THE USER'S LOGIN STATUS
      // AppLoggedIn.watchLoginStatus(loginStatus);
    }
  }
  /////////////////////////////////////////////////
  // * IMMEDIATELY MAKE AN INSTANCE OF THE APP CLASS
  const app = new App();
})();

export const useApp = () => {
  class App {
    constructor() {
      this._startApp();
    }

    async _startApp() {
      let loginStatus = false;
      console.log(`App Has Started!`);
      moment.locale(navigator.language);

      // * WATCHING FOR SCREEN CHANGES
      Utility.watchScreen();

      if (!`${window.location.href}`.includes(`Declined`)) {
        console.log(`NOT DENIED`);
        if (document.querySelector('.calendar') || document.querySelector('.r__calendar')) {
          const app = document.querySelector('.calendar');
          await buildApp(app);
        }
      } else {
        console.log(`Appointment Denied`);
        Utility.build();
        let utility = get(`utility`);
        const declinedAppointmentContainer = document.querySelector('.appointment-declined-container');
        const data = await retrieveInfo();
        Utility.addClasses(declinedAppointmentContainer, [utility.theme[data.theme]]);
        adjustDeclinedAppointment(data, declinedAppointmentContainer, utility);
      }

      // * WATCHING FOR USER LOGIN
      // Login.watch();

      // * WATCHING FOR USER SIGNUP
      // Signup.watch();

      // * WATCHING FOR USER IN NEED OF RESETTING THEIR PASSWORD
      // Reset.watch();

      // * CHECK THE USER'S LOGIN STATUS
      // AppLoggedIn.watchLoginStatus(loginStatus);
    }
  }
  /////////////////////////////////////////////////
  // * IMMEDIATELY MAKE AN INSTANCE OF THE APP CLASS
  const app = new App();
};
