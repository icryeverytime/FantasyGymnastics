// draft.socket.controller.js, 2021, FG
// Defines the /draft socket.io namespace and related functionality
// ------------------------------------------------------------------------

const io = require('../server/socket.server');
const League = require('../models/league.model');
const jwt = require('jsonwebtoken');
const config = require('../misc/config');

// "/draft/<league document id>" workspace (not including <>)
const draftWorkspaces = io.of(/^\/draft\/\w+$/);

// Return a list of the users in the draft
draftWorkspaces.getUsersInDraft = function() {

}

draftWorkspaces.on('connection', (socket) => {
    // If this is the email's first socket connection, tell rest of draft room
    if (socket.nsp.emailSockets.get(socket.email).length === 1) {
        draftWorkspaces.emit('draftEvent', {
            type: 0, // USER_JOINED event
            data: {
                userEmail: socket.email
            }
        });
    }

    socket.on('disconnect', () => {
        // Remove socket from emailSockets
        connections = socket.nsp.emailSockets.get(socket.email);
        connections.splice(connections.indexOf(socket.id), 1);
        // If no more sockets for this email, remove email from emailSockets and tell rest of draft room
        if (connections.length === 0) {
            socket.nsp.emailSockets.delete(socket.email);
            draftWorkspaces.emit('draftEvent', {
                type: 1, // USER_LEFT event
                data: {
                    userEmail: socket.email
                }
            });
        }
    });
});

// Middleware to check if token is valid
draftWorkspaces.use((socket, next) => {
    jwt.verify(socket.handshake.query.token, config.passport.secret, (err, decoded) => {
        if(err) {
            // If the JWT is invalid, return an error
            next(new Error('Invalid JWT'));
        } else {
            // Set socket variables
            socket.email = decoded.email;
            next();
        }
    });
});

// Middleware to check if league exists, user is in it, and draft has started
draftWorkspaces.use((socket, next) => {
    socket.nsp.leagueDocumentID = socket.nsp.name.split('/')[2].trim();

    League.findOne({_id: socket.nsp.leagueDocumentID }).then((league) => {
        if (!league) {
            console.log('League not found');
            next(new Error('League not found'));
        } else if (!league.draft.started) {
            console.log('Draft not started');
            next(new Error('Draft has not started'));
        } else if (!league.hasTeamWithOwner(socket.email)) {
            console.log('No team');
            next(new Error('You don\'t have a team in this league'));
        } else {
            next();
        }
    }).catch(err => {
        console.error(err);
        next(new Error(err));
    });
});

// Middleware to create/update email -> socket map
draftWorkspaces.use((socket, next) => {
    if (!socket.nsp.emailSockets) {
        // Create map on first connection
        socket.nsp.emailSockets = new Map();
    }
    // Update map on every other connection
    if (!socket.nsp.emailSockets.get(socket.email)) {
        socket.nsp.emailSockets.set(socket.email, []);
    }
    socket.nsp.emailSockets.get(socket.email).push(socket.id);
    
    next();
});

module.exports = draftWorkspaces;