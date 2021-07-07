const mongoose = require('mongoose');
const GymnastSchema = require('./gymnast.schema');

module.exports = mongoose.model('Gymnast', GymnastSchema);