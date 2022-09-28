////////////////////////////////////////////
//  Core Modules
const fs = require('fs');

////////////////////////////////////////////
//  Third Party Modules
const dotenv = require('dotenv');
const jwt = require(`jsonwebtoken`);
////////////////////////////////////////////
//  Third Party Module Instances

////////////////////////////////////////////
//  Third Party Middleware
const crypto = require('crypto');

////////////////////////////////////////////
//  Third Party Config Files

////////////////////////////////////////////
//  My Middleware
const catchAsync = require(`./../Utilities/catchAsync`);
const AppError = require(`./../Utilities/appError`);
const sendEmail = require(`./../Utilities/Email`);

////////////////////////////////////////////
//  Routing Middleware

////////////////////////////////////////////
//  My Modules
const Calendar = require(`./../Utilities/Calendar`);
const response = require('http-browserify/lib/response');

////////////////////////////////////////////
//  MY FUNCTIONS

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

// MAKE REQUEST FOR AND STORE DATA FROM JSON FILE.
let freeLancerInfo = JSON.parse(fs.readFileSync(`${__dirname}/../Data/appointments.json`, 'utf-8'));

////////////////////////////////////////////
//  Exported Controllers

exports.renderApp = catchAsync(async (request, response) => {
  console.log(freeLancerInfo);
  response.status(200).render(`base`, {
    title: `Appoint Me`,
    errorMessage: '',
    successMessage: '',
    data: freeLancerInfo,
  });
});

exports.getInfo = catchAsync(async (request, response) => {
  response.status(200).json({
    status: `Success`,
    data: freeLancerInfo,
  });
});

exports.askForAppointment = catchAsync(async (request, response) => {
  console.log(request.body);
  await new sendEmail(request.body).sendAppointmentRequest();
});

exports.scheduleAppointment = catchAsync(async (request, response) => {
  let details = request.params;
  console.log(details);
  let appointment = {
    index: freeLancerInfo.appointments.length,
    date: details.date,
    startTime: details.startTime,
    endTime: details.endTime,
    attendees: [],
    type: details.communicationPreference,
  };
  let myDetails = {
    name: `${details.myFirstName} ${details.myLastName}`,
  };
  let theirDetails = {
    name: `${details.firstname} ${details.lastname}`,
    phoneNumber: details.phoneNumber,
    email: details.email,
  };

  appointment.attendees.push(myDetails);
  appointment.attendees.push(theirDetails);
  freeLancerInfo.appointments.push(appointment);
  fs.writeFileSync(`${__dirname}/../Data/appointments.json`, JSON.stringify(freeLancerInfo));

  response.status(200).json({
    status: `Success`,
    data: {
      appointments: freeLancerInfo.appointments,
      details: details,
    },
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
