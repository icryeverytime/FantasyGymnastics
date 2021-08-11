// team.schema.js, 2021, FG
// Defines Team schema and related methods
// ------------------------------------------------------------------------

const Schema = require('mongoose').Schema;

/**
 * owner: the email of the user who owns the team
 * name: the name of the team
 * gymnastIDs: the document IDs of the gymnasts who are on the team
 */
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
    gymnastIDs: [String]
});

TeamSchema.methods.isTeamFull = function() {
    return this.gymnastIDs.length >= this.parent().rosterSize;
}

module.exports = TeamSchema;