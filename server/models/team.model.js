const mongoose = require('mongoose');
const TeamSchema = require('./team.schema');

module.exports = mongoose.model('Team', TeamSchema);