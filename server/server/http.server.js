// http.server.js, 2021, FG
// Creates an http server from the defined express server
// ------------------------------------------------------------------------

const app = require('./express.server');
const http = require('http').Server(app);
module.exports = http;