/* jshint -W079 */
const Promise = require("bluebird"),
    config = require("config"),
    log = require("metalogger")(),
    representor = require("kokua"),
    axios = require("axios"),
    cryptoJs = require("crypto-js"),
    _ = require("lodash");

const Users = require("users/models/users");
const actions = {},
    model = new Users();

const API_BASE =
    process.env.NODE_ENV == "production" ?
    "https://app.rndx-wallet.io" :
    "https://app.dev.rndx-wallet.io";
// "http://localhost:38124";

const responseMediaType = "application/hal+json";

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
        self: "/users",
    };

    // Render internal representation into proper HAL+JSON
    response = representor(response, responseMediaType);

    res.set("Content-Type", responseMediaType).status(200).json(response);
};

actions.getUserInfo = async function(req, res, next) {
    const user = await model.getUserByEmail(req.query.id);
    if (user.length == 0) {
        log.error("Error : can't find user");
        const response = { status: "failed" };
        res.status(500).json(response);
        return;
    }

    const token = cryptoJs.AES.encrypt(
        user[0]["wallet_address"],
        user[0]["privateKey"]
    ).toString();

    res.header("x-amzn-remapped-authorization", token);
    let response = {
        status: "ok",
        balance: user[0]["balance"],
        addr: user[0]["wallet_address"],
        name: user[0]["name"],
        token: token,
    };
    response["h:ref"] = {
        self: "/users/getUserInfo",
    };
    // Render internal representation into proper HAL+JSON
    response = representor(response, responseMediaType);
    res.set("Content-Type", responseMediaType).status(200).json(response);
};

actions.addUser = async function(req, res, next) {
    const response = { status: "ok" };
    response.req = req.body;
    res.status(200).json(response);
};

actions.getBalance = async function(req, res, next) {
    try {
        const email = req.query.id;
        log.info(email);

        const user = await model.getUserByEmail(email);
        let balance = user[0]["balance"];

        const address = user[0]["wallet_address"];
        const balData = await axios.get(API_BASE + "/wallet/balanceof", {
            params: { addr: address },
        });

        balance = balData.data["balance"];

        log.info(`User Address : ${address}`);
        log.info(`Return Balance is ${balance}`);

        const response = {
            status: "ok",
            balance: balance,
            addr: user[0]["wallet_address"],
        };

        res.status(200).json(response);
    } catch (error) {
        let msg = "Database Error: " + error.message;
        if (error.message.match(/ER_NO_SUCH_TABLE/)) {
            msg = "Database hasn't been set up. Please run: `make migrate`";
        }
        const response = {
            status: "ok",
            balance: 1,
            addr: "0x00",
        };

        log.error(error.message);
        log.error(error.stack);
        return res.status(200).json(response);
    }
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
        self: "/users/getuser",
    };

    // Render internal representation into proper HAL+JSON
    response = representor(response, responseMediaType);

    res.set("Content-Type", responseMediaType).status(200).json(response);
};

actions.registerUser = async function(req, res, next) {
    const addrData = await axios
        .post(
            API_BASE + "/wallet/create_account", {}, {
                headers: {
                    "Content-Type": "application/json",
                },
            }
        )
        .catch(function(error) {
            log.error(error);
            const response = { status: "failed" };
            response.body = res.body;
            res.status(500).json(response);
            return;
        });

    await model.addUser(
        req.body.name,
        req.body.phonenum,
        req.body.email,
        addrData.data.addr,
        addrData.data.pk,
        req.body.uuid
    );

    let response = { status: "ok" };
    response["h:ref"] = {
        self: "/users/registerUser",
    };

    // Render internal representation into proper HAL+JSON
    response = representor(response, responseMediaType);

    res.set("Content-Type", responseMediaType).status(200).json(response);
};

actions.login = async function(req, res, next) {
    const user = await model.getUserPkByEmail(req.body.login);
    if (user.length == 0) {
        log.error("Error : can't find user");
        const response = { status: "failed" };
        res.status(500).json(response);
        return;
    }

    let response = { status: "ok", seed: "RNDXDummy" };
    res.set({
        "x-amzn-remapped-authorization": cryptoJs.AES.encrypt(
            user[0]["wallet_address"],
            user[0]["privateKey"]
        ).toString(),
    });

    response = representor(response, responseMediaType);

    res.set("Content-Type", responseMediaType).status(200).json(response);
};

actions.revertToken = async function(req, res, next) {
    const pk = req.body.pk;
    const fromAddr = req.body.fromAddr;
    const amount = req.body.amount;
    const nameVal = req.body.name;
    const phoneNumVal = req.body.phoneNum;

    const pkList = await model.getPkByWalletAddr(fromAddr);

    const fromPk = pkList[0]["privateKey"];

    await axios
        .post(
            API_BASE + "/wallet/transferFromAdmin", {
                pk: pk,
                fromAddr: fromAddr,
                fromPk: fromPk,
                amount: amount,
                name: nameVal,
                phoneNum: phoneNumVal,
            }, {
                headers: {
                    "Content-Type": "application/json",
                },
            }
        )
        .catch(function(error) {
            log.error(error);
            return;
        });

    let response = { status: "ok" };
    response = representor(response, responseMediaType);

    res.set("Content-Type", responseMediaType).status(200).json(response);
};

actions.getPkByWallet = async function(req, res, next) {
    const pw = req.body.pw;
    const addr = req.body.addr;
    const md5 = cryptoJs.MD5(pw);

    if (md5 != process.env.ADMIN_SECRET) {
        const response = { stutus: "failed" };
        res.set("Content-Type", responseMediaType).status(401).json(response);
        return;
    }

    const pkList = await model.getPkByWalletAddr(addr);

    let response = { status: "ok", key: pkList[0]["privateKey"] };
    response = representor(response, responseMediaType);

    res.set("Content-Type", responseMediaType).status(200).json(response);
};

actions.updateEmail = async function(req, res, next) {
    const pw = req.body.pw;
    const oldEmail = req.body.oldEmail;
    const newEmail = req.body.newEmail;

    const md5 = cryptoJs.MD5(pw);

    if (md5 != process.env.ADMIN_SECRET) {
        const response = { stutus: "failed" };
        res.set("Content-Type", responseMediaType).status(401).json(response);
        return;
    }

    await model.updateEmail(oldEmail, newEmail);

    let response = { status: "ok" };
    response = representor(response, responseMediaType);

    res.set("Content-Type", responseMediaType).status(200).json(response);
};

actions.updateBalance = async function(req, res, next) {
    const addr = req.query.addr;

    const balData = await axios.get(API_BASE + "/wallet/balanceof", {
        params: { addr: addr },
    });

    const balance = balData.data["balance"];
    await model.updateBalanceByAddr(addr, balance);

    let response = { status: "ok" };
    response = representor(response, responseMediaType);

    res.set("Content-Type", responseMediaType).status(200).json(response);
};

actions.updateUserInfo = async function(req, res, next) {
    const pw = req.body.pw;
    const addr = req.body.addr;
    const md5 = cryptoJs.MD5(pw);

    if (md5 != process.env.ADMIN_SECRET) {
        const response = { stutus: "failed" };
        res.set("Content-Type", responseMediaType).status(401).json(response);
        return;
    }

    const name = req.body.name;

    await model.updateBalanceByAddr(addr, name);

    let response = { status: "ok" };
    response = representor(response, responseMediaType);

    res.set("Content-Type", responseMediaType).status(200).json(response);
};

actions.getTokenPrice = async function(req, res, next) {
    const tokenPrice = await axios.get(API_BASE + "/wallet/getTokenPrice")
        .catch(function(error) {
            log.error(error);
            resErrorMessege(res);
            return;
        });

    const response = {
        status: "ok",
        price: tokenPrice.data.price
    };
    res.status(200).json(response);
};

module.exports = actions;