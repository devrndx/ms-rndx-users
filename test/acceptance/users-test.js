const request = require('supertest');
const assert = require('chai').assert;
const sinon = require('sinon');
const server = require('../support/server');
const fh = require("../support/fixture-helper.js");
const log = require('metalogger')();

const usersModel = require('users/models/users');

describe('users endpoint', () => {
    let app;

    beforeEach((done) => {
        app = server.express();
        server.beforeEach(app, function() {
            done();
        });
    });

    afterEach(function() {});

    before(() => {

        this.sinonbox = sinon.createSandbox();

        this.getUsers = this.sinonbox.stub(usersModel.prototype, 'getUsers').callsFake(function() {
            return new Promise(function(resolve, reject) {
                fh.loadFixture("users-list.json").then(function(sampleUsersList) {
                    resolve(JSON.parse(sampleUsersList));
                }).catch(function(err) {
                    log.error(err);
                });
            });
        });

        this.getUser = this.sinonbox.stub(usersModel.prototype, 'getUser').callsFake(function() {
            return new Promise(function(resolve, reject) {
                fh.loadFixture("users-list-admin.json").then(function(sampleUsersList) {
                    resolve(JSON.parse(sampleUsersList));
                }).catch(function(err) {
                    log.error(err);
                });
            });
        });

        this.getUserPkByEmail = this.sinonbox.stub(usersModel.prototype, 'getUserPkByEmail').callsFake(function(email) {
            return new Promise(function(resolve, reject) {
                fh.loadFixture("users-list-login.json").then(function(sampleUsersList) {
                    resolve(JSON.parse(sampleUsersList));
                }).catch(function(err) {
                    log.error(err);
                });
            });
        });
    });

    after(() => {
        this.sinonbox.restore();
    });

    // Note: depends on the usersModel stub.
    it('GET /users returns proper data', (done) => {
        request(app)
            .get('/users')
            .expect('Content-Type', /application\/hal\+json.*/)
            .expect(200)
            .expect(function(response) {
                const payload = response.body;
                assert.property(payload, '_links');
                assert.property(payload, 'users');
                assert.equal(payload._links.self.href, '/users');
                assert.equal(payload.users.length, 2);
                assert.equal(payload.users[0].email, 'first@example.com');
                assert.equal(payload.users[1].uuid, '229b673c-a2c5-4729-84eb-ff30d42ab133');
            })
            .end(done);
    });

    it('POST /users validates properly', (done) => {
        request(app)
            .post('/users')
            .expect('Content-Type', /application\/json.*/)
            .expect(400)
            .expect(function(response) {
                const payload = response.body;
                assert.equal(payload.errors[0], "email must be provided");
            })
            .end(done);
    });

    it('POST /login validates properly', (done) => {
        request(app)
            .post('/users/login')
            .send({ login: "first@example.com", password: "testpasswd" })
            .expect(200)
            .expect(function(response) {})
            .end(done);
    });

    it('GET /getuser validates properly', (done) => {
        request(app)
            .get('/users/getuser')
            .expect(200)
            .expect(function(response) {
                const payload = response.body;
                assert.property(payload, '_links');
                assert.property(payload, 'users');
                assert.equal(payload._links.self.href, '/users/getuser');
                assert.equal(payload.users.length, 1);
                assert.equal(payload.users[0].email, 'first@example.com');
                assert.equal(payload.users[0].uuid, '5fc0a65e-c67a-4a15-811e-bd24e8e7ef5f');
            })
            .end(done);
    });

    it('GET /getbalance validates properly', (done) => {
        request(app)
            .get('/users/getbalance')
            .expect(200)
            .expect(function(response) {})
            .end(done);
    });

    // it('POST /register validates properly', (done) => {
    //     request(app)
    //         .post('/users/register')
    //         .expect(200)
    //         .expect(function(response) {})
    //         .end(done);
    // });
});