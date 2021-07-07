const Schema = require('mongoose').Schema;
const TeamSchema = require('./team.schema');
const constants = require('../constant');

const LeagueSchema = new Schema({
    owner: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    teams: [TeamSchema],
    rosterSize: {
        type: Number,
        min: constants.MIN_ROSTER_SIZE,
        max: constants.MAX_ROSTER_SIZE,
        required: true,
    },
    eventLineupSize: {
        type: Number,
        min: constants.MIN_EVENT_LINEUP_SIZE,
        max: constants.MAX_EVENT_LINEUP_SIZE,
        required: true,
    },
    eventCountSize: {
        type: Number,
        min: constants.MIN_EVENT_COUNT_SIZE,
        max: constants.MAX_EVENT_COUNT_SIZE,
        required: true,
    },
    invited: [String],
    requested: [String],
    public: {
        type: Boolean,
        default: false
    },
});

// This method checks the teams array for a team with a matching owner.
LeagueSchema.methods.hasTeamWithOwner = function(owner) {
    for (let i = 0; i < this.teams.length; i++) {
        if (this.teams[i].owner === owner) {
            return true;
        }
    }
    return false;
};


LeagueSchema.index({ owner: 1, name: 1 }, { unique: true });

module.exports = LeagueSchema;