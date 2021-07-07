const mongoose = require('mongoose');
const LeagueSchema = require('./league.schema');

module.exports = mongoose.model('League', LeagueSchema);