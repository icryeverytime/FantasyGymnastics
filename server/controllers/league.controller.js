const express = require('express');
const ev = require('express-validator');
const League = require('../models/league.model');
const Team = require('../models/team.model');
const passport = require('passport');
const constants = require('../constant');
const leagueValidation = require('../models/league.validator');
const sendMessageToUser = require('../server/socket.server');

const leagueController = express.Router();

function createLeagueHandler(req, res) {
    const errorsAfterValidation = ev.validationResult(req);
    if (!errorsAfterValidation.isEmpty()) {
        return res.status(200).json({
            message: constants.FORM_ERRORS,
            errors: errorsAfterValidation.mapped()
        });
    }
    League.findOne({
        owner: req.user.email,
        name: req.body.name
    }).then(foundLeague => {
        if (foundLeague) {
            return res.status(200).json({
                message: constants.LEAGUE_ALREADY_EXISTS
            });
        }
        const team = new Team({
            owner: req.user.email,
            name: req.user.email + "'s team"
        });
        const league = new League({
            owner: req.user.email,
            name: req.body.name,
            teams: [team],
            rosterSize: req.body.rosterSize,
            eventLineupSize: req.body.eventLineupSize,
            eventCountSize: req.body.eventCountSize,
            invited: [],
            requested: [],
            public: req.body.public
        });
        league.save();
        return res.status(200).json(league);
    }).catch(err => {
        console.error(err);
        return res.status(200).json({
            message: constants.SOME_THING_WENT_WRONG
        });
    });
}
leagueController.post('/createLeague', passport.authenticate('jwt', {session:false}), leagueValidation, createLeagueHandler);

function deleteLeagueHandler(req, res) {
    League.findById(req.body.leagueDocumentID).then(league => {
        if(req.user.email == league.owner) {
            league.remove();
            return res.status(200).json({
                message: constants.LEAGUE_SUCCESSFULLY_DELETED
            });
        } else {
            return res.status(200).json({
                message: constants.PERMISSION_DENIED
            });
        }
    }).catch(err => {
        console.error(err);
    });
}
leagueController.post('/deleteLeague', passport.authenticate('jwt', {session: false}), deleteLeagueHandler);

function userLeaguesHandler(req, res) {
    League.find({
        "teams.owner": req.user.email
    }).then(result => {
        if (!result) {
            return res.status(200).json({
                message: constants.NO_LEAGUES_FOUND
            });
        }
        return res.status(200).json(result);
    }).catch(err => {
        console.error(err);
        return res.status(200).json({
            message: constants.SOME_THING_WENT_WRONG
        });
    });
}
leagueController.get('/userLeagues', passport.authenticate('jwt', {session:false}), userLeaguesHandler);

function publicLeaguesHandler(req, res) {
    League.find({
        public: true
    }).then(result => {
        if (!result) {
            return res.status(200).json({
                message: constants.NO_LEAGUES_FOUND
            });
        }
        return res.status(200).json(result);
    }).catch(err => {
        console.error(err);
        return res.status(200).json({
            message: constants.SOME_THING_WENT_WRONG
        });
    });
}
leagueController.get('/publicLeagues', passport.authenticate('jwt', {session:false}), publicLeaguesHandler);

function leagueHandler(req, res) {
    League.findById(req.body.leagueDocumentID).then(league => {
        if (!league) {
            return res.status(200).json({
                message: constants.NO_LEAGUE_FOUND
            });
        }
        return res.status(200).json(league);
    }).catch(err => {
        console.error(err);
        return res.status(200).json({
            message: constants.SOME_THING_WENT_WRONG
        });
    });
}
leagueController.post('/league', passport.authenticate('jwt', {session: false}), leagueHandler);

function requestToJoinLeagueHandler(req, res) {
    League.findById(req.body.leagueDocumentID).then(league => {
        if (!league) {
            return res.status(200).json({
                message: constants.NO_LEAGUE_FOUND
            });
        }

        if (!league.public) {
            return res.status(200).json({
                message: constants.LEAGUE_NOT_PUBLIC
            });
        }

        if (!league.requested.includes(req.user.email)) {
            league.requested.push(req.user.email);
            league.save();
            // notify league owner that a user has requested to join the league
            sendMessageToUser('leagueRequest', league.owner, {user: req.user.email, leagueName: league.name, leagueID: league._id});
            return res.status(200).json({
                message: constants.REQUEST_SUCCESSFULLY_SENT
            });
        } else {
            return res.status(200).json({
                message: constants.REQUEST_ALREADY_SENT
            });
        }
    }).catch(err => {
        console.error(err);
        return res.status(200).json({
            message: constants.SOME_THING_WENT_WRONG
        });
    });
}
leagueController.post('/requestToJoin', passport.authenticate('jwt', {session: false}), requestToJoinLeagueHandler);

function acceptRequestToJoinLeagueHandler(req, res) {
    League.findById(req.body.leagueDocumentID).then(league => {
        if (!league) {
            return res.status(200).json({
                message: constants.NO_LEAGUE_FOUND
            });
        }

        if (!league.owner == req.user.email) {
            return res.status(200).json({
                message: constants.PERMISSION_DENIED
            });
        }

        if (league.requested.includes(req.body.email)) {
            const team = new Team({
                owner: req.body.email,
                name: req.body.email + "'s team"
            });
            league.teams.push(team);
            league.requested.splice(league.requested.indexOf(req.body.email), 1);
            league.save();
            return res.status(200).json({
                message: constants.REQUEST_ACCEPTED
            });
        } else {
            return res.status(200).json({
                message: constants.REQUEST_NOT_FOUND
            });
        }
    }).catch(err => {
        console.error(err);
        return res.status(200).json({
            message: constants.SOME_THING_WENT_WRONG
        });
    });
}
leagueController.post('/acceptRequestToJoin', passport.authenticate('jwt', {session: false}), acceptRequestToJoinLeagueHandler);

function joinLeagueHandler(req, res) {
    League.findById(req.body.leagueDocumentID).then(league => {
        if(league.invited.includes(req.user.email) && !league.hasTeamWithOwner(req.user.email)) {
            const team = new Team({
                owner: req.user.email,
                name: req.user.email + "'s team"
            });
            league.teams.push(team);
            league.save();
            return res.status(200).json({team});
        } else if(!league.invited.includes(req.user.email)) {
            return res.status(200).json({
                message: constants.NOT_INVITED
            });
        } else {
            return res.status(200).json({
                message: constants.ALREADY_IN_LEAGUE
            });
        }
    }).catch(err => {
        console.error(err);
        return res.status(200).json({
            message: constants.SOME_THING_WENT_WRONG
        });
    });
}
leagueController.post('/joinLeague', passport.authenticate('jwt', {session: false}), joinLeagueHandler);

function inviteToLeagueHandler(req, res) {
    League.findById(req.body.leagueDocumentID).then(league => {
        if(league.owner != req.user.email) {
            return res.status(200).json({
                message: constants.PERMISSION_DENIED
            });
        }

        if(league.invited.includes(req.body.emailToInvite)) {
            return res.status(200).json({
                message: constants.ALREADY_INVITED
            });
        } 
        league.invited.push(req.body.emailToInvite);
        league.save();
        return res.status(200).json({
            message: constants.INVITE_SUCCESSFULLY_SENT
        });
    }).catch(err => {
        console.error(err);
        return res.status(200).json({
            message: constants.SOME_THING_WENT_WRONG
        });
    });
}
leagueController.post('/inviteToLeague', passport.authenticate('jwt', {session: false}), inviteToLeagueHandler);

module.exports = leagueController;