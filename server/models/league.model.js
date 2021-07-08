// league.model.js, 2021, FG
// Creates League model from LeagueSchema
// ------------------------------------------------------------------------

const mongoose = require('mongoose');
const LeagueSchema = require('./league.schema');

// Create League model from LeagueSchema
module.exports = mongoose.model('League', LeagueSchema);