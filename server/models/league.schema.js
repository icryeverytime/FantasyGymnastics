// league.schema.js, 2021, FG
// Defines League schema and related methods
// ------------------------------------------------------------------------

const Schema = require('mongoose').Schema;
const TeamSchema = require('./team.schema');
const DraftSchema = require('./draft.schema');
const constants = require('../misc/constants');

/**
 * owner: the email of the owner of the league
 * name: the name of the league
 * teams: an array of Team objects that are in the league
 * rosterSize: the number of gymnasts allowed on each team in the league
 * eventLineupSize: the number of gymnasts allowed on each event
 * eventCountSize: the number of gymnasts' scores to count on each event
 * invited: an array of emails of the users that have been invited to the league
 * requested: an array of emails of the users that have requested to join the league
 * public: a boolean that determines if the league is public or private
 */
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
    draft: DraftSchema,
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

// Checks the teams array for a team with a matching owner
LeagueSchema.methods.hasTeamWithOwner = function(owner) {
    for (let i = 0; i < this.teams.length; i++) {
        if (this.teams[i].owner === owner) {
            return true;
        }
    }
    return false;
};

// Start the draft, create the draft order, and send a message to all users in the league
LeagueSchema.methods.startDraft = function() {
    const draftOrder = this.draft.draftOrder;
    this.teams.forEach(team => {
        draftOrder.push(team._id);
    });
    draftOrder.sort(() => Math.random() - 0.5);
    this.draft.draftOrder = draftOrder;
    this.draft.currentTurn = draftOrder[0];
    this.draft.started = true;

    this.save();
};

LeagueSchema.methods.draftGymnast = function(team, gymnastID) {
    console.log('Drafting', gymnastID, 'to', team._id);
    team.gymnastIDs.push(gymnastID);
    this.draft.draftedGymnasts.push(gymnastID);
    this.draft.currentTurn = this.draft.draftOrder[(this.draft.draftOrder.indexOf(team._id) + 1) % this.draft.draftOrder.length];
    
    if (this.draft.draftedGymnasts.length == this.rosterSize * this.teams.length) {
        this.draft.finished = true;
    }

    this.save();
    
    return this.draft.finished;
}

LeagueSchema.methods.getTeamByOwner = function(owner) {
    return this.teams.filter(team => team.owner === owner)[0];
};

// Defines a League to be unique by owner and name
LeagueSchema.index({ owner: 1, name: 1 }, { unique: true });

module.exports = LeagueSchema;