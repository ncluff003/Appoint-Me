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
const authController = require(`./../Controllers/authController`);
const apiController = require('./../Controllers/apiController');

////////////////////////////////////////////
//  Routing Middleware
// router.route(`/countries?page[number]=:page`).get(apiController.getAPIInformation);
router.route(`/Data`).post(apiController.getAPIInformation);
router.route(`/Translation`).post(apiController.getTranslation);

// console.log(Storage);

////////////////////////////////////////////
//  My Modules

////////////////////////////////////////////
//  Exported Router
module.exports = router;
