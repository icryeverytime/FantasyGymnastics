// socket.server.js, 2021, FG
// Defines the socket.io server, it's behaviors, and related functionality
// ------------------------------------------------------------------------

const constants = require('../misc/constants');
const jwt = require('jsonwebtoken');
const config = require('../misc/config');
const http = require('./http.server');

// Define socket.io server
const io = require('socket.io')(http, {
    cors: {
        origins: ['http://localhost:4200']
    }
});

// Map of user email => socket IDs (one socket ID for each open browser window)
var socketConnections = new Map();

// Send a message on a certain channel to a specific usre
function sendMessageToUser(email, channel, message) {
    // Get the socket IDs of the user
    userConnections = socketConnections.get(email);
    if (userConnections) {
        // Send the message to each of the user's sockets
        userConnections.forEach(function (socketID) {
            io.to(socketID).emit(channel, message);
        });
    }
}

// Handle an event on the 'authenticate' channel of a socket
function onSocketAuthenticate(socket, data) {
    // Check if JWT provided in event data
    if(!data['token']) {
        // If no JWT provided, return NO_TOKEN_PROVIDED message on the 'authenticate-repsonse' channel
        socket.emit('authenticate-response', {
            success: false,
            message: constants.NO_TOKEN_PROVIDED
        });
    } else {
        // Verify the JWT is valid
        jwt.verify(data['token'], config.passport.secret, (err, decoded) => {
            if(err) {
                // If the JWT is invalid, return INVALID_TOKEN message on the 'authenticate-response' channel
                socket.emit('authenticate-response', {
                    success: false,
                    message: constants.INVALID_TOKEN
                });
            } else {
                // Set socket variables
                socket.authenticated = true
                socket.email = decoded.email;

                // Add socket ID to user's list of socket IDs
                userConnections = socketConnections.get(decoded.email);
                if (userConnections === undefined) {
                    userConnections = [];
                }
                userConnections.push(socket.id);
                socketConnections.set(decoded.email, userConnections);

                // If the user was authenticated on the socket, return AUTHENTICATED message on the 'authenticate-response' channel
                socket.emit('authenticate-response', {
                    success: true,
                    message: constants.AUTHENTICATED
                });
            }
        });
    }
}

// Handle an event on the 'logout' channel of a socket
function onSocketLogout(socket, data) {
    // Check if JWT provided in event data
    if(!data['token']) {
        // If no JWT provided, return NO_TOKEN_PROVIDED message on the 'logout-response' channel
        socket.emit('logout-response', {
            success: false,
            message: constants.NO_TOKEN_PROVIDED
        });
    } else {
        // Verify the JWT is valid
        jwt.verify(data['token'], config.passport.secret, (err, decoded) => {
            if(err) {
                // If the JWT is invalid, return INVALID_TOKEN message on the 'logout-response' channel
                socket.emit('logout-response', {
                    success: false,
                    message: constants.INVALID_TOKEN
                });
            } else {
                // Remove socket ID from user's list of socket IDs, deleting the user from the map if it was the last socket ID
                socket.authenticated = false
                userConnections = socketConnections.get(decoded.email);
                userConnections.splice(userConnections.indexOf(socket.id), 1);
                if(userConnections.length === 0){
                    socketConnections.delete(decoded.email);
                }

                // If the user was logged out on the socket, return LOGGED_OUT message on the 'logout-response' channel
                socket.emit('logout-response', {
                    success: true,
                    message: constants.LOGGED_OUT
                });
            }
        });
    }
}

// Handle a socket disconnection
function onSocketDisconnect(socket) {
    // If the socket was authenticated, remove the socket ID from the user's list of socket IDs
    if(socket.authenticated) {
        userConnections = socketConnections.get(socket.email);
        userConnections.splice(userConnections.indexOf(socket.id), 1);
        socketConnections.set(socket.email, userConnections);
        console.log(socketConnections);
    }
}

// Handle a socket connection
function onSocketConnect(socket) {
    socket.authenticated = false;
}

// Define socket.io server behaviors
io.on('connection', (socket) => {
    onSocketConnect(socket);

    socket.on('authenticate', (data) => {
        onSocketAuthenticate(socket, data);
    });

    socket.on('logout', (data) => {
        onSocketLogout(socket, data);
    });                 

    socket.on('disconnect', () => {
        onSocketDisconnect(socket);
    });
});

module.exports = sendMessageToUser;