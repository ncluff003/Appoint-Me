import axios from 'axios';
import qs from 'qs';
import { logout } from '../Application/Logout';
import * as Utility from '../Application/Utility';

export class User {
  constructor(options) {
    // firstname, lastname, username, latterDaySaint, email, emailConfirmed, password, passwordConfirmed
    this.firstname = options.firstname;
    this.lastname = options.lastname;
    this.username = options.username;
    this.latterDaySaint = options.latterDaySaint;
    this.email = options.email;
    this.emailConfirmed = options.emailConfirmed;
    this.password = options.password;
    this.passwordConfirmed = options.passwordConfirmed;
    this.latterDaySaint = false;
  }

  async _getPersonData(userId) {
    try {
      let id;
      if (!userId) {
        id = window.location.pathname.split('/')[3];
        const response = await axios({
          method: `GET`,
          url: `/App/Users/${id}/Me`,
        });
        if (response[0] === `Email`) console.log(true);
        return response;
      }
      const response = await axios({
        method: `POST`,
        url: `/App/Users/${userId}/Me`,
        data: qs.stringify({
          id: userId,
        }),
      });
      if (response[0] === `Email`) console.log(true);
      return response;
    } catch (error) {
      console.log(error);
    }
  }

  async _logMeOut(id) {
    await logout(id);
  }

  async _deactivateMe(id) {
    try {
      const response = await axios({
        method: `DELETE`,
        url: `/App/Users/${id}/DeactivateMe`,
      });
      if (response.statusText === 'Success') {
        window.location.assign('/App');
      }
    } catch (error) {
      console.log(error);
    }
  }

  async _deleteMe(id) {
    try {
      const response = await axios({
        method: `DELETE`,
        url: `/App/Users/${id}/DeleteMe`,
      });
      if (response.statusText === 'No Content') {
        window.location.assign('/App');
      }
    } catch (error) {
      console.log(error);
    }
  }

  _updateFirstName(firstName) {
    return (this.firstname = firstName);
  }
  _updateLastName(lastName) {
    return (this.lastname = lastName);
  }
  _updateUsername(username) {
    return (this.username = username);
  }

  async _updatePhoto(options) {
    try {
      const response = await axios({
        method: `PATCH`,
        url: `/App/Users/${options.id}/UpdateMe`,
        data: options,
      });
    } catch (error) {
      console.log(error);
    }
  }

  _updateLatterDaySaintStatus() {
    return (this.latterDaySaint = !this.latterDaySaint);
  }

  _updateEmail(email) {
    return (this.email = email);
  }

  _updateEmailConfirmed(emailConfirmed) {
    return (this.emailConfirmed = emailConfirmed);
  }
  _updatePassword(password) {
    return (this.password = password);
  }

  _updatePasswordConfirmed(passwordConfirmed) {
    return (this.passwordConfirmed = passwordConfirmed);
  }

  async _setup2FA(options) {
    try {
      const response = await axios({
        method: `POST`,
        url: `/App/Users/${options.id}/2FA`,
        data: qs.stringify({
          userId: options.id,
        }),
      });
      console.log(response.data.data);
      return response.data.data.qrcode;
    } catch (error) {}
  }

  async _verify2FAToken(options) {
    try {
      const response = await axios({
        method: `POST`,
        url: `/App/Users/${options.id}/2FA/Verify`,
        data: qs.stringify({
          userId: options.id,
          token: options.token,
        }),
      });
      console.log(response.data.data, response.data);
      if (response.data.status === `Success`) {
        Utility.reloadPage();
      }
    } catch (error) {}
  }

  async _validate2FAToken(options) {
    try {
      const response = await axios({
        method: `POST`,
        url: `/App/Users/${options.id}/2FA/Validate`,
        data: qs.stringify({
          userId: options.id,
          token: options.token,
        }),
      });
      console.log(response, response.data);
      return response.data;
    } catch (error) {}
  }

  async _updateUser(options) {
    console.log(options);
    try {
      const response = await axios({
        method: `PATCH`,
        url: `/App/Users/${options.id}/UpdateMe`,
        data: qs.stringify({
          ...options,
        }),
      });
    } catch (error) {
      let message = error.response.data.message;
      if (message === `First name must be only letters.`) {
        let firstnameLabel = document.getElementById('firstnameLabel');
        Utility.renderError(firstnameLabel, message, `First Name`, `negative`, 5000);
      }
      if (message === `Last name must be only letters.`) {
        let lastnameLabel = document.getElementById('lastnameLabel');
        Utility.renderError(lastnameLabel, message, `Last Name`, `negative`, 5000);
      }
      if (message === `Username must start with a capital and contain letters and/or numbers..`) {
        let usernameLabel = document.getElementById('usernameLabel');
        Utility.renderError(usernameLabel, message, `Username`, `negative`, 5000);
      }
      if (message === `Please provide a valid email address.`) {
        let newEmailLabel = document.getElementById('newEmailLabel');
        let newEmailConfirmedLabel = document.getElementById('newEmailConfirmedLabel');
        Utility.renderError(newEmailLabel, message, `New Email Address`, `negative`, 5000);
        Utility.renderError(newEmailConfirmedLabel, message, `Confirm New Email Address`, `negative`, 5000);
      }
      if (message === `Please provide a valid phone number.`) {
        let newPhoneNumberLabel = document.getElementById('newPhoneNumberLabel');
        let newPhoneNumberConfirmedLabel = document.getElementById('newPhoneNumberConfirmedLabel');
        Utility.renderError(newPhoneNumberLabel, message, `New Phone Number`, `negative`, 5000);
        Utility.renderError(newPhoneNumberConfirmedLabel, message, `Confirm New Phone Number`, `negative`, 5000);
      }
      console.log(error);
    }
  }

  async _updateUserPassword(currentPassword, newPassword, newPasswordConfirmed, id) {
    try {
      const response = await axios({
        method: `POST`,
        url: `/App/Users/${id}/UpdateMyPassword`,
        data: qs.stringify({
          currentPassword: currentPassword,
          newPassword: newPassword,
          newPasswordConfirmed: newPasswordConfirmed,
        }),
      });
      if (response.statusText === 'OK') {
        document.getElementById('currentPassword').value = newPassword;
        document.getElementById('newPassword').value = ``;
        document.getElementById('newPasswordConfirmed').value = ``;
        // window.location.reload(true);
      }
    } catch (error) {
      let message = error.response.data.message;
      if (
        message ===
        `Passwords must contain at least 8 characters, amongst them being at least 1 capital letter, 1 lower case letter, 1 number, & 1 special symbol.  The special symbols may be the following: !, @, $, &, -, _, and &.`
      ) {
        let newPasswordLabel = document.getElementById('newPasswordLabel');
        let newPasswordConfirmedLabel = document.getElementById('newPasswordConfirmedLabel');
        Utility.renderError(newPasswordLabel, message, `New Password`, `negative`, 5000);
        Utility.renderError(newPasswordConfirmedLabel, message, `Confirm New Password`, `negative`, 5000);
      }
      console.log(error);
    }
  }

  _createPlaceholderUser(user, personCopy) {
    personCopy._id = user._id;
    personCopy.budgets = user.budgets;
    personCopy.firstname = user.firstname;
    personCopy.lastname = user.lastname;
    personCopy.username = user.username;
    personCopy.email = user.email;
    personCopy.phoneNumber = user.phoneNumber;
    personCopy.communicationPreference = user.communicationPreference;
    personCopy.photo = user.photo;
    personCopy.latterDaySaint = user.latterDaySaint;
    return personCopy;
  }

  _getLatterDaySaintStatus() {
    return this.latterDaySaint;
  }

  watch() {
    console.log(`Watching You... :smiling_imp:`);
  }
}
