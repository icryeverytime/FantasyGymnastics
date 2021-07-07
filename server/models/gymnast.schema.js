const Schema = require('mongoose').Schema;

const GymnastSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    team: {
        type: String,
        required: true
    },
    year: {
        type: String,
        required: true
    },
    rtnID: {
        type: String,
        required: true
    },
});

module.exports = GymnastSchema;