import { DateTime } from 'luxon';
import * as Utility from './Utility';
import { get, getAll, set, timeTillExpires, remove, useNamespace } from './../Classes/Cache';
import { buildApp, retrieveInfo, adjustDeclinedAppointment } from './Appoint-Me-App';

export default (function () {
  class App {
    constructor() {
      this._startApp();
    }

    async _startApp() {
      console.log(`App Has Started!`);
      let currentTime = DateTime.now().setLocale(navigator.language);

      // * WATCHING FOR SCREEN CHANGES
      Utility.watchScreen();

      if (!`${window.location.href}`.includes(`Declined`)) {
        console.log(`NOT DENIED`);
        console.log(navigator.language);
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
    }
  }
  /////////////////////////////////////////////////
  // * IMMEDIATELY MAKE AN INSTANCE OF THE APP CLASS
  const app = new App();
})();

// export const useApp = () => {
//   class App {
//     constructor() {
//       this._startApp();
//     }

//     async _startApp() {
//       let loginStatus = false;
//       console.log(`App Has Started!`);
//       let currentTime = DateTime.now().setLocale(navigator.language);

//       // * WATCHING FOR SCREEN CHANGES
//       Utility.watchScreen();

//       if (!`${window.location.href}`.includes(`Declined`)) {
//         console.log(`NOT DENIED`);
//         if (document.querySelector('.calendar') || document.querySelector('.r__calendar')) {
//           const app = document.querySelector('.calendar');
//           await buildApp(app);
//         }
//       } else {
//         console.log(`Appointment Denied`);
//         Utility.build();
//         let utility = get(`utility`);
//         const declinedAppointmentContainer = document.querySelector('.appointment-declined-container');
//         const data = await retrieveInfo();
//         Utility.addClasses(declinedAppointmentContainer, [utility.theme[data.theme]]);
//         adjustDeclinedAppointment(data, declinedAppointmentContainer, utility);
//       }
//     }
//   }
//   /////////////////////////////////////////////////
//   // * IMMEDIATELY MAKE AN INSTANCE OF THE APP CLASS
//   const app = new App();
// };
