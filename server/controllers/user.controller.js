// user.controller.js, 2021, FG
// Defines routes to handle user/authentication related requests
// ------------------------------------------------------------------------

const express = require('express');
const ev = require('express-validator');
const User = require('../models/user.model');
const RegistrationValidator = require('../models/user.validator').RegistrationValidator
const LoginValidator = require('../models/user.validator').LoginValidator
const constants = require('../misc/constants');
const passport = require('passport');

const UserController = express.Router();

/**
 * Handle a request to create a user
 * Expects a request body with the following JSON:
 * {
 *   email: `some string that will be the user's email`
 *   name: `some string that will be the user's name`
 *   password: `some string that will be the user's password`
 * }
 * Creates a new user and returns REGISTERED_OKAY or
 * returns FORM_ERRORS and the errors if there are form errors or
 * returns USER_EXISTS_ALREADY if user with same email already exists
 */
function registerHandler(req, res) {
    // Validate registration form
    const errorsAfterValidation = ev.validationResult(req);
    // If there are form errors, return them
    if (!errorsAfterValidation.isEmpty()) {
        return res.status(200).json({
            message: constants.FORM_ERRORS,
            errors: errorsAfterValidation.mapped()
        });
    }

    User.findOne({email: {$eq: req.body.email}}).then(user => {
        // If the user already exists, return USER_EXISTS_ALREADY message
        if (user) {
            return res.status(200).json({
                message: constants.USER_EXISTS_ALREADY
            });
        }

        // Create a new user
        const newUser = new User({
            email: req.body.email,
            password: req.body.password,
            name: req.body.name
        });
        newUser.save();
        return res.status(200).json({
            message: constants.REGISTERED_OKAY
        });
    }).catch(err => {
        console.error(err);
        return res.status(200).json({
            message: constants.SOMETHING_WENT_WRONG
        });
    });
}
// Define '/register' route and use register validation with handler above
UserController.post('/register', RegistrationValidator, registerHandler);

/**
 * Handle a request to login a user
 * Expects a request body with the following JSON:
 * {
 *   email: `some string that is the user's email`
 *   password: `some string that is the user's password`
 * }
 * Creates a new JWT and returns it or
 * returns FORM_ERRORS and the errors if there are form errors or
 * returns WRONG_PASSWORD if incorrect password or
 * returns EMAIL_NOT_FOUND if user with email is not found
 */
function loginHandler(req, res) {
    // Validate login form
    const errorsAfterValidation = ev.validationResult(req);
    // If there are form errors, return them
    if (!errorsAfterValidation.isEmpty()) {
        return res.status(200).json({
            message: constants.FORM_ERRORS,
            errors: errorsAfterValidation.mapped()
        });
    }

    User.findOne({email: {$eq: req.body.email}}).then(user => {
        if(user && user.email) {
            user.isValidPassword(req.body.password).then(validate => {
                // If password is not valid return WRONG_PASSWORD message
                if (!validate) {
                    return res.status(200).json({
                        message: constants.WRONG_PASSWORD
                    });
                }

                // Create a new JWT
                const tokenAndExp = user.generateJWT();
                const token = tokenAndExp['token']
                const exp = tokenAndExp['exp']
                return res.status(200).json({
                    token: token,
                    exp: exp
                });
            });
        } else{
            // If user with email is not found, return EMAIL_NOT_FOUND message
            return res.status(200).json({
                message: constants.EMAIL_NOT_FOUND
            });
        }
    }).catch(err => {
        console.error(err);
        return res.status(200).json({
            message: constants.SOMETHING_WENT_WRONG
        })
    });
}
// Define '/login' route and use login validation with handler above
UserController.post('/login', LoginValidator, loginHandler);

/**
 * Handle a request to get a user's profile
 * Returns the authenticated user's profile
 */
function profileHandler(req, res) {
    return res.status(200).json(req.user)
}
// Define '/profile' route and use authentication with handler above
UserController.get('/profile', passport.authenticate('jwt', {session:false}), profileHandler);

module.exports = UserController;