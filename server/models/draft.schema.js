// draft.schema.js, 2021, FG
// Defines Draft schema and related methods
// ------------------------------------------------------------------------

const Schema = require('mongoose').Schema;

/**
 * pickTimeLimit: the amount of time in ms a user has to draft before being skipped
 * started: whether the draft has started or  not
 * currentTurn: whose turn it is to draft
 * draftOrder: the order of the players in the draft where each player is their user document ID
 */
const DraftSchema = new Schema({
    pickTimeLimit: {
        type: Number,
        required: true
    },
    started: {
        type: Boolean,
        default: false
    },
    currentTurn: {
        type: String,
    },
    draftOrder: [String]
});

// Randomly sort the draftOrder array
DraftSchema.methods.randomizeDraftOrder = function() {
    const draftOrder = this.draftOrder;
    draftOrder.sort(() => Math.random() - 0.5);
    this.draftOrder = draftOrder;
    this.save();
};

// Start the draft
DraftSchema.methods.startDraft = function() {
    this.started = true;
    this.save();
};

module.exports = DraftSchema;