import * as Utility from './../Application/Utility';

const watchInvestmentValueConfirmationButtons = (event, index, secondaryIndex, placeholderBudget, user) => {
  const confirmInvestmentValueButtons = document.querySelectorAll('.button--confirm-value');
  let investments = placeholderBudget.investments;
  confirmInvestmentValueButtons[index].removeEventListener('click', watchInvestmentValueConfirmationButtons);
  const updateCurrentValueInput = document.querySelectorAll('.form__input--investment');

  investments[secondaryIndex].currentValue = Number(updateCurrentValueInput[index].value);
  investments[secondaryIndex].valueDifference = Number(investments[secondaryIndex].currentValue - investments[secondaryIndex].initialInvestment);
  updateCurrentValueInput[index].setAttribute(`readonly`, true);

  let budgetId = window.location.href.split('/')[7];
  placeholderBudget._updateBudget({ updateObject: { budgetId: budgetId, userId: user._id, investments: investments } }, `Investment-Planner`);
};

const _watchForCurrentValueUpdate = (event, index, secondaryIndex, placeholderBudget, user) => {
  const updateCurrentValueInput = document.querySelectorAll('.form__input--investment');

  if (updateCurrentValueInput[index].readOnly === true) {
    updateCurrentValueInput[index].removeAttribute(`readonly`);

    const confirmInvestmentValueButtons = document.querySelectorAll('.button--confirm-value');

    return confirmInvestmentValueButtons[index].addEventListener('click', watchInvestmentValueConfirmationButtons.bind(null, event, index, secondaryIndex, placeholderBudget, user));
  }
  if (updateCurrentValueInput[index].readOnly === '' || updateCurrentValueInput[index].readOnly === false) {
    return updateCurrentValueInput[index].setAttribute(`readonly`, true);
  }
};

const settleInvestment = (investments, index, dataIndex, placeholderBudget, user, utility) => {
  const investmentContainers = document.querySelectorAll('.investment-container');

  const settledInvestmentShellContainer = document.createElement('section');
  Utility.addClasses(settledInvestmentShellContainer, ['container--extra-small__margin-left-and-right', 'r__container--extra-small__margin-left-and-right']);
  Utility.insertElement(`beforeend`, investmentContainers[1], settledInvestmentShellContainer);

  const settledInvestmentContainerHeader = document.createElement('section');
  Utility.addClasses(settledInvestmentContainerHeader, ['container--extra-small__margin-left-and-right__header', 'r__container--extra-small__margin-left-and-right__header']);
  Utility.insertElement(`beforeend`, settledInvestmentShellContainer, settledInvestmentContainerHeader);

  const investmentTypeIcons = [`arrow-trend-up`, `sign-hanging`, `calendar-clock`, `asterisk`];
  const investmentHeaderIcon = document.createElement('i');
  Utility.addClasses(investmentHeaderIcon, [`fas`, 'container--extra-small__margin-left-and-right__header__icon', 'r__container--extra-small__margin-left-and-right__header__icon']);

  if (investments[index].firstChild.firstChild) {
    if (investments[index].firstChild.firstChild.classList.contains(`fa-chart-line`)) {
      investmentHeaderIcon.classList.add(`fa-chart-line`);
    }
    if (investments[index].firstChild.firstChild.classList.contains('fa-sign-hanging')) {
      investmentHeaderIcon.classList.add(`fa-sign-hanging`);
    }
    if (investments[index].firstChild.firstChild.classList.contains('fa-clock')) {
      investmentHeaderIcon.classList.add(`fa-clock`);
    }
    if (investments[index].firstChild.firstChild.classList.contains('fa-asterisk')) {
      investmentHeaderIcon.classList.add(`fa-asterisk`);
    }

    Utility.insertElement(`beforeend`, settledInvestmentContainerHeader, investmentHeaderIcon);
    const investmentHeaderText = document.createElement('p');
    Utility.addClasses(investmentHeaderText, [`container--extra-small__margin-left-and-right__header__text`, `r__container--extra-small__margin-left-and-right__header__text`]);
    investmentHeaderText.textContent = investments[index].firstChild.firstChild.nextSibling.textContent;
    Utility.insertElement(`beforeend`, settledInvestmentContainerHeader, investmentHeaderText);

    // CREATE INVESTMENT CONTENT
    const investmentContent = document.createElement('section');
    Utility.addClasses(investmentContent, ['container--extra-small__margin-left-and-right__content__column', 'r__container--extra-small__margin-left-and-right__content__column']);
    Utility.insertElement(`beforeend`, settledInvestmentShellContainer, investmentContent);

    // CREATE INVESTMENT EXPLANATORY CONTENT
    const investmentExplanationSection = document.createElement('section');
    Utility.addClasses(investmentExplanationSection, ['investment-explanatory-information', 'r__investment-explanatory-information']);
    Utility.insertElement(`beforeend`, investmentContent, investmentExplanationSection);

    const investmentDescription = document.createElement('section');
    Utility.addClasses(investmentDescription, ['investment-description', 'r__investment-description']);
    Utility.insertElement(`beforeend`, investmentExplanationSection, investmentDescription);

    const investmentDescriptionText = document.createElement('p');
    Utility.addClasses(investmentDescriptionText, ['investment-description__text', 'r__investment-description__text']);
    investmentDescriptionText.textContent = investments[index].firstChild.nextSibling.firstChild.firstChild.firstChild.textContent;

    const settledInvestmentValueContainer = document.createElement('section');
    Utility.addClasses(settledInvestmentValueContainer, ['investment-value-information--settled', 'r__investment-value-information--settled']);
    Utility.insertElement(`beforeend`, investmentContent, settledInvestmentValueContainer);

    const settledValueContainerText = document.createElement('p');
    Utility.addClasses(settledValueContainerText, ['investment-value-information--settled__text', 'r__investment-value-information--settled__text']);

    if (placeholderBudget.investments[dataIndex].valueDifference < 0) {
      settledValueContainerText.textContent = `Lost ${Number(placeholderBudget.investments[dataIndex].initialInvestment - placeholderBudget.investments[dataIndex].currentValue)}`;
      settledInvestmentShellContainer.classList.add('negative-investment');
    }
    if (placeholderBudget.investments[dataIndex].valueDifference === 0) {
      settledValueContainerText.textContent = `Broke Even`;
      settledInvestmentShellContainer.classList.add('neutral-investment');
    }
    if (placeholderBudget.investments[dataIndex].valueDifference > 0) {
      settledValueContainerText.textContent = `Gained ${Number(placeholderBudget.investments[dataIndex].currentValue - placeholderBudget.investments[dataIndex].initialInvestment)}`;
      settledInvestmentShellContainer.classList.add('positive-investment');
    }

    const investmentInitialValue = Number(investments[index].firstChild.nextSibling.firstChild.nextSibling.firstChild.firstChild.nextSibling.textContent.split('$')[1]);

    Utility.insertElement(`beforeend`, settledInvestmentValueContainer, settledValueContainerText);
  }

  if (!investments[index].firstChild.firstChild) {
    if (investments[index].firstChild.nextSibling.firstChild.classList.contains(`fa-chart-line`)) {
      investmentHeaderIcon.classList.add(`fa-chart-line`);
    }
    if (investments[index].firstChild.nextSibling.firstChild.classList.contains('fa-sign-hanging')) {
      investmentHeaderIcon.classList.add(`fa-sign-hanging`);
    }
    if (investments[index].firstChild.nextSibling.firstChild.classList.contains('fa-clock')) {
      investmentHeaderIcon.classList.add(`fa-clock`);
    }
    if (investments[index].firstChild.nextSibling.firstChild.classList.contains('fa-asterisk')) {
      investmentHeaderIcon.classList.add(`fa-asterisk`);
    }

    Utility.insertElement(`beforeend`, settledInvestmentContainerHeader, investmentHeaderIcon);
    const investmentHeaderText = document.createElement('p');
    Utility.addClasses(investmentHeaderText, ['container--extra-small__margin-left-and-right__header__text', 'r__container--extra-small__margin-left-and-right__header__text']);
    investmentHeaderText.textContent = investments[index].firstChild.nextSibling.firstChild.nextSibling.textContent;

    Utility.insertElement(`beforeend`, settledInvestmentContainerHeader, investmentHeaderText);

    // CREATE INVESTMENT CONTENT
    const investmentContent = document.createElement('section');
    Utility.addClasses(investmentContent, ['container--extra-small__margin-left-and-right__content__column', 'r__container--extra-small__margin-left-and-right__content__column']);
    Utility.insertElement(`beforeend`, settledInvestmentShellContainer, investmentContent);

    // CREATE INVESTMENT EXPLANATORY CONTENT
    const investmentExplanationSection = document.createElement('section');
    Utility.addClasses(investmentExplanationSection, ['investment-explanatory-information', 'r__investment-explanatory-information']);
    Utility.insertElement(`beforeend`, investmentContent, investmentExplanationSection);

    const investmentDescription = document.createElement('section');
    Utility.addClasses(investmentDescription, ['investment-description', 'r__investment-description']);
    Utility.insertElement(`beforeend`, investmentExplanationSection, investmentDescription);

    const investmentDescriptionText = document.createElement('p');
    Utility.addClasses(investmentDescriptionText, ['investment-description__text', 'r__investment-description__text']);
    investmentDescriptionText.textContent = investments[index].firstChild.nextSibling.nextSibling.firstChild.firstChild.textContent;

    Utility.insertElement(`beforeend`, investmentDescription, investmentDescriptionText);

    const settledInvestmentValueContainer = document.createElement('section');
    Utility.addClasses(settledInvestmentValueContainer, ['investment-value-information--settled', 'r__investment-value-information--settled']);
    Utility.insertElement(`beforeend`, investmentContent, settledInvestmentValueContainer);

    const settledValueContainerText = document.createElement('p');
    Utility.addClasses(settledValueContainerText, ['investment-value-information--settled__text', 'r__investment-value-information--settled__text']);
    if (placeholderBudget.investments[index - 1].valueDifference < 0) {
      settledValueContainerText.textContent = `Lost ${Number(placeholderBudget.investments[index - 1].initialInvestment - placeholderBudget.investments[index - 1].currentValue)}`;
      settledInvestmentShellContainer.classList.add('negative-investment');
    }
    if (placeholderBudget.investments[index - 1].valueDifference === 0) {
      settledValueContainerText.textContent = `Broke Even`;
      settledInvestmentShellContainer.classList.add('neutral-investment');
    }
    if (placeholderBudget.investments[index - 1].valueDifference > 0) {
      settledValueContainerText.textContent = `Gained ${Number(placeholderBudget.investments[index - 1].currentValue - placeholderBudget.investments[index - 1].initialInvestment)}`;
      settledInvestmentShellContainer.classList.add('positive-investment');
    }

    const investmentInitialValue = Number(investments[index].firstChild.nextSibling.nextSibling.firstChild.nextSibling.firstChild.firstChild.nextSibling.textContent.split('$')[1]);

    Utility.insertElement(`beforeend`, settledInvestmentValueContainer, settledValueContainerText);
  }

  let budgetId = window.location.href.split('/')[7];
  placeholderBudget.investments[dataIndex].settled = !placeholderBudget.investments[dataIndex].settled;
  placeholderBudget._updateBudget({ updateObject: { budgetId: budgetId, userId: user._id, investments: placeholderBudget.investments } }, `Investment-Planner`);
  investments[index].remove();
  Utility.reloadPage();
};

const renderNewInvestment = (options, utility) => {
  const investmentContainers = document.querySelectorAll('.container--extra-small__margin-left-and-right');
  const investmentAccountPreview = investmentContainers[0];

  const investmentShellContainer = document.createElement('section');
  Utility.addClasses(investmentShellContainer, ['container--extra-small__margin-left-and-right', 'r__container--extra-small__margin-left-and-right']);

  investmentShellContainer.dataset.investment = options.placeholderBudget.investments.length;

  investmentAccountPreview.insertAdjacentElement('afterend', investmentShellContainer);
  const investmentHeader = document.createElement('section');
  Utility.addClasses(investmentHeader, ['container--extra-small__margin-left-and-right__header', 'r__container--extra-small__margin-left-and-right__header']);
  Utility.insertElement(`beforeend`, investmentShellContainer, investmentHeader);

  const investmentTypeIcons = [`arrow-trend-up`, `sign-hanging`, `calendar-clock`, `asterisk`];
  const investmentHeaderIcon = document.createElement('i');
  Utility.addClasses(investmentHeaderIcon, [
    `fas`,
    'container--extra-small__margin-left-and-right__header__icon',
    'r__container--extra-small__margin-left-and-right__header__icon',
    utility.investmentTypes[options.type],
  ]);

  Utility.insertElement(`beforeend`, investmentHeader, investmentHeaderIcon);
  const investmentHeaderText = document.createElement('p');
  Utility.addClasses(investmentHeaderText, ['container--extra-small__margin-left-and-right__header__text', 'r__container--extra-small__margin-left-and-right__header__text']);
  investmentHeaderText.textContent = options.name;
  Utility.insertElement(`beforeend`, investmentHeader, investmentHeaderText);

  const investmentHeaderType = document.createElement('p');
  Utility.addClasses(investmentHeaderType, ['container--extra-small__margin-left-and-right__header__investment-type', 'r__container--extra-small__margin-left-and-right__header__investment-type']);
  investmentHeaderType.textContent = options.type;
  Utility.insertElement(`beforeend`, investmentHeader, investmentHeaderType);

  // CREATE INVESTMENT CONTENT
  const investmentContent = document.createElement('section');
  Utility.addClasses(investmentContent, [`container--extra-small__margin-left-and-right__content__column`, `r__container--extra-small__margin-left-and-right__content__column`]);
  Utility.insertElement(`beforeend`, investmentShellContainer, investmentContent);

  // CREATE INVESTMENT EXPLANATORY CONTENT
  const investmentExplanationSection = document.createElement('section');
  Utility.addClasses(investmentExplanationSection, ['investment-explanatory-information', 'r__investment-explanatory-information']);
  Utility.insertElement(`beforeend`, investmentContent, investmentExplanationSection);

  const investmentDescription = document.createElement('section');
  Utility.addClasses(investmentDescription, [`investment-description`, `r__investmentDescription`]);
  Utility.insertElement(`beforeend`, investmentExplanationSection, investmentDescription);

  const investmentDescriptionText = document.createElement('p');
  Utility.addClasses(investmentDescriptionText, [`investment-description__text`, `r__investment-description__text`]);
  investmentDescriptionText.textContent = options.description;

  Utility.insertElement(`beforeend`, investmentDescription, investmentDescriptionText);

  const investmentSettleContainer = document.createElement('section');
  Utility.addClasses(investmentSettleContainer, ['investment-settle-container', 'r__investment-settle-container']);
  Utility.insertElement(`beforeend`, investmentExplanationSection, investmentSettleContainer);

  const investmentSettleButton = document.createElement('button');
  Utility.addClasses(investmentSettleButton, [`button--settle`, `r__button--settle`]);
  Utility.insertElement(`beforeend`, investmentSettleContainer, investmentSettleButton);

  const investmentSettleButtonText = document.createElement('p');
  Utility.addClasses(investmentSettleButtonText, ['button--settle__text', 'r__button--settle__text']);
  investmentSettleButtonText.textContent = `Settle`;
  investmentSettleButton.addEventListener('click', (e) => {
    e.preventDefault();
    const clicked = e.target;
    const investmentShellContainers = document.querySelectorAll('.container--extra-small__margin-left-and-right');
    const currentInvestmentIndex = [...investmentShellContainers].indexOf(clicked.closest('.container--extra-small__margin-left-and-right'));
    settleInvestment(investmentShellContainers, currentInvestmentIndex, Number(investmentShellContainers[currentInvestmentIndex].dataset.investment), options.placeholderBudget, options.user, utility);
  });

  Utility.insertElement(`beforeend`, investmentSettleButton, investmentSettleButtonText);

  const investmentValueInformationContainer = document.createElement('section');
  Utility.addClasses(investmentValueInformationContainer, ['investment-value-information', 'r__investment-value-information']);
  Utility.insertElement(`beforeend`, investmentContent, investmentValueInformationContainer);

  const investmentValueInformationContainerHalfOne = document.createElement('section');
  const investmentValueInformationContainerHalfTwo = document.createElement('section');
  Utility.addClasses(investmentValueInformationContainerHalfOne, ['investment-value-information__half', 'r__investment-value-information__half']);
  Utility.addClasses(investmentValueInformationContainerHalfTwo, ['investment-value-information__half', 'r__investment-value-information__half']);
  Utility.insertElement(`beforeend`, investmentValueInformationContainer, investmentValueInformationContainerHalfOne);
  Utility.insertElement(`beforeend`, investmentValueInformationContainer, investmentValueInformationContainerHalfTwo);

  const investmentValueInformationContainerHalfOneHeader = document.createElement('p');
  const investmentValueInformationContainerHalfTwoHeader = document.createElement('p');
  Utility.addClasses(investmentValueInformationContainerHalfOneHeader, ['investment-value-information__half__header', 'r__investment-value-information__half__header']);
  Utility.addClasses(investmentValueInformationContainerHalfTwoHeader, ['investment-value-information__half__header', 'r__investment-value-information__half__header']);

  investmentValueInformationContainerHalfOneHeader.textContent = `Initial Investment`;
  investmentValueInformationContainerHalfTwoHeader.textContent = `Current Value`;

  Utility.insertElement(`beforeend`, investmentValueInformationContainerHalfOne, investmentValueInformationContainerHalfOneHeader);
  Utility.insertElement(`beforeend`, investmentValueInformationContainerHalfTwo, investmentValueInformationContainerHalfTwoHeader);

  const investmentValueInformationContainerHalfOneText = document.createElement('p');
  Utility.addClasses(investmentValueInformationContainerHalfOneText, ['investment-value-information__half__text', 'r__investment-value-information__half__text']);
  investmentValueInformationContainerHalfOneText.textContent = utility.money.format(options.initialInvestment);

  Utility.insertElement(`beforeend`, investmentValueInformationContainerHalfOne, investmentValueInformationContainerHalfOneText);

  const investmentInputContainer = document.createElement('section');
  Utility.addClasses(investmentInputContainer, ['investment-input-container', 'r__investment-input-container']);

  Utility.insertElement(`beforeend`, investmentValueInformationContainerHalfTwo, investmentInputContainer);

  const investmentInput = document.createElement('input');
  Utility.addClasses(investmentInput, ['form__input--investment', 'r__form__input--investment']);
  investmentInput.type = `number`;
  investmentInput.placeholder = `Enter New Value`;
  investmentInput.readOnly = true;

  Utility.insertElement(`beforeend`, investmentInputContainer, investmentInput);

  const investmentValueConfirmationButton = document.createElement('button');
  Utility.addClasses(investmentValueConfirmationButton, ['button--confirm-value', 'r__button--confirm-value']);

  const investmentValueConfirmationButtonIcon = document.createElement('i');
  Utility.addClasses(investmentValueConfirmationButtonIcon, [`fas`, `fa-check`, 'button--confirm-value__icon', 'r__button--confirm-value__icon']);
  Utility.insertElement(`beforeend`, investmentValueConfirmationButton, investmentValueConfirmationButtonIcon);
  Utility.insertElement(`beforeend`, investmentInputContainer, investmentValueConfirmationButton);

  const investmentUpdateValueTextLink = document.createElement('p');
  Utility.addClasses(investmentUpdateValueTextLink, ['investment-value-information__half__update-text', 'r__investment-value-information__half__update-text']);
  investmentUpdateValueTextLink.textContent = `Update Value`;
  Utility.insertElement(`beforeend`, investmentValueInformationContainerHalfTwo, investmentUpdateValueTextLink);
  // Utility.reloadPage();
};

const closeInvestmentCreation = (event) => {
  const closeInvestmentCreationButton = document.querySelector('.button--borderless-narrow__investment');
  const addInvestmentButton = document.querySelector('.container--extra-small__margin-left-and-right__content-icon');
  const addInvestmentForm = document.querySelector('.form--extra-small__column');
  closeInvestmentCreationButton.removeEventListener(`click`, closeInvestmentCreation);
  Utility.replaceClassName(closeInvestmentCreationButton, `open`, `closed`);
  Utility.replaceClassName(addInvestmentForm, `open`, `closed`);
  Utility.replaceClassName(addInvestmentButton, `closed`, `open`);
};

export const watch = (placeholderBudget, user, utility) => {
  const addInvestmentButton = document.querySelector('.container--extra-small__margin-left-and-right__content-icon');
  const closeInvestmentCreationButton = document.querySelector('.button--borderless-narrow__investment');
  const addInvestmentForm = document.querySelector('.form--extra-small__column');

  if (addInvestmentButton) {
    addInvestmentButton.addEventListener('click', (e) => {
      Utility.toggleClasses(closeInvestmentCreationButton, [`closed`, `open`]);
      Utility.replaceClassName(addInvestmentForm, `closed`, `open`);
      Utility.replaceClassName(addInvestmentButton, `open`, `closed`);
      closeInvestmentCreationButton.addEventListener('click', closeInvestmentCreation);
    });
    const investmentType = document.querySelector('.form__select--accounts-short');
    const investmentName = document.getElementById('investmentName');
    const investmentDescription = document.getElementById('investmentDescription');
    const initialInvestment = document.getElementById('initialInvestment');
    const createInvestmentButton = document.querySelector('.button--extra-extra-small__alt');
    createInvestmentButton.addEventListener('click', (e) => {
      e.preventDefault();
      renderNewInvestment(
        {
          type: investmentType.value,
          name: investmentName.value,
          description: investmentDescription.value,
          initialInvestment: Number(initialInvestment.value),
          placeholderBudget: placeholderBudget,
          user: user,
        },
        utility
      );
      let updateObject = {
        investments: [],
      };
      let currentValue = initialInvestment.value;
      let valueDifference = Number(currentValue - initialInvestment.value);
      if (isNaN(valueDifference)) valueDifference = 0;

      placeholderBudget.investments.push({
        investmentType: investmentType.value,
        investmentName: investmentName.value,
        investmentDescription: investmentDescription.value,
        initialInvestment: Number(initialInvestment.value),
        currentValue: Number(currentValue),
        valueDifference: valueDifference,
      });

      let budgetId = window.location.href.split('/')[7];
      placeholderBudget._updateBudget(
        {
          updateObject: {
            budgetId: budgetId,
            userId: user._id,
            investments: placeholderBudget.investments,
          },
        },
        `Investment-Planner`
      );
      Utility.reloadPage();
    });
  }

  const investmentContainers = document.querySelectorAll('.container--extra-small__margin-left-and-right');
  const investmentValueInformationContainers = document.querySelectorAll('.investment-value-information');
  const investmentSettleButtons = document.querySelectorAll('.button--settle');
  investmentSettleButtons.forEach((button, i) => {
    button.addEventListener('click', (e) => {
      e.preventDefault();
      let clicked = e.target;
      const currentInvestmentIndex = [...investmentContainers].indexOf(clicked.closest('.container--extra-small__margin-left-and-right'));

      settleInvestment(investmentContainers, currentInvestmentIndex, Number(investmentContainers[currentInvestmentIndex].dataset.investment), placeholderBudget, user, utility);
    });
  });

  const openUpdateCurrentValueButtons = document.querySelectorAll('.investment-value-information__half__update-text');
  if (openUpdateCurrentValueButtons[0]) {
    openUpdateCurrentValueButtons.forEach((button, i) => {
      let index = Number(openUpdateCurrentValueButtons[i].closest('.container--extra-small__margin-left-and-right').dataset.investment);
      let boundListener = _watchForCurrentValueUpdate.bind(null, event, i, index, placeholderBudget, user);

      button.addEventListener('click', boundListener);
    });
  }
};
