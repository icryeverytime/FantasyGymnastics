// team.controller.js, 2021, FG
// Defines routes to handle team related requests
// ------------------------------------------------------------------------

const express = require('express');
const ev = require('express-validator');
const Team = require('../models/team.model');
const passport = require('passport');

const TeamController = express.Router();

module.exports = TeamController;