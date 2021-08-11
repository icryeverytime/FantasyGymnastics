// socket.server.js, 2021, FG
// Defines the socket.io server
// ------------------------------------------------------------------------

const constants = require('../misc/constants');
const jwt = require('jsonwebtoken');
const config = require('../misc/config');
const http = require('./http.server');
const League = require('../models/league.model');

// Define socket.io server
const io = require('socket.io')(http, {
    cors: {
        origins: ['http://localhost:4200']
    }
});

module.exports = io;