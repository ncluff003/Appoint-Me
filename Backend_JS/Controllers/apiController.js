////////////////////////////////////////////
//  Core Modules

////////////////////////////////////////////
//  Third Party Modules
const dotenv = require('dotenv');
const jwt = require(`jsonwebtoken`);
////////////////////////////////////////////
//  Third Party Module Instances

////////////////////////////////////////////
//  Third Party Middleware
const crypto = require('crypto');
const axios = require('axios');
const translate = require('translate');

////////////////////////////////////////////
//  Third Party Config Files

////////////////////////////////////////////
//  My Middleware
const catchAsync = require(`./../Utilities/catchAsync`);
const AppError = require(`./../Utilities/appError`);

////////////////////////////////////////////
//  Routing Middleware

////////////////////////////////////////////
//  My Modules
const Calendar = require(`./../Utilities/Calendar`);

////////////////////////////////////////////
//  MY FUNCTIONS
const { get, getAll, set, timeTillExpires, remove, useNamespace } = require('./../Utilities/Cache');
// const { get, getAll, set, timeTillExpires, remove } = useNamespace(defaultNamespace);
// console.log(useNamespace);
// const { get, getAll, set, timeTillExpires, remove } = useNamespace(defaultNamespace);
// console.log(get, getAll, set, timeTillExpires, remove, useNamespace);

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createAndSendToken = (user, statusCode, method, request, response, template, title, optionalData, status, message) => {
  const token = signToken(user.id);
  if (method === `json`) {
    return response.status(statusCode).json({
      status: `${status}`,
      message: `${message}`,
    });
  }
  if (method === `render`) {
    return response.status(statusCode).render(`${template}`, {
      title: title,
      token,
      data: {
        user: user,
        ...optionalData,
      },
    });
  }
};

let placesBaseURL = 'https://www.placesapi.dev/api/v1/';
////////////////////////////////////////////
//  Exported Controllers

exports.getAPIInformation = catchAsync(async (request, response, next) => {
  // useNamespace(request.body.user._id);
  let endpoint = request.body.endpoint;
  let URL = `${placesBaseURL}${endpoint}`;
  let options = {
    method: `GET`,
    url: URL,
    headers: {
      'Content-Type': 'application/json',
    },
  };
  console.log(getAll());
  let data = get(`World`);
  // let languages = get(`World`[`Languages`]);
  // let currencies = get(`World`[`Currencies`]);
  // if (!languages || !currencies || !data) {
  if (!data || !data[`Language`] || !data[`Currencies`]) {
    data = await axios(options);
    set(`World`, data.data, 3600000);
  }
  if (!data) {
    return next(new AppError(`There Is No Data Found`, 400));
  }
  response.status(200).json({
    status: `Success`,
    data: data.data,
  });
});

exports.getTranslation = catchAsync(async (request, response, next) => {
  const text = request.body.text;
  const from = request.body.from;
  const to = request.body.to;
  if (!text || request.body.text === `` || text === undefined) {
    console.log(request.body);
    console.log(`Not Found ${text}`);
  }
  const translatedText = await translate(text, { from: from, to: to });
  console.log(`${request.body.text} , ${translatedText}`);

  response.status(200).json({
    status: `Success`,
    text: translatedText,
    body: request.body,
  });
});

exports.renderApp = catchAsync(async (request, response) => {
  response.status(200).render(`base`, {
    title: `King Richard`,
    errorMessage: '',
    successMessage: '',
  });
});

exports.renderAppLoggedIn = catchAsync(async (request, response) => {
  const user = request.user.id;
  console.log(user);
  createAndSendToken(user, 200, `render`, request, response, `loggedIn`, `King Richard | Home`, { calendar: Calendar });
});

exports.introduceMe = catchAsync(async (request, response) => {
  response.status(200).render(`about`, {
    title: `Pure 'N' Spiration | About Me`,
    errorMessage: '',
    successMessage: '',
  });
});

exports.viewMyWork = catchAsync(async (request, response) => {
  response.status(200).render(`projects`, {
    title: `Pure 'N' Spiration | My Work`,
    errorMessage: '',
    successMessage: '',
  });
});

exports.contactMe = catchAsync(async (request, response) => {
  response.status(200).render(`contact`, {
    title: `Pure 'N' Spiration | Contact Me`,
    errorMessage: '',
    successMessage: '',
  });
});
