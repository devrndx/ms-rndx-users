/* jshint -W079 */
const Promise = require('bluebird'),
    config = require('config'),
    log = require('metalogger')(),
    representor = require('kokua'),
    axios = require("axios"),
    cryptoJs = require("crypto-js"),

    _ = require('lodash');

const Users = require("users/models/users");
const actions = {},
    model = new Users();

const API_BASE = "https://app.rndx-wallet.io";
const responseMediaType = 'application/hal+json';

actions.getUsers = async function(req, res, next) {

    let userRows = {};
    try {
        userRows = await model.getUsers();
    } catch (err) {
        let msg = "Database Error: " + err.message;
        if (err.message.match(/ER_NO_SUCH_TABLE/)) {
            msg = "Database hasn't been set up. Please run: `make migrate`";
        }
        return res.status(500).send(msg);
    }

    let response = {};
    response.users = userRows;
    response["h:ref"] = {
        "self": "/users"
    };

    // Render internal representation into proper HAL+JSON
    response = representor(response, responseMediaType);

    res.set('Content-Type', responseMediaType)
        .status(200)
        .json(response);

};

actions.addUser = async function(req, res, next) {
    const response = { "status": "ok" };
    response.req = req.body;
    res.status(200).json(response);
};

actions.getBalance = async function(req, res, next) {
    try {
        const user = await model.getUserByEmail(req.query.id);

        const response = {
            "status": "ok",
            balance: user["balance"],
            addr: user["wallet_address"]
        };

        res.status(200).json(response);
    } catch (error) {
        let msg = "Database Error: " + error.message;
        if (error.message.match(/ER_NO_SUCH_TABLE/)) {
            msg = "Database hasn't been set up. Please run: `make migrate`";
        }
        const response = {
            "status": "ok",
            balance: 1,
            addr: "0x00"
        };
        return res.status(200).json(response);
    };
};

actions.getUser = async function(req, res, next) {
    let userRows = {};
    try {
        userRows = await model.getUser();
    } catch (err) {
        let msg = "Database Error: " + err.message;
        if (err.message.match(/ER_NO_SUCH_TABLE/)) {
            msg = "Database hasn't been set up. Please run: `make migrate`";
        }
        return res.status(500).send(msg);
    }

    let response = {};
    response.users = userRows;
    response["h:ref"] = {
        "self": "/users/getuser"
    };

    // Render internal representation into proper HAL+JSON
    response = representor(response, responseMediaType);

    res.set('Content-Type', responseMediaType)
        .status(200)
        .json(response);
};

actions.registerUser = async function(req, res, next) {

    const addrData = await axios
        .post(API_BASE + "/wallet/create_account", {}, {
            headers: {
                "Content-Type": "application/json"
            }
        })
        .catch(function(error) {
            log.error(error);
            const response = { status: "failed" };
            response.body = res.body;
            res.status(500).json(response);
            return;
        });

    await model.addUser(req.body.name, req.body.phonenum, req.body.email, addrData.data.addr, addrData.data.pk, req.body.uuid);

    let response = { "status": "ok" };
    response["h:ref"] = {
        "self": "/users/registerUser"
    };

    // Render internal representation into proper HAL+JSON
    response = representor(response, responseMediaType);

    res.set('Content-Type', responseMediaType)
        .status(200)
        .json(response);
};

actions.login = async function(req, res, next) {
    const user = await model.getUserPkByEmail(req.body.login);
    if (user.length == 0) {
        log.error("Error : can't find user");
        const response = { "status": "failed" };
        res.status(500)
            .json(response);
        return;
    }

    let response = { status: "ok", seed: user[0]["privateKey"] };
    res.set({
        "x-amzn-remapped-authorization": cryptoJs.AES.encrypt(
            user[0]["privateKey"],
            req.body.password
        ).toString(),
    });

    response = representor(response, responseMediaType);

    res.set('Content-Type', responseMediaType)
        .status(200)
        .json(response);
};

module.exports = actions;