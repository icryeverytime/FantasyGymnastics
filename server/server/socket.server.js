const constants = require('../constant');
const jwt = require('jsonwebtoken');
const config = require('../config');
const http = require('./http.server');

const io = require('socket.io')(http, {
    cors: {
        origins: ['http://localhost:4200']
    }
});

var socketConnections = new Map();

function sendMessageToUser(channel, email, message) {
    userConnections = socketConnections.get(email);
    if (userConnections) {
        userConnections.forEach(function (socketID) {
            io.to(socketID).emit(channel, message);
        });
    }
}

// Socket.io
io.on('connection', (socket) => {
    console.log('new connection');
    socket.authenticated = false;

    socket.on('authenticate', (data) => {
        if(!data['token']) {
            console.log('no token provided');
            socket.emit('authenticate-response', {
                success: false,
                message: constants.NO_TOKEN_PROVIDED
            });
        } else {
            jwt.verify(data['token'], config.passport.secret, (err, decoded) => {
                if(err) {
                    console.log('invalid token');
                    socket.emit('authenticate-response', {
                        success: false,
                        message: constants.INVALID_TOKEN
                    });
                } else {
                    socket.authenticated = true
                    socket.email = decoded.email;

                    userConnections = socketConnections.get(decoded.email);
                    if (userConnections === undefined) {
                        userConnections = [];
                    }
                    userConnections.push(socket.id);
                    socketConnections.set(decoded.email, userConnections);
                    console.log(socketConnections);

                    socket.emit('authenticate-response', {
                        success: true,
                        message: constants.AUTHENTICATED
                    });
                }
            });
        }
    });

    socket.on('logout', (data) => {
        if(!data['token']) {
            console.log('no token provided');
            socket.emit('logout-response', {
                success: false,
                message: constants.NO_TOKEN_PROVIDED
            });
        } else {
            jwt.verify(data['token'], config.passport.secret, (err, decoded) => {
                if(err) {
                    socket.emit('logout-response', {
                        success: false,
                        message: constants.INVALID_TOKEN
                    });
                } else {
                    socket.authenticated = false
                    userConnections = socketConnections.get(decoded.email);
                    userConnections.splice(userConnections.indexOf(socket.id), 1);
                    if(userConnections.length === 0){
                        socketConnections.delete(decoded.email);
                    }
                    socket.emit('logout-response', {
                        success: true,
                        message: constants.LOGGED_OUT
                    });
                    console.log(socketConnections);
                }
            });
        }
    });                 

    socket.on('disconnect', () => {
        if(socket.authenticated) {
            userConnections = socketConnections.get(socket.email);
            userConnections.splice(userConnections.indexOf(socket.id), 1);
            socketConnections.set(socket.email, userConnections);
            console.log(socketConnections);
        }
    });
});

module.exports = sendMessageToUser;