// gymnast.model.js, 2021, FG
// Creates Gymnast model from GymnastSchema
// ------------------------------------------------------------------------

const mongoose = require('mongoose');
const GymnastSchema = require('./gymnast.schema');

// Create Gymnast model from GymnastSchema
module.exports = mongoose.model('Gymnast', GymnastSchema);