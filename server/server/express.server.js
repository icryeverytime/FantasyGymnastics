// express.server.js, 2021, FG
// Defines the express server, it's passport strategies, rate limiting, and connects to the database
// ------------------------------------------------------------------------

const express = require('express');
const passport = require('passport');
const applyPassportStrategy = require('../passport');
const rl = require('express-rate-limit');
const mongoose = require('mongoose');

// Initialize the express server
const app = express();

// Apply strategy to passport
applyPassportStrategy(passport);
app.use(express.json())

// Use rate limiter
const limiter = rl({
    windowMs: 15*60*1000,
    max: 300
});
app.use(limiter);

// Connect to database
mongoose.connect(
    'mongodb+srv://testUser:4QX2ROFU2BJG5Jhv@cluster0.o5q6t.mongodb.net/myFirstDatabase?retryWrites=true&w=majority',
    {
        useNewUrlParser: true,
        useFindAndModify: false,
        useUnifiedTopology: true,
        useCreateIndex: true
    }
).then(() => {
    console.log("Connected to database")
}).catch(err => {
    console.error(err);
})

module.exports = app;