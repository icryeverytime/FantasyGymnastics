const Schema = require('mongoose').Schema;

const TeamSchema = new Schema({
    owner: {
        type: String,
        required: true,
        unique: false
    },
    name: {
        type: String,
        required: true,
        unique: false
    },
    gymnastIDs: [Number]
});

module.exports = TeamSchema;