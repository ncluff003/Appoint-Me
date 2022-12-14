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
const util = require('util');
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');

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
const Validate = require(`./../Models/validatorModel`);
const Calendar = require(`./../Utilities/Calendar`);
////////////////////////////////////////////
//  My Models
const User = require(`./../Models/userModel`);
const Budget = require('./../Models/budgetModel');
const Storage = require('./../Utilities/Cache');

////////////////////////////////////////////
//  My Functions

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createAndSendToken = (user, statusCode, method, request, response, template, title, optionalData, status, message) => {
  const token = signToken(user.id);
  const cookieOptions = {
    expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
    // secure: true, - This is only meant for https connections.
    httpOnly: true,
  };
  // if (request.password !== undefined) request.password = undefined;
  if (process.env.NODE_ENV === `production`) cookieOptions.secure = true;
  response.cookie('JWT', token, cookieOptions);
  if (method === `json`) {
    response.status(statusCode).json({
      status: `${status}`,
      message: `${message}`,
    });
  }
  if (method === `render`) {
    response.status(statusCode).render(`${template}`, {
      title: title,
      token,
      data: {
        user: user,
        ...optionalData,
      },
    });
  }
};

////////////////////////////////////////////
//  Exported Controllers

// UPDATE USER PASSWORD
exports.updateMyPassword = catchAsync(async (request, response, next) => {
  const user = await User.findById(request.user.id).select('+password');

  if (!(await user.correctPassword(request.body.currentPassword, user.password))) {
    return next(new AppError(`Your current password is wrong.`, 401));
  }

  user.password = request.body.newPassword;
  user.passwordConfirmed = request.body.newPasswordConfirmed;
  await user.save();

  createAndSendToken(user, 200, `render`, request, response, `loggedIn`, `King Richard | Home`, { calendar: Calendar });
});

// RESTRICTING ROUTES AS NECESSARY TO CERTAIN ROLES
exports.restrictTo = (...roles) => {
  return (request, response, next) => {
    // NOTES
    if (!roles.includes(request.user.role)) {
      return next(new AppError(`You do not have permission to perform this action`, 403));
    }
    next();
  };
};

// PROTECTING ROUTES TO BE SURE THE USER IS LOGGED IN
exports.protect = catchAsync(async (request, response, next) => {
  // 1) Getting token and check of it's there
  let token;
  if (request.headers.authorization && request.headers.authorization.startsWith('Bearer')) {
    token = request.headers.authorization.split(' ')[1];
  } else if (request.cookies.JWT) {
    token = request.cookies.JWT;
  }

  if (!token) {
    return next(new AppError('You are not logged in! Please log in to get access.', 401));
  }

  // 2) Verification token
  const decoded = await util.promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // 3) Check if user still exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(new AppError('The user belonging to this token does no longer exist.', 401));
  }

  // 4) Check if user changed password after the token was issued
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(new AppError('User recently changed password! Please log in again.', 401));
  }

  // GRANT ACCESS TO PROTECTED ROUTE
  request.user = currentUser;
  request.userBody = request.body;
  request.calendar = Calendar;
  next();
});

exports.setup2FA = catchAsync(async (request, response, next) => {
  if (typeof request.body.id === `string`) {
    console.log(request.body.id.length);
  }
  let qrcode;
  const secret = speakeasy.generateSecret({ length: 32 });

  let user = request.user;
  user.twoFactorTempSecret = secret.base32;

  user = await User.findByIdAndUpdate(user._id, { ...user }, { new: true, runValidators: true });

  QRCode.toDataURL(secret.otpauth_url, (error, imageData) => {
    qrcode = imageData;
    response.status(200).json({
      status: `Success`,
      data: {
        qrcode: qrcode,
      },
    });
  });
});

exports.verify2FA = catchAsync(async (request, response, next) => {
  const { token, userId } = request.body;
  let user = await User.findById(`${userId}`);
  const base32Secret = user.twoFactorTempSecret;
  const verified = speakeasy.totp.verify({ secret: base32Secret, encoding: 'base32', token: token, window: 1 });
  if (verified) {
    user.twoFactor = true;
    user.twoFactorSecret = base32Secret;
    user.twoFactorTempSecret = undefined;
    console.log(user.twoFactorSecret, user.twoFactorTempSecret);
    // user = await User.findByIdAndUpdate(user._id, { ...user }, { new: true, runValidators: true });
    user = await user.save({ validateBeforeSave: false });
    console.log(user);
    response.status(200).json({
      status: `Success`,
      message: `2-Factor Authentication Now Enabled.`,
    });
  }
});

exports.validate2FA = catchAsync(async (request, response, next) => {
  const { token, userId } = request.body;
  let user = await User.findById(`${userId}`);
  const base32Secret = user.twoFactorSecret;
  const validate = speakeasy.totp.verify({ secret: base32Secret, encoding: 'base32', token: token, window: 1 });
  if (validate) {
    user.twoFactor = true;
    user = await User.findByIdAndUpdate(user._id, { ...user }, { new: true, runValidators: true });
    response.status(200).json({
      status: `Success`,
      validated: validate,
      message: `2-Factor Authentication Now Enabled.`,
    });
  } else {
    response.status(400).json({
      status: `Error`,
      validated: validate,
      message: `Unable to validate token.  Try again.`,
    });
  }
});

// LOGGING IN
exports.login = catchAsync(async (request, response, next) => {
  let { id, username, password } = request.body;
  if (!request.body.id || id === `undefined`) id = request.params.id;
  // Check if User exists right along with Username & Password is correct.
  const user = await User.findById(`${id}`);

  // if (!user || !(await user.correctPassword(password, user.password))) return next(new AppError(`Incorrect username or password`), 401);
  // REACTIVATE USER IF INACTIVE
  if (user.active === false) {
    console.log('INACTIVE USER');
    user.active = true;
    user.save({ validateBeforeSave: false });
  }

  createAndSendToken(user, 200, `render`, request, response, `loggedIn`, `King Richard | Home`, { calendar: Calendar });
});

exports.logout = (request, response) => {
  response.cookie(`JWT`, 'Logged Out', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  response.status(200).json({ status: 'Success' });
};

// VALIDATING USER INPUT FOR SIGNING UP
exports.validateSignup = catchAsync(async (request, response, next) => {
  const formBody = request.body;
  if (!Validate.isName(formBody.firstname)) return next(new AppError(`First name must be only letters.`, 400));
  if (!Validate.isName(formBody.lastname)) return next(new AppError(`Last name must be only letters.`, 400));
  if (!Validate.isUsername(formBody.username)) return next(new AppError(`Username must start with a capital and contain letters and/or numbers..`, 400));
  if (!Validate.isEmail(formBody.email)) return next(new AppError(`Please provide a valid email address.`, 400));
  if (!Validate.isEmail(formBody.emailConfirmed)) return next(new AppError(`Please provide a valid email address.`, 400));
  if (!Validate.is_Eight_Character_One_Upper_Lower_Number_Special(formBody.password))
    return next(
      new AppError(
        `Passwords must contain at least 8 characters, amongst them being at least 1 capital letter, 1 lower case letter, 1 number, & 1 special symbol.  The special symbols may be the following: !, @, $, &, -, _, and &.`,
        400
      )
    );
  if (!Validate.is_Eight_Character_One_Upper_Lower_Number_Special(formBody.passwordConfirmed))
    return next(
      new AppError(
        `Passwords must contain at least 8 characters, amongst them being at least 1 capital letter, 1 lower case letter, 1 number, & 1 special symbol.  The special symbols may be the following: !, @, $, &, -, _, and &.`,
        400
      )
    );
  console.log(`Signup Successful.`);
  next();
});

// VALIDATING USER INPUT WHEN UPDATING
exports.validateUserUpdate = catchAsync(async (request, response, next) => {
  console.log(`Validating...`);
  const userSnippet = request.body;
  if (userSnippet.firstname) {
    if (!Validate.isName(userSnippet.firstname)) return next(new AppError(`First name must be only letters.`, 400));
  }
  if (userSnippet.lastname) {
    if (!Validate.isName(userSnippet.lastname)) return next(new AppError(`Last name must be only letters.`, 400));
  }
  if (userSnippet.username) {
    if (!Validate.isUsername(userSnippet.username)) return next(new AppError(`Username must start with a capital and contain letters and/or numbers..`, 400));
  }
  if (userSnippet.latterDaySaint) {
    if (userSnippet.latterDaySaint !== false && userSnippet.latterDaySaint !== true) {
      return next(new AppError(`You are either a Latter Day Saint or you or not.  There is NO in between.`));
    }
  }
  if (userSnippet.email) {
    if (!Validate.isEmail(userSnippet.email)) return next(new AppError(`Please provide a valid email address.`, 400));
  }
  if (userSnippet.emailConfirmed) {
    if (!Validate.isEmail(userSnippet.emailConfirmed)) return next(new AppError(`Please provide a valid email address.`, 400));
  }
  if (userSnippet.phoneNumber) {
    if (!Validate.isPhoneNumber(userSnippet.phoneNumber)) return next(new AppError(`Please provide a valid phone number.`, 400));
  }
  if (userSnippet.phoneNumberConfirmed) {
    if (!Validate.isPhoneNumber(userSnippet.phoneNumberConfirmed)) return next(new AppError(`Please provide a valid phone number.`, 400));
  }
  if (userSnippet.communicationPreference) {
    if (userSnippet.communicationPreference !== `Text` && userSnippet.communicationPreference !== `Email`) {
      return next(new AppError(`Please allow us to know your communication preference.`));
    }
  }
  console.log(`Update Successfully Reviewed!`);
  next();
});

exports.valudateUserPasswordUpdate = catchAsync(async (request, response, next) => {
  const userSnippet = request.body;
  console.log(`Validating...`);
  if (!Validate.is_Eight_Character_One_Upper_Lower_Number_Special(userSnippet.password))
    return next(
      new AppError(
        `Passwords must contain at least 8 characters, amongst them being at least 1 capital letter, 1 lower case letter, 1 number, & 1 special symbol.  The special symbols may be the following: !, @, $, &, -, _, and &.`,
        400
      )
    );
  if (!Validate.is_Eight_Character_One_Upper_Lower_Number_Special(userSnippet.passwordConfirmed))
    return next(
      new AppError(
        `Passwords must contain at least 8 characters, amongst them being at least 1 capital letter, 1 lower case letter, 1 number, & 1 special symbol.  The special symbols may be the following: !, @, $, &, -, _, and &.`,
        400
      )
    );
});

// SIGN UP VALIDATED USERS
exports.signup = catchAsync(async (request, response, next) => {
  const formBody = request.body;
  const newUser = await User.create({
    firstname: formBody.firstname,
    lastname: formBody.lastname,
    username: formBody.username,
    latterDaySaint: formBody.latterDaySaint,
    email: formBody.email,
    emailConfirmed: formBody.emailConfirmed,
    password: formBody.password,
    passwordConfirmed: formBody.passwordConfirmed,
  });

  const token = signToken(newUser._id);

  await new sendEmail(newUser).sendWelcome();

  response.status(200).json({
    status: `Success`,
    data: {
      user: newUser,
    },
  });
  // createAndSendToken(newUser, 201, `render`, request, response, `loggedIn`, `King Richard | Home`, {
  //   calendar: Calendar,
  // });
});

// RESET USERS PASSWORD IF FORGOTTEN
exports.resetPassword = catchAsync(async (request, response, next) => {
  // Get User Based On Token
  const hashedToken = crypto.createHash('sha256').update(request.params.token).digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  // If User Exists & Token Not Expired, Set New Password
  if (!user) return next(new AppError(`Token is invalid or has expired`, 400));

  // Update ChangedPasswordAt Property For New User
  user.password = request.body.password;
  user.passwordConfirmed = request.body.passwordConfirmed;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();
  // Log In User
  const token = signToken(user._id);

  request.user = user;

  response.status(200).json({
    status: `Success`,
    message: `You have successfully changed your password.`,
  });
});

// RENDERING PASSWORD RESET FORM
exports.renderPasswordReset = catchAsync(async (request, response, next) => {
  const resetToken = request.params.token;
  const resetURL = `${request.protocol}://${request.get('host')}/App/Users/ResetPassword/${resetToken}`;

  response.status(200).render('resetPassword', {
    title: `King Richard | Reset Password`,
    data: {
      token: resetToken,
      url: resetURL,
    },
  });
});

// SENDING EMAIL WITH LINK TO RESET PASSWORD UPON USER REQUESTING IT AFTER FORGETTING THEIR PASSWORD
exports.forgotPassword = catchAsync(async (request, response, next) => {
  const email = request.body.forgottenEmail;
  const user = await User.findOne({ email });
  if (!user) return next(new AppError(`There is no user with that email address.`, 404));

  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  try {
    const resetURL = `${request.protocol}://${request.get('host')}/App/Users/ResetPassword/${resetToken}`;
    await new sendEmail(user, resetURL).sendResetPassword();

    response.status(200).render(`base`, {
      title: `King Richard`,
      errorMessage: '',
      successMessage: 'Password Reset Email Sent',
    });
  } catch (error) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return next(new AppError(`There was an error sending the email.  Try again later.`, 500));
  }
});
