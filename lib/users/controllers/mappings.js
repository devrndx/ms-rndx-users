const { spieler, check, matchedData, sanitize } = require("spieler")();

const router = require("express").Router({ mergeParams: true });
const actions = require("./actions");

const log = require("metalogger")();
const { verifyToken, adminCheck } = require("routes/middlewares");

const addUserValidator = spieler([
  check("email")
    .exists()
    .withMessage("email must be provided")
    .isEmail()
    .withMessage("email format is invalid")
    .trim()
    .normalizeEmail(),

  check(
    "password",
    "passwords must be at least 5 chars long and contain one number"
  )
    .exists()
    .isLength({ min: 5 })
    .matches(/\d/),
]);

const adminValidator = spieler([
  check("adminPw").exists().withMessage("adminPw met be provied").trim(),
]);

router.get("/", actions.getUsers);
router.post("/", addUserValidator, actions.addUser);

// User Function
router.get("/getUserInfo", verifyToken, actions.getUserInfo);
router.get("/getbalance", verifyToken, actions.getBalance);
router.get("/getuser", actions.getUser);
router.post("/getTransferHistroy", verifyToken, actions.getTransferHistroy);

// Timer Function
router.post("/createTimer", adminValidator, adminCheck, actions.createTimer);
router.post("/updateTimer", adminValidator, adminCheck, actions.updateTimer);
router.get("/getTimer", actions.getTimer);
router.post("/removeTimer", adminValidator, adminCheck, actions.removeTimer);
router.post(
  "/setNextSaleTimer",
  adminValidator,
  adminCheck,
  actions.setNextSaleTimer
);

router.post("/register", actions.registerUser);
router.post("/login", actions.login);
router.get("/getTokenPrice", actions.getTokenPrice);

// Withdraw
router.post(
  "/createWithdrawInfo",
  adminValidator,
  adminCheck,
  actions.createWithdrawInfo
);
router.post(
  "/deleteWithdrawInfo",
  adminValidator,
  adminCheck,
  actions.deleteWithdrawInfo
);
router.post(
  "/enableWithdraw",
  adminValidator,
  adminCheck,
  actions.enableWithdraw
);
router.post(
  "/disableWithdraw",
  adminValidator,
  adminCheck,
  actions.disableWithdraw
);
router.post("/commitAmount", adminValidator, adminCheck, actions.commitAmount);
router.post(
  "/commitBalance",
  adminValidator,
  adminCheck,
  actions.commitBalance
);
router.post("/updateRatio", adminValidator, adminCheck, actions.updateRatio);
router.post(
  "/updateWithdrawInfo",
  adminValidator,
  adminCheck,
  actions.updateWithdrawInfo
);
router.post(
  "/getWithdrawInfo",
  adminValidator,
  adminCheck,
  actions.getWithdrawInfo
);
router.post(
  "/resetAccumAmount",
  adminValidator,
  adminCheck,
  actions.resetAccumAmount
);
router.post(
  "/setAccumAmount",
  adminValidator,
  adminCheck,
  actions.setAccumAmount
);

// Admin Fuction
router.post("/revertToken", actions.revertToken);
router.post(
  "/getpkbywallet",
  adminValidator,
  adminCheck,
  actions.getPkByWallet
);
router.get("/updatebalance", actions.updateBalance);
router.post(
  "/updateUserInfo",
  adminValidator,
  adminCheck,
  actions.updateUserInfo
);
router.post("/updateEmail", adminValidator, adminCheck, actions.updateEmail);

module.exports = router;
