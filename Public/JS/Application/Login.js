import axios from 'axios';
import qs from 'qs';
import * as Utility from './Utility';
import { Profile } from './../Classes/Profile';

export const login = async (username, password) => {
  try {
    const options = {
      username: username,
      password: password,
    };

    // FIRST SEARCH FOR THE USER
    const response1 = await axios({
      method: `POST`,
      url: `/App/User`,
      data: qs.stringify(options),
    });
    let fullUser = response1.data.data.user;
    if (response1.data.status === 'Success' && fullUser.twoFactor === true) {
      const twoFactorFormContainer = document.querySelector('.two-factor-form-container');
      Utility.replaceClassName(twoFactorFormContainer, `closed`, `open`);
      const twoFactorSubmit = document.querySelector('.button--two-factor-submit');
      const twoFactorInput = document.querySelector('.form__input--two-factor');
      const { profile, user } = await new Profile().build(fullUser._id);
      let newResponse;
      twoFactorSubmit.addEventListener('click', async (e) => {
        e.preventDefault();
        newResponse = await user._validate2FAToken({ id: fullUser._id, token: twoFactorInput.value, password: password });
        if (newResponse.status === `Success` && newResponse.validated === true) {
          const options = {
            username: username,
            password: password,
            id: fullUser._id,
          };
          // LOG IN
          const response2 = await axios({
            method: `POST`,
            url: `/App/Users/${options.id}`,
            data: qs.stringify(options),
          });
          if (response2.statusText === 'OK') {
            document.open(`text/html`).write(response2.data);
            // RE-ASSIGN URL ADDRESS
            window.location.assign(`/App/Users/${options.id}`);
          }
        }
      });
    }
    if ((response1.data.status === 'Success' && fullUser.twoFactor === false) || (response1.data.status === 'Success' && fullUser.twoFactor === undefined)) {
      const options = {
        username: username,
        password: password,
        id: fullUser._id,
      };
      // LOG IN
      const response2 = await axios({
        method: `POST`,
        url: `/App/Users/${fullUser._id}`,
        data: qs.stringify(options),
      });
      if (response2.statusText === 'OK') {
        document.open(`text/html`).write(response2.data);
        // RE-ASSIGN URL ADDRESS
        window.location.assign(`/App/Users/${fullUser._id}`);
      }
    }
  } catch (error) {
    const loginFormHeader = document.querySelector('.form__header__title');
    Utility.showError(loginFormHeader, `${error.response.data.message}`, `Login`, `negative-centered`, 5000);
    console.log(error);
  }
};

const getLoggedIn = () => {
  const e = event;
  e.preventDefault();
  const loginUsername = document.getElementById('loginUsername').value;
  const loginPassword = document.getElementById('loginPassword').value;
  const buttons = document.querySelectorAll('.button');
  const loginButton = buttons[0];
  loginButton.removeEventListener('click', getLoggedIn);
  login(loginUsername, loginPassword);
};

const toggleLoginForm = (form, loginSubmit) => {
  Utility.toggleClass(form, 'closed');
  Utility.toggleClass(form, 'open');
  loginSubmit.addEventListener('click', getLoggedIn);
};

export const watch = () => {
  const buttons = document.querySelectorAll('.button');
  const forms = document.querySelectorAll('.form-container');
  const loginButton = buttons[0];
  const loginFormCloser = document.querySelectorAll('.form-closure-icon')[0];
  if (loginButton) {
    loginButton.addEventListener('click', (e) => {
      toggleLoginForm(forms[0], buttons[2]);
    });
  }
  if (loginFormCloser) {
    loginFormCloser.addEventListener('click', (e) => {
      e.preventDefault();
      toggleLoginForm(forms[0], buttons[2]);
    });
  }
};
