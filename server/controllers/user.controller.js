const express = require('express');
const ev = require('express-validator');
const User = require('../models/user.model');
const registerValidation = require('../models/user.validator').registerValidation
const loginValidation = require('../models/user.validator').loginValidation
const constants = require('../constant');
const passport = require('passport');

const userController = express.Router();

async function registerHandler(req, res) {
    const errorsAfterValidation = ev.validationResult(req);
    if (!errorsAfterValidation.isEmpty()) {
        return res.status(200).json({
            message: constants.FORM_ERRORS,
            errors: errorsAfterValidation.mapped()
        });
    }

    try {
        const user = await User.findOne({email: req.body.email});
        if (user) {
            return res.status(403).json({
                message: constants.USER_EXISTS_ALREADY
            });
        }

        const newUser = new User({
            email: req.body.email,
            password: req.body.password,
            name: req.body.name
        });
        newUser.save();
        return res.status(200).json({
            message: constants.REGISTERED_OKAY
        });
        
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            message: constants.SOME_THING_WENT_WRONG
        });
    }
}
userController.post('/register', registerValidation, registerHandler);

function loginHandler(req, res) {
    const errorsAfterValidation = ev.validationResult(req);
    if (!errorsAfterValidation.isEmpty()) {
        return res.status(200).json({
            message: constants.FORM_ERRORS,
            errors: errorsAfterValidation.mapped()
        });
    }
    User.findOne({email: req.body.email}).then(user => {
        if(user && user.email) {
            user.isValidPassword(req.body.password).then(validate => {
                if (!validate) {
                    return res.status(200).json({
                        message: constants.WRONG_PASSWORD
                    });
                }

                const tokenAndExp = user.generateJWT();
                const token = tokenAndExp['token']
                const exp = tokenAndExp['exp']
                return res.status(200).json({
                    token: token,
                    exp: exp
                });
            });
        } else{
            return res.status(200).json({
                message: constants.EMAIL_NOT_FOUND
            });
        }
    }).catch(err => {
        console.error(err);
        return res.status(200).json({
            message: constants.SOME_THING_WENT_WRONG
        })
    });
}
userController.post('/login', loginValidation, loginHandler);

function profileHandler(req, res) {
    return res.status(200).json(req.user)
}
userController.get('/profile', passport.authenticate('jwt', {session:false}), profileHandler);

module.exports = userController;