const mongoose = require('mongoose');
const Gymnast = require('./models/gymnast.model');
const fs = require('fs');

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
});

let rawdata = fs.readFileSync('./gymnasts.json');
let gymnasts = JSON.parse(rawdata);

gymnasts.forEach(gymnast => {
    Gymnast.create(gymnast).then(() => {
        console.log("Created " + gymnast.name);
    }).catch(err => {
        console.error(err);
    });
});

mongoose.disconnect();