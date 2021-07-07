const app = require('./server/express.server');
const http = require('./server/http.server');

const leagueController = require('./controllers/league.controller');
const teamController = require('./controllers/team.controller');
const userController = require('./controllers/user.controller');

// API routes
app.use('/', userController);
app.use('/', teamController);
app.use('/', leagueController);

// Start server
http.listen(3000, '0.0.0.0', () => {
    console.log("Server listening on port 3000");
});