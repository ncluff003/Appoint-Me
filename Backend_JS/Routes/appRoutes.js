////////////////////////////////////////////
//  Core Modules

////////////////////////////////////////////
//  Third Party Modules
const express = require('express');

////////////////////////////////////////////
//  Third Party Module Instances

////////////////////////////////////////////
//  Third Party Middleware
const router = express.Router();

////////////////////////////////////////////
//  Third Party Config Files

////////////////////////////////////////////
//  My Middleware
const appController = require(`./../Controllers/appController`);
const userController = require(`./../Controllers/userController`);
const authController = require(`./../Controllers/authController`);
const APIRouter = require('./apiRoutes');
const userRouter = require('./userRoutes');

////////////////////////////////////////////
//  Routing Middleware
router.route(`/`).get(appController.renderApp).post(authController.login);
router.route(`/Info`).get(appController.getInfo);
router.route(`/Appointment`).post(appController.askForAppointment);
router.route(`/Appointments`).post(appController.getInfo);
router.route('/User').post(userController.searchForUser);
router.use(`/Users`, userRouter);
router.use('/API', APIRouter);
// console.log(Storage);

////////////////////////////////////////////
//  My Modules

////////////////////////////////////////////
//  Exported Router
module.exports = router;
