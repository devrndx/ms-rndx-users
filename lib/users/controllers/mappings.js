const { spieler, check, matchedData, sanitize } = require("spieler")();

const router = require("express").Router({ mergeParams: true });
const actions = require("./actions");

const log = require("metalogger")();
const adminCheck = require("routes/middlewares");

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
router.get("/getUserInfo", actions.getUserInfo);
router.get("/getbalance", actions.getBalance);
router.get("/getuser", actions.getUser);
router.post("/getTransferHistroy", actions.getTransferHistroy);

// Timer Function
router.post(
  "/createTimer",
  adminValidator,
  adminCheck.adminCheck,
  actions.createTimer
);
router.post(
  "/updateTimer",
  adminValidator,
  adminCheck.adminCheck,
  actions.updateTimer
);
router.get("/getTimer", actions.getTimer);
router.post(
  "/removeTimer",
  adminValidator,
  adminCheck.adminCheck,
  actions.removeTimer
);
router.post(
  "/setNextSaleTimer",
  adminValidator,
  adminCheck.adminCheck,
  actions.setNextSaleTimer
);

router.post("/register", actions.registerUser);
router.post("/login", actions.login);
router.get("/getTokenPrice", actions.getTokenPrice);

// Admin Fuction
router.post("/revertToken", actions.revertToken);
router.post(
  "/getpkbywallet",
  adminValidator,
  adminCheck.adminCheck,
  actions.getPkByWallet
);
router.get("/updatebalance", actions.updateBalance);
router.post(
  "/updateUserInfo",
  adminValidator,
  adminCheck.adminCheck,
  actions.updateUserInfo
);
router.post(
  "/updateEmail",
  adminValidator,
  adminCheck.adminCheck,
  actions.updateEmail
);

module.exports = router;
