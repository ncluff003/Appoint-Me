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

////////////////////////////////////////////
//  Third Party Config Files

////////////////////////////////////////////
//  Third Party API Configs

// SAVING THE INFO BELOW IF I NEED HELP WITH APIs FOR THIS BUDGET APP.
// const baseURL = `https://restcountries.com/v2/all`;
// let options = {
//   method: `GET`,
//   url: baseURL,
//   headers: {
//     'Content-Type': 'application/json',
//   },
// };

////////////////////////////////////////////
//  My Middleware
const catchAsync = require(`./../Utilities/catchAsync`);
const AppError = require(`./../Utilities/appError`);
const sendEmail = require(`./../Utilities/Email`);
const AppController = require(`./appController`);

////////////////////////////////////////////
//  Routing Middleware

////////////////////////////////////////////
//  My Modules
const Validate = require(`./../Models/validatorModel`);
const Calendar = require(`./../Utilities/Calendar`);

////////////////////////////////////////////
//  My Models
const User = require(`./../Models/userModel`);
const Budget = require(`./../Models/budgetModel`);

////////////////////////////////////////////
//  My Functions

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

let filterObj = (object, allowedFields) => {
  let filtered = Object.keys(object)
    .filter((key) => allowedFields.includes(key))
    .reduce((obj, key) => {
      obj[key] = object[key];
      return obj;
    }, {});
  if (filtered.accounts) {
    let filteredValues = Object.values(filtered.accounts);
    let filteredKeys = Object.keys(filtered.accounts);
    let newEntries = [];

    filteredKeys.forEach((key, i) => {
      if (key === `unAllocated`) {
        filteredValues[i].amount = Number(filteredValues[i].amount);
      }

      if (key === `monthlyBudget`) {
        filteredValues[i].amount = Number(filteredValues[i].amount);
      }

      if (key === `emergencyFund`) {
        filteredValues[i].emergencyFundGoal = Number(filteredValues[i].emergencyFundGoal);
        filteredValues[i].amount = Number(filteredValues[i].amount);
        if (isNaN(Number(filteredValues[i].amount))) filteredValues[i].amount = 0;
      }

      if (key === `savingsFund`) {
        filteredValues[i].savingsGoal = Number(filteredValues[i].savingsGoal);
        filteredValues[i].savingsPercentage = Number(filteredValues[i].savingsPercentage);
        filteredValues[i].amount = Number(filteredValues[i].amount);
      }

      if (key === `expenseFund`) {
        filteredValues[i].amount = Number(filteredValues[i].amount);
        if (isNaN(Number(filteredValues[i].amount))) filteredValues[i].amount = 0;
      }

      if (key === `surplus`) {
        filteredValues[i].amount = Number(filteredValues[i].amount);
      }

      if (key === `investmentFund`) {
        filteredValues[i].investmentGoal = Number(filteredValues[i].investmentGoal);
        filteredValues[i].investmentPercentage = Number(filteredValues[i].investmentPercentage);
        filteredValues[i].amount = Number(filteredValues[i].amount);
      }

      if (key === `debt`) {
        filteredValues[i].amount = Number(filteredValues[i].amount);
        filteredValues[i].debtAmount = Number(filteredValues[i].debtAmount);
      }

      if (key === `tithing`) {
        filteredValues[i].amount = Number(filteredValues[i].amount);
      }
      newEntries.push([key, filteredValues[i]]);
    });
  }
  if (filtered.transactions) {
    let filteredValues = Object.values(filtered.transactions);
    let filteredKeys = Object.keys(filtered.transactions);
    let newEntries = [];

    filteredKeys.forEach((key, i) => {
      if (key === `plannedTransactions`) {
        let filteredValues = Object.values(filtered.transactions);
        let filteredKeys = Object.keys(filtered.transactions);
        let newEntries = [];
        filteredKeys.forEach((key, i) => {
          if (key === `amount`) {
            filteredValues[i].amount = Number(filteredValues[i].amount);
            if (isNaN(Number(filteredValues[i].amount))) filteredValues[i].amount = 0;
          }
          if (key === `amountSaved`) {
            filteredValues[i].amount = Number(filteredValues[i].amount);
            if (isNaN(Number(filteredValues[i].amount))) filteredValues[i].amount = 0;
          }
          newEntries.push([key, filteredValues[i]]);
        });
      }
      newEntries.push([key, filteredValues[i]]);
    });
  }
  return filtered;
};

const specialFilter = (object, allowedFields) => {
  const values = Object.values(object.accounts);
  const keys = Object.keys(object.accounts);

  let filtered = [keys, values];
  return filtered;
};
const createAndSendToken = (user, statusCode, method, request, response, template, title, optionalData, status, message) => {
  const calendar = Calendar;
  const token = signToken(user.id);
  if (method === `json`) {
    if (optionalData.error) {
      if (optionalData.budget) {
        request.budget = optionalData.budget;
      }
      if (optionalData.calendar) {
        request.calendar = optionalData.calendar;
      }
      if (optionalData.error) {
        request.error = optionalData.error;
      }
      return response.status(statusCode).json({
        status: `${status}`,
        message: `${message}`,
        data: {
          ...optionalData,
        },
      });
    }
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
        ...optionalData,
        calendar: calendar,
        user: user,
      },
    });
  }
};

////////////////////////////////////////
// -- I KEEP SEEING THIS CODE REPEATED -- //
////////////////////////////////////////

exports.addUser = catchAsync(async (request, response, next) => {
  const { type, id, userId } = request.params;
  const user = await User.findById(`${userId}`);
  const budget = await Budget.findById(`${id}`);
  console.log(request.params);

  let found = false;
  user.budgets.forEach((checkBudget) => {
    if (checkBudget._id.equals(budget._id)) {
      found = true;
    }
  });
  console.log(found);
  if (found === true) {
    createAndSendToken(user, 200, `render`, request, response, `base`, `King Richard`, { budget: budget, calendar: Calendar }, 200, `Success`);
  }
  if (found === false) {
    user.budgets.push(budget);
  }

  if (type === `Associate`) {
    if (!budget.associatedUsers.includes(`${user._id}`)) {
      budget.associatedUsers.push(`${user._id}`);
    }
  } else if (type === `Admin`) {
    if (!budget.budgetAdmins.includes(`${user._id}`)) {
      budget.budgetAdmins.push(`${user._id}`);
      budget.associatedUsers.push(`${user._id}`);
    }
  }

  await user.save({ validateBeforeSave: false });
  await budget.save({ validateBeforeSave: false });
  createAndSendToken(user, 200, `render`, request, response, `base`, `King Richard`, { budget: budget, calendar: Calendar }, 200, `Success`);
});

exports.inviteUser = catchAsync(async (request, response, next) => {
  const { email, type, budget, userId } = request.body;
  const result = await User.find({ email: email });
  const currentUser = await User.findById(`${userId}`);
  const user = result[0];
  console.log(user, currentUser);
  if (type === `Associate`) {
    await new sendEmail(user).sendAssociateInvite({ type: type, user: user, friend: currentUser, budgetId: budget });
  } else if (type === `Admin`) {
    await new sendEmail(user).sendAdminInvite({ type: type, user: user, friend: currentUser, budgetId: budget });
  }
});

exports.getUsers = catchAsync(async (request, response, next) => {
  let firstname = request.body.name.split(' ')[0];
  let lastname = request.body.name.split(' ')[1];

  let results = await User.find({ firstname: { $regex: firstname, $options: 'i' }, lastname: { $regex: lastname, $options: 'i' } });

  let users = results.map((user) => {
    return { firstname: user.firstname, lastname: user.lastname, username: user.username, email: user.email, photo: user.photo };
  });

  console.log(users);

  response.status(200).json({
    status: `Success`,
    data: {
      users: users,
    },
  });
});

const getCurrentInfo = async (request, response, next) => {
  const currentInfo = {};
  const user = request.user;
  let budgetID = request.params.id;
  if (!budgetID) budgetID = user.budgets[user.budgets.length - 1];
  const budget = await Budget.findById(budgetID);
  currentInfo.user = user;
  currentInfo.budget = budget;
  return currentInfo;
};

// const user = await User.findById(request.user.id);
// const user = request.user;
// let budgetID = request.params.id;
// if (!budgetID) budgetID = user.budgets[user.budgets.length - 1];
// const budget = await Budget.findById(budgetID);

exports.createBudget = catchAsync(async (request, response, next) => {
  const budgetBody = request.body;
  let budget = budgetBody.budget;
  const user = await User.findById(request.user.id);
  budget = await Budget.create({
    name: budget.name,
    createdAt: new Date(),
    lastUpdated: new Date(),
    currentMonth: budget.currentMonth,
    associatedUsers: user.id,
    budgetAdmins: user.id,
    accounts: budget.accounts,
    mainCategories: budget.mainCategories,
  });
  user.budgets.push(budget._id);
  request.body.budgetId = budget._id;
  request.budgetId = budget._id;

  // Save embedded budget into the user.
  await user.save({ validateBeforeSave: false });
  createAndSendToken(user, 201, `render`, request, response, `./Budget/budgetLanding`, `King Richard | ${budget.name}`, { budget: budget }, 200, `Success`);
});

exports.updateMyBudget = catchAsync(async (request, response, next) => {
  console.log('----------------------------------------------------------------');
  console.log(`--------------------------------------------`);
  console.log(`Request`);
  console.log(`--------------------------------------------`);
  console.log(request.body);
  console.log('----------------------------------------------------------------');
  const { budgetId } = request.body;
  const budget = await Budget.findById(`${budgetId}`);

  // CREATE ERROR IF USER TRIES TO POST PASSWORD DATA
  if (request.body.password || request.body.passwordConfirmed) {
    return next(new AppError(`This route is not for password updates.  Please use /updateMyPassword route.`, 400));
  }
  // UPDATE BUDGET DOCUMENT
  const filteredBody = filterObj(request.body, [`name`, `lastUpdated`, `currentMonth`, `previousMonth`, `accounts`, `mainCategories`, `transactions`, `investments`, `debts`]);
  console.log(`--------------------------------------------`);
  console.log(`Budget`);
  console.log(`--------------------------------------------`);
  console.log(`--------------------------------------------`);
  console.log(budget);
  console.log(`--------------------------------------------`);
  console.log(`--------------------------------------------`);
  console.log(`Filtered`);
  console.log(`--------------------------------------------`);
  console.log(`--------------------------------------------`);
  console.log(filteredBody);
  console.log(`--------------------------------------------`);

  console.log(budget._id);

  let updatedBudget = await Budget.findByIdAndUpdate(budget.id, filteredBody, { new: true, runValidators: true });
  // // await budget.save();
  console.log(updatedBudget);
  // return response.status(200).json({
  //   status: `Success`,
  //   data: updatedBudget,
  // });
  // createAndSendToken(updatedUser, 200, `render`, request, response, `loggedIn`, `King Richard | Home`, { calendar: Calendar });
});

exports.deleteBudget = catchAsync(async (request, response, next) => {
  const id = request.originalUrl.split('/')[5];
  const user = await User.findById(request.user.id);

  // REMOVING BUDGET FROM USERS BUDGETS.
  user.budgets = user.budgets.filter((b, i) => {
    if (b._id.toString() !== id) return b;
  });
  await user.save({ validateBeforeSave: false });

  // DELETING BUDGET FROM THE DATABASE
  await Budget.findByIdAndDelete(id);
  response.status(204).json({
    status: 'Success',
    message: 'Deleted',
  });
});

////////////////////////////////////////////
//  Exported Controllers
exports.retrieveBudgetInfo = catchAsync(async (request, response, next) => {
  // const user = await User.findById(request.user.id);
  const user = request.user;
  let budgetID = user.budgets[user.budgets.length - 1];
  const budget = await Budget.findById(budgetID);
  if (!budget) {
    return next(new AppError('No budget found with that ID', 404));
  }

  response.status(200).json({
    status: `Success`,
    data: {
      budget: budget,
    },
  });
});

exports.getBudgetDashboardInfo = catchAsync(async (request, response, next) => {
  // const user = await User.findById(request.user.id);
  let { user, budget } = await getCurrentInfo(request, response);

  if (!budget) {
    return next(new AppError('No budget found with that ID', 404));
  }

  request.budget = budget;
  request.budgetId = budget._id;

  console.log(request.budgetId);

  createAndSendToken(user, 200, `json`, request, response, `./Budget/budgetLanding`, `King Richard | ${budget.name}`, { budget: budget, calendar: Calendar }, 200, `Success`);
});

exports.getBudgetDashboard = catchAsync(async (request, response, next) => {
  // const user = await User.findById(request.user.id);
  let { user, budget } = await getCurrentInfo(request, response);

  if (!budget) {
    return next(new AppError('No budget found with that ID', 404));
  }

  request.budget = budget;
  request.budgetId = budget._id;

  console.log(request.budgetId);

  createAndSendToken(user, 200, `render`, request, response, `./Budget/budgetLanding`, `King Richard | ${budget.name}`, { budget: budget, calendar: Calendar }, 200, `Success`);
});

exports.getBudgetManagement = catchAsync(async (request, response, next) => {
  // const user = await User.findById(request.user.id);
  let { user, budget } = await getCurrentInfo(request, response);

  if (!budget) {
    return next(new AppError('No budget found with that ID', 404));
  }
  request.budget = budget;
  request.budgetId = budget._id;
  console.log(request.budgetId);
  createAndSendToken(user, 201, `render`, request, response, `./Budget/Budget-Management/Budget-Management`, `King Richard | ${budget.name}`, { budget: budget, calendar: Calendar }, 200, `Success`);
});

exports.getEditCategoryGoals = catchAsync(async (request, response, next) => {
  // const user = await User.findById(request.user.id);
  let { user, budget } = await getCurrentInfo(request, response);

  if (!budget) {
    return next(new AppError('No budget found with that ID', 404));
  }
  createAndSendToken(user, 201, `render`, request, response, `./Budget/Edit-Budget/Edit-Category-Goals`, `King Richard | ${budget.name}`, { budget: budget, calendar: Calendar }, 200, `Success`);
});

exports.getManageCategories = catchAsync(async (request, response, next) => {
  // const user = await User.findById(request.user.id);
  let { user, budget } = await getCurrentInfo(request, response);

  if (!budget) {
    return next(new AppError('No budget found with that ID', 404));
  }
  createAndSendToken(user, 201, `render`, request, response, `./Budget/Edit-Budget/Manage-Categories`, `King Richard | ${budget.name}`, { budget: budget, calendar: Calendar }, 200, `Success`);
});

exports.getAllocateIncome = catchAsync(async (request, response, next) => {
  // const user = await User.findById(request.user.id);
  let { user, budget } = await getCurrentInfo(request, response);

  if (!budget) {
    return next(new AppError('No budget found with that ID', 404));
  }
  createAndSendToken(user, 201, `render`, request, response, `./Budget/Income/Allocate-Income`, `King Richard | ${budget.name}`, { budget: budget, calendar: Calendar }, 200, `Success`);
});

exports.getTransactionPlanner = catchAsync(async (request, response, next) => {
  // const user = await User.findById(request.user.id);
  let { user, budget } = await getCurrentInfo(request, response);

  if (!budget) {
    return next(new AppError('No budget found with that ID', 404));
  }
  createAndSendToken(user, 201, `render`, request, response, `./Budget/Transactions/Transaction-Planner`, `King Richard | ${budget.name}`, { budget: budget, calendar: Calendar }, 200, `Success`);
});

exports.getInvestmentPlanner = catchAsync(async (request, response, next) => {
  // const user = await User.findById(request.user.id);
  let { user, budget } = await getCurrentInfo(request, response);

  if (!budget) {
    return next(new AppError('No budget found with that ID', 404));
  }
  createAndSendToken(user, 201, `render`, request, response, `./Budget/Transactions/Investment-Planner`, `King Richard | ${budget.name}`, { budget: budget, calendar: Calendar }, 200, `Success`);
});

exports.getDebtManager = catchAsync(async (request, response, next) => {
  // const user = await User.findById(request.user.id);
  let { user, budget } = await getCurrentInfo(request, response);

  if (!budget) {
    return next(new AppError('No budget found with that ID', 404));
  }
  createAndSendToken(user, 201, `render`, request, response, `./Budget/Transactions/Debt-Manager`, `King Richard | ${budget.name}`, { budget: budget, calendar: Calendar }, 200, `Success`);
});

exports.getRecentTransactions = catchAsync(async (request, response, next) => {
  // const user = await User.findById(request.user.id);
  let { user, budget } = await getCurrentInfo(request, response);

  if (!budget) {
    return next(new AppError('No budget found with that ID', 404));
  }
  createAndSendToken(user, 201, `render`, request, response, `./Budget/Transactions/Recent-Transactions`, `King Richard | ${budget.name}`, { budget: budget, calendar: Calendar }, 200, `Success`);
});

exports.getAccountManagement = catchAsync(async (request, response, next) => {
  // const user = await User.findById(request.user.id);
  let { user, budget } = await getCurrentInfo(request, response);

  if (!budget) {
    return next(new AppError('No budget found with that ID', 404));
  }
  createAndSendToken(user, 201, `render`, request, response, `./Budget/Account-Management/Account-Management`, `King Richard | ${budget.name}`, { budget: budget, calendar: Calendar }, 200, `Success`);
});

exports.getInviteUsers = catchAsync(async (request, response, next) => {
  // const user = await User.findById(request.user.id);
  let { user, budget } = await getCurrentInfo(request, response);

  if (!budget) {
    return next(new AppError('No budget found with that ID', 404));
  }
  createAndSendToken(user, 201, `render`, request, response, `./Budget/Invite-Users/Invite-Users`, `King Richard | ${budget.name}`, { budget: budget, calendar: Calendar }, 200, `Success`);
});

// exports.getBudgets = catchAsync(async (request, response, next) => {
//   // const user = await User.findById(request.user.id);
//   const user = request.user;
//   let budgetID = request.params.id;
//   if (!budgetID) budgetID = user.budgets[user.budgets.length - 1];
//   const budget = await Budget.findById(budgetID);

//   if (!budget) {
//     return next(new AppError('No budget found with that ID', 404));
//   }

//   createAndSendToken(
//     user,
//     201,
//     `render`,
//     request,
//     response,
//     `./Budget/budgetLanding`,
//     `King Richard | ${budget.name}`,
//     { budget: budget, calendar: Calendar },
//     200,
//     `Success`,
//   );
// });
