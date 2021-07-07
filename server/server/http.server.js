const app = require('./express.server');
const http = require('http').Server(app);
module.exports = http;