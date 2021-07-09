// draft.model.js, 2021, FG
// Creates Draft model from DraftSchema
// ------------------------------------------------------------------------

const mongoose = require('mongoose');
const DraftSchema = require('./draft.schema');

// Create Gymnast model from GymnastSchema
module.exports = mongoose.model('Draft', DraftSchema);