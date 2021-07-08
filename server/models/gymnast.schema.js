// gymnast.schema.js, 2021, FG
// Defines Gymnast schema and related methods
// ------------------------------------------------------------------------

const Schema = require('mongoose').Schema;

/**
 * name: gymnast's full name
 * team: gymnast's full team name
 * year: FR, SO, JR, SR
 * rtnID: their RoadToNationals ID
 */
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