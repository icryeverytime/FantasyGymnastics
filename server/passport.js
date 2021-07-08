// passport.js, 2021, FG
// Defines JWT strategy for authentication
// ------------------------------------------------------------------------

const Strategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const config = require('./misc/config');
const User = require('./models/user.model');

// JWT passport strategy
const applyPassportStrategy = passport => {
    const options = {};
    // Get JWT from 'Authorization: Bearer <token>' in http header
    options.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
    // Get secret used when encrypting the token
    options.secretOrKey = config.passport.secret;
    passport.use(
        new Strategy(options, (payload, done) => {
            // Look for a user with the email in the decrypted JWT
            User.findOne({
                email: payload.email
            }, (err, user) => {
                if (err) return done(err, false);
                // If user found, return the user
                if (user) {
                    return done(null, {
                        email: user.email,
                        name: user.name,
                        nickname: user.nickname,
                        _id: user._id
                    });
                }
                return done(null, false);
            });
        })
    );
}

module.exports = applyPassportStrategy