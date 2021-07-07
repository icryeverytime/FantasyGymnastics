const { expect, assert } = require('chai');
const registerHandler = require('../controllers/user.controller').registerHandler;
const User = require('../models/user.model');
const app = require('../server');
let request = require('supertest-as-promised')

describe("user controller: register", () => {

    it("should create a new user", () => {
        return request(app)
        .post('/register')
        .send({
            email: 'testinguser@test.com',
            password: 'password',
            firstName: 'test',
            lastName: 'test'
        })
        .expect(200)
        .then(data => {
            User.findOne({
                email: 'testinguser@test.com'
            }).then(user => {
                user.remove();
            });
            assert(data.body.message == 'registered okay')
        })
    });
});