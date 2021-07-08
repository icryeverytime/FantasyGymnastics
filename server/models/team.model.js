// team.model.js, 2021, FG
// Creates Team model from TeamSchema
// ------------------------------------------------------------------------

const mongoose = require('mongoose');
const TeamSchema = require('./team.schema');

// Create Team model from TeamSchema
module.exports = mongoose.model('Team', TeamSchema);