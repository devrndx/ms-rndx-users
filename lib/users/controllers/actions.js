/* jshint -W079 */
const Promise = require("bluebird"),
  config = require("config"),
  log = require("metalogger")(),
  representor = require("kokua"),
  axios = require("axios"),
  cryptoJs = require("crypto-js"),
  _ = require("lodash");

const Users = require("users/models/users");
const TransactionService = require("users/services/transactionService");
const TimerService = require("users/services/timerService");
const WithdrawInfoService = require("users/services/withdrawInfoService");
const TxEmitterService = require("users/services/txEmitterService.js");

const actions = {},
  model = new Users(),
  timerService = new TimerService(),
  withdrawInfoService = new WithdrawInfoService(),
  transactionService = new TransactionService();

const API_BASE =
  process.env.NODE_ENV == "production"
    ? "https://app.rndx-wallet.io"
    : "https://app.dev.rndx-wallet.io";

const responseMediaType = "application/hal+json";

actions.getUsers = async function (req, res, next) {
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

actions.getUserInfo = async function (req, res, next) {
  const user = await model.getUserByEmail(req.query.id);
  if (user.length == 0) {
    log.error("Error : can't find user");
    const response = { status: "failed" };
    res.status(500).json(response);
    return;
  }
  const email = user[0]["email"];
  const address = user[0]["wallet_address"];
  const phonenum = user[0]["phonenum"];
  const name = user[0]["name"];
  const destTime = await timerService.getActiveSaleTimer();

  const balData = await axios.get(API_BASE + "/wallet/balanceof", {
    params: { addr: address },
  });

  const balanceVal = balData.data.balance;
  await model.updateBalanceByAddr(address, balanceVal);

  await withdrawInfoService.syncActiveRatio(address);
  const nRatio = await withdrawInfoService.getRatio(address);

  const token = cryptoJs.AES.encrypt(
    user[0]["wallet_address"],
    user[0]["privateKey"]
  ).toString();

  res.header("Authorization", token);
  let response = {
    status: "ok",
    balance: balanceVal,
    addr: address,
    name: name,
    email: email,
    phonenumber: phonenum,
    destDateTime: destTime[0]["destTime"].toISOString(),
    transferFee: 0,
    ratio: nRatio,
    token: token,
  };
  
  response["h:ref"] = {
    self: "/users/getUserInfo",
  };

  // Render internal representation into proper HAL+JSON
  response = representor(response, responseMediaType);
  res.set("Content-Type", responseMediaType).status(200).json(response);
};

actions.addUser = async function (req, res, next) {
  const response = { status: "ok" };
  response.req = req.body;
  res.status(200).json(response);
};

actions.getBalance = async function (req, res, next) {
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

actions.getUser = async function (req, res, next) {
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

actions.registerUser = async function (req, res, next) {
  const addrData = await axios
    .post(
      API_BASE + "/wallet/create_account",
      {},
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    )
    .catch(function (error) {
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

actions.login = async function (req, res, next) {
  const user = await model.getUserPkByEmail(req.body.login);
  if (user.length == 0) {
    log.error("Error : can't find user");
    const response = { status: "failed" };
    res.status(500).json(response);
    return;
  }

  let response = { status: "ok", seed: "RNDXDummy" };
  res.set({
    "Authorization": cryptoJs.AES.encrypt(
      user[0]["wallet_address"],
      user[0]["privateKey"]
    ).toString(),
  });

  response = representor(response, responseMediaType);

  res.set("Content-Type", responseMediaType).status(200).json(response);
};

actions.revertToken = async function (req, res, next) {
  const pk = req.body.pk;
  const fromAddr = req.body.fromAddr;
  const amount = req.body.amount;
  const nameVal = req.body.name;
  const phoneNumVal = req.body.phoneNum;

  const pkList = await model.getPkByWalletAddr(fromAddr);

  const fromPk = pkList[0]["privateKey"];

  await axios
    .post(
      API_BASE + "/wallet/transferFromAdmin",
      {
        pk: pk,
        fromAddr: fromAddr,
        fromPk: fromPk,
        amount: amount,
        name: nameVal,
        phoneNum: phoneNumVal,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    )
    .catch(function (error) {
      log.error(error);
      return;
    });

  let response = { status: "ok" };
  response = representor(response, responseMediaType);

  res.set("Content-Type", responseMediaType).status(200).json(response);
};

actions.getPkByWallet = async function (req, res, next) {
  const addr = req.body.addr;
  const pkList = await model.getPkByWalletAddr(addr);

  let response = { status: "ok", key: pkList[0]["privateKey"] };
  response = representor(response, responseMediaType);

  res.set("Content-Type", responseMediaType).status(200).json(response);
};

actions.updateEmail = async function (req, res, next) {
  const oldEmail = req.body.oldEmail;
  const newEmail = req.body.newEmail;

  await model.updateEmail(oldEmail, newEmail);

  let response = { status: "ok" };
  response = representor(response, responseMediaType);

  res.set("Content-Type", responseMediaType).status(200).json(response);
};

actions.updateBalance = async function (req, res, next) {
  const addr = req.query.addr;

  const balData = await axios.get(API_BASE + "/wallet/balanceof", {
    params: { addr: addr },
  });

  const balance = balData.data.balance;
  await model.updateBalanceByAddr(addr, balance);

  let response = { status: "ok" };
  response = representor(response, responseMediaType);

  res.set("Content-Type", responseMediaType).status(200).json(response);
};

actions.updateUserInfo = async function (req, res, next) {
  const addr = req.body.addr;
  const name = req.body.name;

  await model.updateNameByAddr(addr, name);

  let response = { status: "ok" };
  response = representor(response, responseMediaType);

  res.set("Content-Type", responseMediaType).status(200).json(response);
};

actions.getTransferHistroy = async function (req, res, next) {
  const addrVal = req.body.address;
  const isExists = await transactionService.isExists(addrVal);

  try {
    if (!isExists) {
      const recvData = await axios.post(
        API_BASE + "/wallet/getTransferHistroy",
        {
          addr: addrVal,
        }
      );

      await transactionService.createInitialDatas(
        addrVal,
        recvData.data.result
      );
    } else {
      const recvData = await axios.post(
        API_BASE + "/wallet/getTransferHistroy",
        {
          addr: addrVal,
        }
      );

      await transactionService.insertTransferData(
        addrVal,
        recvData.data.result
      );
    }

    const txHistory = await transactionService.getFormmatedTxData(addrVal);
    const response = {
      status: "ok",
      result: txHistory,
    };

    res.status(200).json(response);
  } catch (error) {
    log.error(error);
    const response = {
      status: "Failed",
      result: [],
    };

    res.status(200).json(response);
  }
};

actions.getTokenPrice = async function (req, res, next) {
  const tokenPrice = await axios
    .get(API_BASE + "/wallet/getTokenPrice")
    .catch(function (error) {
      log.error(error);
      const response = {
        status: "Failed",
        price: 0,
      };
      res.status(200).json(response);
      return;
    });

  const response = {
    status: "ok",
    price: tokenPrice.data.price,
  };
  res.status(200).json(response);
};

// Timer Function
actions.createTimer = async function (req, res, next) {
    const timerName = req.body.timerName;
    const date = req.body.destTime;
    const timerType = !req.body.type ? "Custom" : req.body.type;
  
    await timerService.addTimer(timerName, date, timerType);
  
    let response = { status: "ok", timerName: timerName, date: date };
    response = representor(response, responseMediaType);
  
    res.set("Content-Type", responseMediaType).status(200).json(response);
  };
  
  actions.updateTimer = async function (req, res, next) {
    const timerName = req.body.timerName;
    const date = req.body.destTime;
  
    await timerService.updateTimer(timerName, date);
  
    let response = { status: "ok", timerName: timerName, date: date };
    response = representor(response, responseMediaType);
  
    res.set("Content-Type", responseMediaType).status(200).json(response);
  };
  
  actions.getTimer = async function (req, res, next) {
    const timerName = req.query.timerName;
    const timer = await timerService.getCountDown(timerName);
  
    res.render("countDown", { destTime: timer });
  };
  
  actions.setNextSaleTimer = async function (req, res, next) {
    const timerName = req.body.timerName;
    const nRatio = req.body.ratio;
  
    await timerService.clearActiveSalesTimer();
    await timerService.setActiveSaleTimer(timerName);
    await withdrawInfoService.updateActiveRatio(nRatio);
  
    let response = { status: "ok", timer: timerName, ratio: nRatio};
    response = representor(response, responseMediaType);
  
    res.set("Content-Type", responseMediaType).status(200).json(response);
  };
  
  actions.removeTimer = async function (req, res, next) {
    const timerName = req.body.timerName;
    await timerService.removeCountDown(timerName);
    let response = { status: "ok" };
    response = representor(response, responseMediaType);
  
    res.set("Content-Type", responseMediaType).status(200).json(response);
  };

//Withdraw Function
actions.createWithdrawInfo = async function (req, res, next) {
    const addr = req.body.address;
    const balance = await axios
      .get(API_BASE + "/wallet/balanceof", {
        params: { addr: addr },
      })
      .catch((err) => {
        log.error(err);
      });
  
    const initValue = balance.data.balance;
    await model.updateBalanceByAddr(addr, balance.data.balance);
    await withdrawInfoService.createWithdrawInfo(addr, initValue);
  
    const response = {
      status: "ok",
    };
  
    res.status(200).json(response);
  };
  
  actions.deleteWithdrawInfo = async function (req, res, next) {
    const addr = req.body.address;
    await withdrawInfoService.deleteWithdrawInfo(addr);
  
    const response = {
      status: "ok",
    };
  
    res.status(200).json(response);
  };
  
  actions.enableWithdraw = async function (req, res, next) {
    withdrawInfoService.enable();
    const response = {
      status: "ok",
    };
  
    res.status(200).json(response);
  };
  
  actions.disableWithdraw = async function (req, res, next) {
    withdrawInfoService.disable();
  
    const response = {
      status: "ok",
    };
  
    res.status(200).json(response);
  };
  
  actions.commitAmount = async function (req, res, next) {
    const addr = req.body.addr;
    await withdrawInfoService.commitAmount(addr);
  
    const response = {
      status: "ok",
    };
  
    res.status(200).json(response);
  };
  
  actions.commitBalance = async function (req, res, next) {
    const addr = req.body.addr;
    const balance = await axios
      .get(API_BASE + "/wallet/balanceof", {
        params: { addr: addr },
      })
      .catch((err) => {
        log.error(err);
      });
  
    await model.updateBalanceByAddr(addr, balance.data.balance);
  
    const response = {
      status: "ok",
    };
  
    res.status(200).json(response);
  };
  
  actions.updateRatio = async function (req, res, next) {
    const addr = req.body.address;
    const ratio = req.body.ratio;
    await withdrawInfoService.updateRatio(addr, ratio);
  
    const response = {
      status: "ok",
    };
  
    res.status(200).json(response);
  };
  
  actions.getWithdrawInfo = async function (req, res, next) {
    const addr = req.body.address;
    const isExists = await withdrawInfoService.isExists(addr);
  
    if (!isExists) {
      const response = { status: "isNotExists", address: addr };
      res.status(403).json(response);
    } else {
      const info = await withdrawInfoService.getWithdrawInfo(addr);
      log.info(info);
      const response = {
        status: "ok",
        address: info["sWalletAddress"],
        accumAmt: info["nAccumAmount"],
        commitAmt: info["nCommitAmount"],
        nInitBalance: info["nInitBalance"],
        nLimitBalance: info["nLimitAmount"]
      };
  
      res.status(200).json(response);
    }
  };
  
  actions.updateWithdrawInfo = async function (req, res, next) {
    const addr = req.body.address;
  
    const info = await withdrawInfoService.getWithdrawInfo(addr);
    await withdrawInfoService.updateAmountValue(addr, info["nRatio"]);
  
    const response = {
      status: "ok",
    };
  
    res.status(200).json(response);
  };
  
  actions.resetAccumAmount = async function (req, res, next) {
    const addr = req.body.address;
    await withdrawInfoService.resetAccumAmount(addr);
  
    const response = {
      status: "ok",
    };
  
    res.status(200).json(response);
  };
  
  actions.setAccumAmount = async function (req, res, next) {
    const addr = req.body.address;
    const amount = req.body.amount;
    await withdrawInfoService.setAccumAmount(addr, amount);
  
    const response = {
      status: "ok",
    };
  
    res.status(200).json(response);
  };

module.exports = actions;
