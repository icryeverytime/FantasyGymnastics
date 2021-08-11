// draft.controller.js, 2021, FG
// Defines routes to handle draft related requests
// ------------------------------------------------------------------------

const express = require('express');
const passport = require('passport');
const constants = require('../misc/constants');
const League = require('../models/league.model');
const Gymnast = require('../models/gymnast.model');
const draftWorkspaces = require('./draft.socket.controller');

const DraftController = express.Router();

/**
 * Handle a request to start a draft
 * Expects a request body with the following JSON:
 * {
 *   leagueDocumentID: `some string that is the league's document ID`
 * }
 * Starts draft or
 * returns NO_LEAGUE_FOUND if league with id not found
 * returns PERMISSION_DENIED if user is not league owner or
 * returns DRAFT_ALREADY_STARTED if draft has already started
 */
function startDraftHandler(req, res) {
    League.findOne({ _id: req.body.leagueDocumentID }).then(league => {
        if(!league) {
            return res.status(200).json({
                message: constants.NO_LEAGUE_FOUND
            });
        }

        if(league.owner !== req.user.email) {
            return res.status(200).json({
                message: constants.PERMISSION_DENIED
            });
        }

        if(league.draft.started) {
            return res.status(200).json({
                message: constants.DRAFT_ALREADY_STARTED
            });
        }

        league.startDraft();

        return res.status(200).json({league: league});
    }).catch(err => {
        console.error(err);
        return res.status(200).json({
            message: constants.SOMETHING_WENT_WRONG
        });
    });
}
// Define '/startDraft' route and use authentication with handler above
DraftController.post('/startDraft/', passport.authenticate('jwt', {session: false}), startDraftHandler);

function draftGymnastHandler(req, res) {
    League.findOne({ _id: req.body.leagueDocumentID }).then(league => {
        if(!league) {
            return res.status(200).json({
                message: constants.NO_LEAGUE_FOUND
            });
        }

        if(!league.hasTeamWithOwner(req.user.email)) {
            return res.status(200).json({
                message: constants.PERMISSION_DENIED
            });
        }

        if(!league.draft.started) {
            return res.status(200).json({
                message: constants.DRAFT_NOT_STARTED
            });
        }

        if(league.draft.finished) {
            return res.status(200).json({
                message: constants.DRAFT_FINISHED
            });
        }

        if (!league.draft.isCurrentTurn(req.user.email)) {
            return res.status(200).json({
                message: constants.NOT_YOUR_TURN
            });
        }

        if (league.draft.isGymnastDrafted(req.body.gymnastDocumentID)) {
            return res.status(200).json({
                message: constants.GYMNAST_ALREADY_DRAFTED
            });
        }

        if (league.getTeamByOwner(req.user.email).isTeamFull()) {
            return res.status(200).json({
                message: constants.TEAM_FULL
            });
        }

        let draftComplete = league.draftGymnast(league.getTeamByOwner(req.user.email), req.body.gymnastDocumentID);
        Gymnast.findOne({ _id: req.body.gymnastDocumentID }).then(gymnast => {
            draftWorkspaces.emit('draftEvent', {
                type: 2, // GYMNAST_DRAFTED event
                data: {
                    gymnastID: req.body.gymnastDocumentID,
                    name: gymnast.name
                }
            });
        });

        if (draftComplete) {
            draftWorkspaces.emit('draftEvent', {
                type: 3, // DRAFT_COMPLETE event
            });
        }

        return res.status(200).json(league.getTeamByOwner(req.user.email));
    }).catch(err => {
        console.error(err);
        return res.status(200).json({
            message: constants.SOMETHING_WENT_WRONG
        });
    });
}
DraftController.post('/draftGymnast/', passport.authenticate('jwt', {session: false}), draftGymnastHandler);

module.exports = DraftController;