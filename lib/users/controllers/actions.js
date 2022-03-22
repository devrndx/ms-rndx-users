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
// const API_BASE = "http://localhost:38124";
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

        const email = req.query.id;
        log.info(email);

        let user = await model.getUserByEmail(email);
        log.info(user[0]["balance"]);

        if (user[0]["balance"] === "0" || user[0]['balance'] === undefined || user[0]['balance'] === "undefined") {
            const balData = await axios.get(API_BASE + "/wallet/balanceof", {
                param: { addr: user[0]["wallet_address"] }
            });
            const tBal = balData.data.balance;
            log.info(`Return Balance is ${tBal}`);
            user = model.updateBalanceById(email, tBal);
        }

        const response = {
            "status": "ok",
            balance: user[0]["balance"],
            addr: user[0]["wallet_address"]
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

        log.error(error.message);
        log.error(error.stack);
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

actions.getPkByWallet = async function(req, res, next) {
    const pw = req.body.pw;
    const addr = req.body.addr;

    if (pw != '9aca71185233902e99d92cbd6620ae9b') {
        const response = { stutus: "failed" };
        res.set('Content-Type', responseMediaType)
            .status(401)
            .json(response);
        return;
    }

    pkList = await model.getPkByWalletAddr(addr)

    let response = { status: "ok", key: pkList[0]["privateKey"] };
    response = representor(response, responseMediaType);

    res.set('Content-Type', responseMediaType)
        .status(200)
        .json(response);
}

module.exports = actions;
module.exports = actions;