import { User } from '../Classes/User';
import * as Utility from './../Application/Utility';
import { get, getAll, set, remove, useNamespace } from './Cache';

export class Profile {
  constructor() {}

  set(entry) {
    this[entry[0]] = entry[1];
  }

  addTo(field, value) {
    this[field] = value;
  }

  accountManagement(profile, user, container, header, submitButtons, button, forms, form) {
    /*
      ~ List Of Things To Do
      @ 1. Make 2-Factor Functionality Functional.
    */
    button.addEventListener(`click`, (e) => {
      e.preventDefault();
      header.textContent = button.textContent;
      Utility.replaceClassName(container, `closed`, `open`);
      forms.forEach((form) => Utility.replaceClassName(form, `open`, `closed`));
      Utility.replaceClassName(form, `closed`, `open`);
    });

    submitButtons[0].addEventListener('click', async (e) => {
      e.preventDefault();
      await user._logMeOut(profile._id);
    });

    submitButtons[1].addEventListener('click', async (e) => {
      e.preventDefault();
      await user._deactivateMe(profile._id);
    });

    submitButtons[2].addEventListener('click', async (e) => {
      e.preventDefault();
      await user._deleteMe(profile._id);
    });
  }

  passwordManagement(profile, user, container, header, submitButton, button, forms, form, utility) {
    if (button) {
      console.log(form);
      button.addEventListener(`click`, (e) => {
        e.preventDefault();
        header.textContent = button.textContent;
        Utility.replaceClassName(container, `closed`, `open`);
        forms.forEach((form) => Utility.replaceClassName(form, `open`, `closed`));
        Utility.replaceClassName(form, `closed`, `open`);
      });

      const transparentButtons = document.querySelectorAll('.button--small-transparent');
      transparentButtons[2].addEventListener('click', (e) => {
        e.preventDefault();
        const userProfileSubSections = document.querySelectorAll('.form__section--sub-section');
        [userProfileSubSections[4], userProfileSubSections[5], userProfileSubSections[6], userProfileSubSections[7]].forEach((subSection) => {
          subSection.classList.contains('closed') ? Utility.replaceClassName(subSection, `closed`, `open`) : Utility.replaceClassName(subSection, `open`, `closed`);
        });
        if (utility) {
          if (
            utility.screen.smallTabPort[0].matches ||
            utility.screen.smallTabLand[0].matches ||
            utility.screen.largeMobileLand[0].matches ||
            utility.screen.largeMobilePort[0].matches ||
            utility.screen.smallMobileLand[0].matches ||
            utility.screen.smallMobilePort[0].matches
          ) {
            Utility.toggleClass(form, `flex-to-start`);
          }
        }
      });

      submitButton.addEventListener('click', async (e) => {
        e.preventDefault();
        const currentPassword = document.getElementById('currentPassword').value;
        const newPassword = document.getElementById('newPassword').value;
        const newPasswordConfirmed = document.getElementById('newPasswordConfirmed').value;
        const updateUserInfo = await user._updateUserPassword(currentPassword, newPassword, newPasswordConfirmed, profile._id);
      });

      const qrcodeModal = document.querySelector('.modal__2FA');
      const twoFactorCloseButton = document.querySelector('.modal__2FA-close');
      twoFactorCloseButton.addEventListener(`click`, (e) => {
        e.preventDefault();
        Utility.replaceClassName(qrcodeModal, `open`, `closed`);
      });

      transparentButtons[4].addEventListener(`click`, async (e) => {
        e.preventDefault();
        let qrcode = await user._setup2FA({ id: profile._id });
        const qrcodeTokenForm = document.querySelector('.modal__2FA__token-form');
        Utility.replaceClassName(qrcodeModal, `closed`, `open`);
        Utility.replaceClassName(qrcodeTokenForm, `closed`, `open`);
        const qrcodeImage = document.querySelector('.modal__2FA__qrcode-container__qrcode--image');
        qrcodeImage.src = qrcode;
      });

      const qrcodeSubmitButton = document.querySelector('.button--submit-token');
      qrcodeSubmitButton.addEventListener('click', async (e) => {
        e.preventDefault();
        let token = document.querySelector('.form__input--qrcode-token').value;
        await user._verify2FAToken({ id: profile._id, token: token });
      });
    }
  }

  communications(profile, user, container, header, subSections, subSectionButtons, submitButton, button, forms, form) {
    if (button) {
      button.addEventListener(`click`, (e) => {
        e.preventDefault();
        header.textContent = button.textContent;
        Utility.replaceClassName(container, `closed`, `open`);
        forms.forEach((form) => Utility.replaceClassName(form, `open`, `closed`));
        Utility.replaceClassName(form, `closed`, `open`);
      });
      Utility.watchCommunicationSwitch(profile);
      subSectionButtons.forEach((button, i) => {
        button.addEventListener('click', (e) => {
          e.preventDefault();
          if (i === 0) {
            Utility.toggleSubSections([subSections[0], subSections[1]], button);
          }
          if (i === 1) {
            Utility.toggleSubSections([subSections[2], subSections[3]], button);
          }
        });
      });

      const userProfileInputs = document.querySelectorAll('.form__input--dark-small');
      const userProfileSubInputs = document.querySelectorAll('.form__input--dark-extra-small');
      Utility.formatPhoneNumber(userProfileInputs[4].value);
      userProfileSubInputs[2].addEventListener('keyup', (e) => {
        userProfileSubInputs[2].value = Utility.formatPhoneNumber(userProfileSubInputs[2].value);
      });
      userProfileSubInputs[3].addEventListener('keyup', (e) => {
        userProfileSubInputs[3].value = Utility.formatPhoneNumber(userProfileSubInputs[3].value);
      });

      submitButton.addEventListener(`click`, async (e) => {
        e.preventDefault();
        let newEmail = document.getElementById('newEmail').value;
        let newEmailConfirmed = document.getElementById('newEmailConfirmed').value;
        if (newEmail === '') {
          newEmail = profile.email;
        }
        if (newEmailConfirmed === '') {
          newEmailConfirmed = profile.email;
        }

        let newPhoneNumber = document.getElementById('newPhoneNumber').value;
        let newPhoneNumberConfirmed = document.getElementById('newPhoneNumberConfirmed').value;
        if (newPhoneNumber === '') {
          newPhoneNumber = profile.phoneNumber;
        }
        if (newPhoneNumberConfirmed === '') {
          newPhoneNumberConfirmed = profile.phoneNumber;
        }
        const updateUserInfo = await user._updateUser({
          email: newEmail,
          emailConfirmed: newEmailConfirmed,
          phoneNumber: newPhoneNumber,
          phoneNumberConfirmed: newPhoneNumberConfirmed,
          communicationPreference: profile.communicationPreference,
          id: profile._id,
        });
      });
    }
  }

  personalInformation(profile, user, container, header, submitButton, button, forms, form) {
    if (button) {
      button.addEventListener(`click`, (e) => {
        e.preventDefault();
        header.textContent = button.textContent;
        Utility.replaceClassName(container, `closed`, `open`);
        forms.forEach((form) => Utility.replaceClassName(form, `open`, `closed`));
        Utility.replaceClassName(form, `closed`, `open`);
      });
      Utility.watchLDSSwitch();
      submitButton.addEventListener(`click`, async (e) => {
        e.preventDefault();
        const firstname = document.getElementById('firstname').value;
        const lastname = document.getElementById('lastname').value;
        const username = document.getElementById('username').value;
        latterDaySaintSwitch.classList.contains('form__input--latter-day-saint--switched') ? (profile.latterDaySaint = true) : (profile.latterDaySaint = false);
        const updatedUserInfo = await user._updateUser({
          firstname: firstname,
          lastname: lastname,
          username: username,
          latterDaySaint: profile.latterDaySaint,
          id: profile._id,
        });
      });
    }
  }

  async profilePicture(user, utility) {
    const startUpdatingPhotoButton = document.querySelectorAll('.button--extra-small')[0];
    const mobileStartUpdatingPhotoButton = document.querySelectorAll('.r__button--extra-small-mobile')[0];
    const photoUpdateModal = document.querySelector('.modal--update-photo');

    // ~ Opening the update photo modal.

    if (
      utility.screen.smallTabPort[0].matches ||
      utility.screen.largeMobileLand[0].matches ||
      utility.screen.largeMobilePort[0].matches ||
      utility.screen.smallMobileLand[0].matches ||
      utility.screen.smallMobilePort[0].matches
    ) {
      mobileStartUpdatingPhotoButton.addEventListener('click', (e) => {
        e.preventDefault();
        console.log(`Hello!`);
        Utility.openPhotoUpdateModal(photoUpdateModal);
      });
    } else {
      startUpdatingPhotoButton.addEventListener('click', (e) => {
        e.preventDefault();
        Utility.openPhotoUpdateModal(photoUpdateModal);
      });
    }

    // ~ Process of updating picture.
    const previewPath = document.querySelector('.form__path-preview');
    const photoInput = document.getElementById('photo');
    const image = document.querySelector('.form__preview-photo-container__picture-frame__image');
    const reader = new FileReader();

    reader.onload = (e) => {
      image.src = e.target.result;
    };

    photoInput.onchange = (e) => {
      const [file] = e.target.files;
      reader.readAsDataURL(file);
      previewPath.textContent = file.name;
    };

    const saveProfilePictureButton = document.querySelector('.button--update-photo');
    saveProfilePictureButton.addEventListener('click', (e) => {
      e.preventDefault();
      const form = new FormData();
      form.append('userId', `${this._id}`);
      form.append('photo', document.getElementById('photo').files[0]);

      user._updatePhoto(form);
      Utility.reloadPage();
    });

    // ~ Closing the update photo modal.
    const stopUpdatingPhotoButton = document.querySelector('.form-closure-icon__alt');
    stopUpdatingPhotoButton.addEventListener('click', (e) => {
      e.preventDefault();
      Utility._closeTheForm(photoUpdateModal);
    });
  }

  async watch(user, utility) {
    const userProfileContainer = document.querySelector('.user-profile-section');
    const userProfileButtons = document.querySelectorAll('.navigation--side-screen__section--account-links__link-container__link--link');
    const mobileProfileButtons = document.querySelectorAll('.r__mobile-user-profile-navigation__section--account-links__link-container__link--link');
    const userProfileForms = document.querySelectorAll('.form--full-width');
    const userProfileHeader = document.querySelector('.user-profile-section__header__text');
    const userProfileSubSections = document.querySelectorAll('.form__section--sub-section');
    const userProfileFormSectionButtons = document.querySelectorAll('.button--borderless-narrow');
    const transparentButtons = document.querySelectorAll('.button--small-transparent');
    const userProfileContainerClose = document.querySelector('.user-profile-closure-icon');

    if (
      utility.screen.smallTabPort[0].matches ||
      utility.screen.largeMobileLand[0].matches ||
      utility.screen.largeMobilePort[0].matches ||
      utility.screen.smallMobileLand[0].matches ||
      utility.screen.smallMobilePort[0].matches
    ) {
      if (mobileProfileButtons[0]) {
        await this.profilePicture(user, utility);
        this.personalInformation(this, user, userProfileContainer, userProfileHeader, transparentButtons[0], mobileProfileButtons[0], userProfileForms, userProfileForms[0]);
        this.communications(
          this,
          user,
          userProfileContainer,
          userProfileHeader,
          userProfileSubSections,
          userProfileFormSectionButtons,
          transparentButtons[1],
          mobileProfileButtons[1],
          userProfileForms,
          userProfileForms[1]
        );
        this.passwordManagement(this, user, userProfileContainer, userProfileHeader, transparentButtons[3], mobileProfileButtons[2], userProfileForms, userProfileForms[2], utility);
        this.accountManagement(
          this,
          user,
          userProfileContainer,
          userProfileHeader,
          [transparentButtons[5], transparentButtons[6], transparentButtons[7]],
          mobileProfileButtons[3],
          userProfileForms,
          userProfileForms[3]
        );
      }
    } else {
      await this.profilePicture(user, utility);
      this.personalInformation(this, user, userProfileContainer, userProfileHeader, transparentButtons[0], userProfileButtons[0], userProfileForms, userProfileForms[0]);
      this.communications(
        this,
        user,
        userProfileContainer,
        userProfileHeader,
        userProfileSubSections,
        userProfileFormSectionButtons,
        transparentButtons[1],
        userProfileButtons[1],
        userProfileForms,
        userProfileForms[1]
      );
      this.passwordManagement(this, user, userProfileContainer, userProfileHeader, transparentButtons[3], userProfileButtons[2], userProfileForms, userProfileForms[2], utility);
      this.accountManagement(
        this,
        user,
        userProfileContainer,
        userProfileHeader,
        [transparentButtons[5], transparentButtons[6], transparentButtons[7]],
        userProfileButtons[3],
        userProfileForms,
        userProfileForms[3]
      );
    }

    if (document.querySelector('.r__mobile-user-profile-navigation')) {
      console.log(true);
    } else {
      console.log(false);
    }

    userProfileContainerClose.addEventListener('click', (e) => {
      e.preventDefault();
      Utility.replaceClassName(userProfileContainer, `open`, `closed`);
    });
  }

  getLocalInformation(user) {
    let { earth, api } = Utility.getLocalStorageLocalInformation();
    if (!earth || !api) {
      console.log(`Started`);
      earth = Utility.getLocalInformation(user);
      console.log(`Ended`);
    }

    let isExpired = setInterval(() => {
      console.log(Utility.checkForKeyExpiration(earth, `timeLimit`, `World`));
      console.log(Utility.checkForKeyExpiration(api, `timeLimit`, `API`));
    }, 600000);

    let language = navigator.language;

    const { locale, currency, languages, countryName } = Utility.getLocale(api, earth, language);
    return { locale, currency, languages, countryName };
  }

  async build(userId) {
    let blankUser = new User(``, ``, ``, ``, ``, ``, ``, ``);
    let userCopy = await new User(``, ``, ``, ``, ``, ``, ``, ``)._getPersonData(userId);
    let userInfo = userCopy.data.data.user;
    let user = blankUser._createPlaceholderUser(userInfo, blankUser);
    let local = this.getLocalInformation(user);
    [...Object.entries(local), ...Object.entries(user)].forEach((entry) => this.set(entry));
    this.set([`longDate`, { day: 'numeric', month: 'long', year: 'numeric' }]);
    this.set([`shortDate`, { day: 'numeric', month: 'numeric', year: 'numeric' }]);
    return { profile: this, user: blankUser };
  }
}
