import axios from 'axios';
import qs from 'qs';
import * as Utility from './Utility';

export const updatePassword = async (password, passwordConfirmed) => {
  try {
    const response = await axios({
      method: `PATCH`,
      url: `/App/Users/ResetPassword/${window.location.href.split('/')[5]}`,
      data: qs.stringify({
        password: password,
        passwordConfirmed: passwordConfirmed,
      }),
    });
    if (response.data.status === 'Success') {
      window.location.assign(`/`);
    }
  } catch (error) {
    console.log(error);
  }
};

const watchPasswordResetButton = () => {
  const resetPasswordButton = document.querySelector('.reset-password-form__section__button');
  if (resetPasswordButton) {
    resetPasswordButton.addEventListener('click', (e) => {
      e.preventDefault();
      const newPassword = document.getElementById('newPassword').value;
      const newPasswordConfirmed = document.getElementById('newPasswordConfirmed').value;
      updatePassword(newPassword, newPasswordConfirmed);
    });
  }
};

const toggleResetPasswordForm = (form) => {
  Utility.toggleClass(form, 'closed');
  Utility.toggleClass(form, 'open');
};

export const watch = () => {
  const buttons = document.querySelectorAll('.button');
  const forms = document.querySelectorAll('.form-container');
  const resetPasswordButton = buttons[3];
  const resetPasswordFormCloser = document.querySelectorAll('.form-closure-icon')[2];
  if (resetPasswordButton) {
    resetPasswordButton.addEventListener('click', (e) => {
      e.preventDefault();
      toggleResetPasswordForm(forms[2]);
    });
  }
  if (resetPasswordFormCloser) {
    resetPasswordFormCloser.addEventListener('click', (e) => {
      e.preventDefault();
      toggleResetPasswordForm(forms[2]);
    });
  }

  // * IF USER NEEDS TO RESET THEIR PASSWORD, BE SURE TO WATCH THE BUTTON THAT WILL DO THAT FOR THEM.
  watchPasswordResetButton();
};
