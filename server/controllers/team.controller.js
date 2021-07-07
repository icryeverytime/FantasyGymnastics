const express = require('express');
const ev = require('express-validator');
const Team = require('../models/team.model');
const League = require('../models/league.model');
const passport = require('passport');

const teamController = express.Router();

teamController.post('/createTeam', passport.authenticate('jwt', {session:false}), (req, res) => {
    League.findById(req.body.leagueID).then(league => {
        const team = new Team({
            owner: req.user.email,
            name: req.body.name,
            gymnastIDs: [],
        });
        team.save();
        league.teams.push(team);
        league.save()
        return res.status(200).json(league);
    });
});

teamController.get('/teams', passport.authenticate('jwt', {session:false}), (req, res) => {
    Team.find({
        owner: req.user.email
    }).then(result => {
        return res.status(200).json(result);
    }).catch(err => {
        console.error(err);
        return res.status(200).json({
            message: constants.SOME_THING_WENT_WRONG
        });
    })
});

module.exports = teamController;