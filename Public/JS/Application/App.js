import moment from 'moment';
import { DateTime } from 'luxon';
import * as Login from './Login';
import * as Signup from './Signup';
import * as Reset from './Reset-Password';
import * as AppLoggedIn from './App-LoggedIn';
import * as Utility from './Utility';
import { buildApp } from './Appoint-Me-App';

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

      if (document.querySelector('.calendar') || document.querySelector('.r__calendar')) {
        const app = document.querySelector('.calendar');
        await buildApp(app);
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
