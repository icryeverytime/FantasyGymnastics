// app.js, 2021, FG
// The main file of the application, it starts the server
// ------------------------------------------------------------------------

const app = require('./server/express.server');
const http = require('./server/http.server');
require('./controllers/draft.socket.controller');

// Import route configurations
const LeagueController = require('./controllers/league.controller');
const TeamController = require('./controllers/team.controller');
const UserController = require('./controllers/user.controller');
const GymnastController = require('./controllers/gymnast.controller');
const DraftController = require('./controllers/draft.controller');

// Use route configurations
app.use('/', UserController);
app.use('/', TeamController);
app.use('/', LeagueController);
app.use('/', GymnastController);
app.use('/', DraftController);

// Start express and socket.io server
http.listen(3000, '0.0.0.0', () => {
    console.log("Server listening on port 3000");
});