import axios from 'axios';
import qs from 'qs';
import * as Utility from './../Application/Utility';

const renderUsers = (users, id, budgetId) => {
  const userResultContainer = document.querySelector('.container--large__user-results');
  [...userResultContainer.childNodes].forEach((child) => child.remove());
  users.forEach((user) => {
    const userResult = document.createElement('section');
    Utility.addClasses(userResult, [`user-result`, `r__user-result`]);
    userResult.dataset.email = user.email;
    let numberOfSections = 3;
    let start = 0;
    while (start < numberOfSections) {
      const userSection = document.createElement('section');
      Utility.addClasses(userSection, [`user-section`, `r__user-section`]);
      if (start === 0) {
        const photoFrame = document.createElement('section');
        const userPhoto = document.createElement('img');
        userPhoto.src = `/DIST/CSS/Images/Users/${user.photo}`;
        userPhoto.alt = `Photo of ${user.firstname} ${user.lastname}`;

        Utility.addClasses(photoFrame, [`user-photo-frame`, `r__user-photo-frame`]);
        Utility.addClasses(userPhoto, [`user-photo`, `r__user-photo`]);
        Utility.insertElement('beforeend', photoFrame, userPhoto);
        Utility.insertElement('beforeend', userSection, photoFrame);
        if (user.photo === `user-circle.svg`) {
          userPhoto.style.height = `${85}%`;
        }
      } else if (start === 1) {
        const firstName = document.createElement('p');
        const lastName = document.createElement('p');
        Utility.addClasses(firstName, [`user-name`, `r__user-name`]);
        Utility.addClasses(lastName, [`user-name`, `r__user-name`]);
        firstName.textContent = user.firstname;
        lastName.textContent = user.lastname;
        Utility.insertElements(`beforeend`, userSection, [firstName, lastName]);
      } else if (start === 2) {
        const associateInviteButton = document.createElement('button');
        const adminInviteButton = document.createElement('button');

        Utility.addClasses(associateInviteButton, [`button--invite`, `r__button--invite`]);
        Utility.addClasses(adminInviteButton, [`button--invite`, `r__button--invite`]);

        associateInviteButton.textContent = `Invite To Be Associated`;
        adminInviteButton.textContent = `Invite To Be An Admin`;

        Utility.insertElement(`beforeend`, userSection, associateInviteButton);
        Utility.insertElement(`beforeend`, userSection, adminInviteButton);

        associateInviteButton.addEventListener(`click`, (e) => {
          e.preventDefault();
          try {
            let email = associateInviteButton.closest('.user-result').dataset.email;
            let connectionType = `Associate`;
            const response = axios({
              method: `POST`,
              url: `/App/Users/${id}/Budgets/${budgetId}/Invite-Users/${email}`,
              data: qs.stringify({
                email: email,
                type: connectionType,
                budget: budgetId,
                userId: id,
              }),
            });

            associateInviteButton.textContent = `Email Sent`;
            setTimeout(() => {
              associateInviteButton.textContent = `Invite To Be Associated`;
            }, 3000);
          } catch (error) {
            console.log(error);
          }
        });

        adminInviteButton.addEventListener(`click`, (e) => {
          e.preventDefault();
          try {
            let email = associateInviteButton.closest('.user-result').dataset.email;
            let connectionType = `Admin`;
            const response = axios({
              method: `POST`,
              url: `/App/Users/${id}/Budgets/${budgetId}/Invite-Users/${email}`,
              data: qs.stringify({
                email: email,
                type: connectionType,
                budget: budgetId,
                userId: id,
              }),
            });
            adminInviteButton.textContent = `Email Sent`;
            setTimeout(() => {
              adminInviteButton.textContent = `Invite To Be Associated`;
            }, 3000);
          } catch (error) {
            console.log(error);
          }
        });
      }
      Utility.insertElement(`beforeend`, userResult, userSection);
      start++;
    }
    //

    Utility.insertElement(`beforeend`, userResultContainer, userResult);
  });
};

export const watch = (placeholderBudget, user, utility) => {
  console.log(placeholderBudget);
  const searchButton = document.querySelector('.button--search');
  const searchInput = document.querySelector('.form__input--search');

  if (searchButton) {
    searchButton.addEventListener(`click`, async (e) => {
      e.preventDefault();
      let id = window.location.href.split('/')[5];
      let budgetId = window.location.href.split('/')[7];
      let searchValue = searchInput.value;
      if (/^[A-Za-z]+\s[A-Za-z]+$/.test(searchValue) === false) return alert(`Names should have only one space and no numbers!`);
      let data = { name: searchValue };
      try {
        const response = await axios({
          method: `POST`,
          url: `/App/Users/${id}/Budgets/${budgetId}/Invite-Users`,
          data: qs.stringify(data),
        });

        let users = response.data.data.users;
        renderUsers(users, id, budgetId);
        console.log(users);
      } catch (error) {
        console.log(error);
      }
    });
  }
};
