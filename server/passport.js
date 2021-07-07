const Strategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const config = require('./config');
const User = require('./models/user.model');

const applyPassportStrategy = passport => {
    const options = {};
    options.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
    options.secretOrKey = config.passport.secret;
    passport.use(
        new Strategy(options, (payload, done) => {
            User.findOne({
                email: payload.email
            }, (err, user) => {
                if (err) return done(err, false);
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