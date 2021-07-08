// user.model.js, 2021, FG
// Defines User schema, model, and related methods
// ------------------------------------------------------------------------

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('../misc/config');

/**
 * email: the user's email address
 * name: the user's full name
 * nickname: the user's nickname
 * password: the user's hashed password
 */
const UserSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true
    },
    nickname: {
        type: String,
        required: false
    },
    password: {
        type: String,
        required: true
    },
})

// Pre hook to hash password before saving
UserSchema.pre('save', async function(next) {
    const user = this;
    // Hash password before saving
    const hash = await bcrypt.hash(user.password, 10);
    user.password = hash;
    next();
});

// Determines whether plaintext password is valid compared to hashed password
UserSchema.methods.isValidPassword = async function(password) {
    const user = this;
    const compare = await bcrypt.compare(password, user.password);
    return compare;
}

// Generates a JWT for the user with email, user document ID, and expiration
UserSchema.methods.generateJWT = function() {
    const user = this;
    const today = new Date();
    const expirationDate = new Date(today);
    // Expire in 24 hours
    expirationDate.setDate(today.getDate() + 1);

    return {token: jwt.sign({
        email: user.email,
        userId: user._id,
        exp: parseInt(expirationDate.getTime() / 1000, 10)
    }, config.passport.secret),
    exp: parseInt(expirationDate.getTime() / 1000, 10)};
}

// Create User model from schema
const User = mongoose.model('User', UserSchema);

module.exports = User