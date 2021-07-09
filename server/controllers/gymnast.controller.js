// gymnast.controller.js, 2021, FG
// Defines routes to handle gymnast related requests
// ------------------------------------------------------------------------

const express = require('express');
const passport = require('passport');
const constants = require('../misc/constants');
const Gymnast = require('../models/gymnast.model');

const GymnastController = express.Router();

/**
 * Handle a request to get a gymnast
 * Expects a request body with the following JSON:
 * {
 *   gymnastDocumentID: `some string that is the gymnast's document ID`
 * }
 * Returns gymnast or
 * returns GYMNAST_NOT_FOUND if gymnast with document ID does not exist
 */
function getGymnastHandler(req, res) {
    Gymnast.findOne({'_id': req.body.gymnastDocumentID}).then(gymnast => {
        // If the gymnast does not exist send GYMNAST_NOT_FOUND message
        if(!gymnast) {
            res.status(200).json({
                message: constants.GYMNAST_NOT_FOUND
            });
        }

        // Otherwise send the gymnast
        res.status(200).json(gymnast);
    }).catch(err => {
        console.error(err);
        res.status(200).json({
            message: constants.SOMETHING_WENT_WRONG
        });
    });
}
// Define '/gymnast' route and use authentication with handler above
GymnastController.post('/getGymnast', passport.authenticate('jwt', {session: false}), getGymnastHandler);

/** Handle a request to get all gymnasts
 * Returns a list of all gymnasts
 */
function getAllGymnastsHandler(req, res) {
    Gymnast.find().then(gymnasts => {
        // If the gymnasts do not exist send GYMNAST_NOT_FOUND message
        if(!gymnasts) {
            res.status(200).json({
                message: constants.GYMNAST_NOT_FOUND
            });
        }

        res.status(200).json(gymnasts);
    }).catch(err => {
        console.error(err);
        res.status(200).json({
            message: constants.SOMETHING_WENT_WRONG
        });
    });
}
// Define '/getAllGymnasts' route and use authentication with handler above
GymnastController.get('/getAllGymnasts', passport.authenticate('jwt', {session: false}), getAllGymnastsHandler);

module.exports = GymnastController;