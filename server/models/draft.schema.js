const Schema = require('mongoose').Schema;

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
        type: Number,
        default: 0
    },
    draftOrder: [Number]
});

DraftSchema.methods.randomizeDraftOrder = function() {
    const draftOrder = this.draftOrder;
    draftOrder.sort(() => Math.random() - 0.5);
    this.draftOrder = draftOrder;
    this.save();
};

DraftSchema.methods.startDraft = function() {
    this.started = true;
    this.save();
};



module.exports = DraftSchema;