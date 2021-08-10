// league.controller.js, 2021, FG
// Defines routes to handle league related requests
// ------------------------------------------------------------------------

const express = require('express');
const ev = require('express-validator');
const League = require('../models/league.model');
const Team = require('../models/team.model');
const Draft = require('../models/draft.model');
const passport = require('passport');
const constants = require('../misc/constants');
const LeagueCreationValidator = require('../models/league.validator');
const sendMessageToUser = require('../server/socket.server');

const LeagueController = express.Router();

/**
 * Handle a request to create a league
 * Expects a request body with the following JSON:
 * {
 *   name: `some string that will be the league's name`
 *   public: `a boolean representing whether the league is publicly available to join`
 *   rosterSize: `a number representing the number of gymnasts allowed on each team`
 *   eventLineupSize: `a number representing the number of gymnasts to be put on each event`
 *   eventCountSize: `a number representing the number of gymnast scores to count on each event`
 * }
 * Returns created league or
 * returns FORM_ERRORS and the errors if there are form errors or
 * returns LEAGUE_ALREADY_EXISTS if league already exists
 */
function createLeagueHandler(req, res) {
    // Validate create league form
    const errorsAfterValidation = ev.validationResult(req);
    // If there are form errors, return them to the user
    if (!errorsAfterValidation.isEmpty()) {
        return res.status(200).json({
            message: constants.FORM_ERRORS,
            errors: errorsAfterValidation.mapped()
        });
    }

    // If there are no form errors, create a new league if it doesn't already exist
    League.findOne({
        owner: req.user.email,
        name: req.body.name
    }).then(foundLeague => {
        if (foundLeague) {
            return res.status(200).json({
                message: constants.LEAGUE_ALREADY_EXISTS
            });
        }
        // Create team for the user
        const team = new Team({
            owner: req.user.email,
            name: req.user.email + "'s team"
        });
        // Create draft for the league
        const draft = new Draft({
            pickTimeLimit: 100000,
        });
        // Create league
        const league = new League({
            owner: req.user.email,
            name: req.body.name,
            teams: [team],
            rosterSize: req.body.rosterSize,
            eventLineupSize: req.body.eventLineupSize,
            eventCountSize: req.body.eventCountSize,
            invited: [],
            requested: [],
            public: req.body.public,
            draft: draft
        });
        // Save the league
        league.save();
        // Return the league to the user
        return res.status(200).json(league);
    }).catch(err => {
        console.error(err);
        return res.status(200).json({
            message: constants.SOMETHING_WENT_WRONG
        });
    });
}
// Define '/createLeague' route and use authentication and league validation with handler above
LeagueController.post('/createLeague', passport.authenticate('jwt', {session:false}), LeagueCreationValidator, createLeagueHandler);

/**
 * Handle a request to delete a league, user must be league owner
 * Expects a request body with the following JSON:
 * {
 *   leagueDocumentID: `some string that is the league document ID`
 * }
 * Returns LEAGUE_SUCCESSFULLY_DELETED if the league was deleted and PERMISSION_DENIED if the user is not the owner
 */
function deleteLeagueHandler(req, res) {
    // Find the league to delete
    League.findById(req.body.leagueDocumentID).then(league => {
        // If the request sender is the league owner, delete the league
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
// Define '/deleteLeague' route and use authentication with handler above
LeagueController.post('/deleteLeague', passport.authenticate('jwt', {session: false}), deleteLeagueHandler);

/**
 * Handle a request to get the leagues a user is in
 * Returns all leagues the user has a team in or NO_LEAGUES_FOUND if there are none
 */
function userLeaguesHandler(req, res) {
    // Find all leagues the authenticated user is in
    League.find({
        "teams.owner": req.user.email
    }).then(result => {
        // If no leagues are found, return NO_LEAGUES_FOUND message
        if (!result) {
            return res.status(200).json({
                message: constants.NO_LEAGUES_FOUND
            });
        }

        // Return the leagues to the user
        return res.status(200).json(result);
    }).catch(err => {
        console.error(err);
        return res.status(200).json({
            message: constants.SOMETHING_WENT_WRONG
        });
    });
}
// Define '/userLeagues' route and use authentication with handler above
LeagueController.get('/userLeagues', passport.authenticate('jwt', {session:false}), userLeaguesHandler);

/**
 * Handle a request to leagues publicly available to join
 * Returns all publicly available leagues or NO_LEAGUES_FOUND message if there are none
 */
function publicLeaguesHandler(req, res) {
    // Find all public leagues
    League.find({
        public: true
    }).then(result => {
        // If no leagues are found, return NO_LEAGUES_FOUND message
        if (!result) {
            return res.status(200).json({
                message: constants.NO_LEAGUES_FOUND
            });
        }

        // Return the leagues
        return res.status(200).json(result);
    }).catch(err => {
        console.error(err);
        return res.status(200).json({
            message: constants.SOMETHING_WENT_WRONG
        });
    });
}
// Define '/publicLeagues' route and use authentication with handler above
LeagueController.get('/publicLeagues', passport.authenticate('jwt', {session:false}), publicLeaguesHandler);

/**
 * Handle a request to get information about a league
 * Expects a request body with the following JSON:
 * {
 *   leagueDocumentID: `some string that is the league document ID`
 * }
 * Returns a league object to the user or NO_LEAGUE_FOUND if the league does not exist
 */
function leagueHandler(req, res) {
    // Find the league
    League.findById(req.body.leagueDocumentID).then(league => {
        // If the league does not exist, return NO_LEAGUE_FOUND message
        if (!league) {
            return res.status(200).json({
                message: constants.NO_LEAGUE_FOUND
            });
        }
        // Return the league to the user
        return res.status(200).json(league);
    }).catch(err => {
        console.error(err);
        return res.status(200).json({
            message: constants.SOMETHING_WENT_WRONG
        });
    });
}
// Define '/league' route and use authentication with handler above
LeagueController.post('/league', passport.authenticate('jwt', {session: false}), leagueHandler);

/**
 * Handle a request to request to join a league
 * Expects a request body with the following JSON:
 * {
 *   leagueDocumentID: `some string that is the league document ID`
 * }
 * Sends a request to the league owner to add the user to the league and returns REQUEST_SUCCESSFULY_SENT or
 * returns NO_LEAGUE_FOUND if the league does not exist or
 * returns LEAGUE_NOT_PUBLIC if the league is not public or
 * returns ALREADY_IN_LEAGUE if the user is already in the league or
 * returns REQUEST_ALREADY_SENT if the user has already requested to join the league
 */
function requestToJoinLeagueHandler(req, res) {
    League.findById(req.body.leagueDocumentID).then(league => {
        // If the league does not exist, return NO_LEAGUE_FOUND message
        if (!league) {
            return res.status(200).json({
                message: constants.NO_LEAGUE_FOUND
            });
        }
        // If the user is already in the league, return PERMISSION_DENIED message
        if (!league.public) {
            return res.status(200).json({
                message: constants.LEAGUE_NOT_PUBLIC
            });
        }

        // If the user is already in the league, return USER_ALREADY_IN_LEAGUE message
        if(league.hasTeamWithOwner(req.user.email)) {
            return res.status(200).json({
                message: constants.USER_ALREADY_IN_LEAGUE
            });
        }

        // If the user has already requested to join the league, return REQUEST_ALREADY_SENT message
        if (league.requested.includes(req.user.email)) {
            return res.status(200).json({
                message: constants.REQUEST_ALREADY_SENT
            });
        }

        // Add user to league's requested list
        league.requested.push(req.user.email);
        league.save();
        // Send a request to the league owner to add the user to the league
        sendMessageToUser(league.owner, 'leagueRequest', {user: req.user.email, leagueName: league.name, leagueID: league._id});
    
        return res.status(200).json({
            message: constants.REQUEST_SUCCESSFULLY_SENT
        });

    }).catch(err => {
        console.error(err);
        return res.status(200).json({
            message: constants.SOMETHING_WENT_WRONG
        });
    });
}
// Define '/requestToJoin' route and use authentication with handler above
LeagueController.post('/requestToJoin', passport.authenticate('jwt', {session: false}), requestToJoinLeagueHandler);

/**
 * Handle a request to accept a request to join a league
 * Expects a request body with the following JSON:
 * {
 *   leagueDocumentID: `some string that is the league document ID`
 *   email: `some string that is the email of the user to accept into the league`
 * }
 * Sends a message to the requested user they've been accepted returns REQUEST_ACCEPTED or
 * returns NO_LEAGUE_FOUND if the league does not exist or
 * returns PERMISSION_DENIED if the user is not the league owner or
 * returns REQUEST_NOT_FOUND if the requested user has not requested to join the league
 */
function acceptRequestToJoinLeagueHandler(req, res) {
    League.findById(req.body.leagueDocumentID).then(league => {
        // If the league does not exist, return NO_LEAGUE_FOUND message
        if (!league) {
            return res.status(200).json({
                message: constants.NO_LEAGUE_FOUND
            });
        }
        // If the user is not the league owner, return PERMISSION_DENIED message
        if (!league.owner == req.user.email) {
            return res.status(200).json({
                message: constants.PERMISSION_DENIED
            });
        }

        // If the requested user has requested to join the league
        if (league.requested.includes(req.body.email)) {
            // Create a team for the requested user
            const team = new Team({
                owner: req.body.email,
                name: req.body.email + "'s team"
            });
            league.teams.push(team);
            // Remove the requested user from the requested list
            league.requested.splice(league.requested.indexOf(req.body.email), 1);
            league.save();

            sendMessageToUser(req.body.email, 'leagueAccepted', {leagueName: league.name, leagueID: league._id});
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
            message: constants.SOMETHING_WENT_WRONG
        });
    });
}
// Define '/acceptRequestToJoin' route and use authentication with handler above
LeagueController.post('/acceptRequestToJoin', passport.authenticate('jwt', {session: false}), acceptRequestToJoinLeagueHandler);

/**
 * Handle a request to decline a request to join a league
 * Expects a request body with the following JSON:
 * {
 *   leagueDocumentID: `some string that is the league document ID`
 *   email: `some string that is the email of the user to reject from the league`
 * }
 * Sends a message to the requested user they've been rejected and returns REQUEST_SUCESSFULLY_REJECTED or
 * returns NO_LEAGUE_FOUND if the league does not exist or
 * returns PERMISSION_DENIED if the user is not the league owner or
 * returns REQUEST_NOT_FOUND if the requested user has not requested to join the league
 */
function rejectRequestToJoinLeagueHandler(req, res) {
    League.findById(req.body.leagueDocumentID).then(league => {
        // If the league does not exist, return NO_LEAGUE_FOUND message
        if (!league) {
            return res.status(200).json({
                message: constants.NO_LEAGUE_FOUND
            });
        }
        // If the user is not the league owner, return PERMISSION_DENIED message
        if (!league.owner == req.user.email) {
            return res.status(200).json({
                message: constants.PERMISSION_DENIED
            });
        }

        if(!league.requested.includes(req.body.email)) {
            return res.status(200).json({
                message: constants.REQUEST_NOT_FOUND
            });
        }

        // Remove the requested user from the requested list
        league.requested.splice(league.requested.indexOf(req.body.email), 1);
        league.save();
        sendMessageToUser(req.body.email, 'leagueRejected', {leagueName: league.name, leagueID: league._id});
        return res.status(200).json({
            message: constants.REQUEST_SUCESSFULLY_REJECTED
        });
    }).catch(err => {
        console.error(err);
        return res.status(200).json({
            message: constants.SOMETHING_WENT_WRONG
        });
    });
}
// Define '/rejectRequestToJoin' route and use authentication with handler above
LeagueController.post('/rejectRequestToJoin', passport.authenticate('jwt', {session: false}), rejectRequestToJoinLeagueHandler);

/**
 * Handle a request to accept an invitation to join a league
 * Expects a request body with the following JSON:
 * {
 *   leagueDocumentID: `some string that is the league document ID`
 * }
 * Returns newly created team or
 * returns NO_LEAGUE_FOUND if the league does not exist or
 * returns NOT_INVITED if the user has not been invited to the league or
 * returns ALREADY_IN_LEAGUE if the user is already in the league
 */
function acceptLeagueInvitationHandler(req, res) {
    League.findById(req.body.leagueDocumentID).then(league => {
        // If the league does not exist, return NO_LEAGUE_FOUND message
        if (!league) {
            return res.status(200).json({
                message: constants.NO_LEAGUE_FOUND
            });
        }

        // If the user has not been invited to the league, return NOT_INVITED message
        if (!league.invited.includes(req.user.email)) {
            return res.status(200).json({
                message: constants.NOT_INVITED
            });
        }

        // If the user is already in the league, return ALREADY_IN_LEAGUE message
        if(league.hasTeamWithOwner(req.user.email)) {
            return res.status(200).json({
                message: constants.ALREADY_IN_LEAGUE
            });
        }

        // Create a team for the user
        const team = new Team({
            owner: req.user.email,
            name: req.user.email + "'s team"
        });
        league.teams.push(team);
        // Remove the user from the invited list
        league.invited.splice(league.invited.indexOf(req.user.email), 1);
        league.save();
        return res.status(200).json({team});

    }).catch(err => {
        console.error(err);
        return res.status(200).json({
            message: constants.SOMETHING_WENT_WRONG
        });
    });
}
// Define '/acceptLeagueInvitation' route and use authentication with handler above
LeagueController.post('/acceptLeagueInvitation', passport.authenticate('jwt', {session: false}), acceptLeagueInvitationHandler);

/**
 * Handle a request to send an invitation to join a league
 * Expects a request body with the following JSON:
 * {
 *   leagueDocumentID: `some string that is the league document ID`
 *   email: `some string that is the email of the user to invite to the league`
 * }
 * Returns INVITE_SUCCESSFULLY_SENT or
 * returns NO_LEAGUE_FOUND if the league does not exist or
 * returns PERMISSION_DENIED if the user is not the league owner or
 * returns ALREADY_INVITED if the invited user has already been invited to the league
 * returns ALREADY_IN_LEAGUE if the invited user is already in the league
 */
function inviteToLeagueHandler(req, res) {
    League.findById(req.body.leagueDocumentID).then(league => {
        // If the league does not exist, return NO_LEAGUE_FOUND message
        if (!league) {
            return res.status(200).json({
                message: constants.NO_LEAGUE_FOUND
            });
        }

        // If the user is not the league owner, return PERMISSION_DENIED message
        if(league.owner != req.user.email) {
            return res.status(200).json({
                message: constants.PERMISSION_DENIED
            });
        }

        // If the invited user has already been invited, return ALREADY_INVITED message
        if(league.invited.includes(req.body.emailToInvite)) {
            return res.status(200).json({
                message: constants.ALREADY_INVITED
            });
        } 

        // If the invited user is already in the league, return ALREADY_IN_LEAGUE message
        if(league.hasTeamWithOwner(req.body.emailToInvite)) {
            return res.status(200).json({
                message: constants.ALREADY_IN_LEAGUE
            });
        }

        // Add the invited user to the invited list
        league.invited.push(req.body.emailToInvite);
        league.save();
        // TODO: Send an email/notification to the invited user
        return res.status(200).json({
            message: constants.INVITE_SUCCESSFULLY_SENT
        });
    }).catch(err => {
        console.error(err);
        return res.status(200).json({
            message: constants.SOMETHING_WENT_WRONG
        });
    });
}
// Define '/inviteToLeague' route and use authentication with handler above
LeagueController.post('/inviteToLeague', passport.authenticate('jwt', {session: false}), inviteToLeagueHandler);

module.exports = LeagueController;