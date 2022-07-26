const { spieler, check, matchedData, sanitize } = require("spieler")();

const router = require("express").Router({ mergeParams: true });
const actions = require("./actions");

const log = require("metalogger")();

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

router.get("/", actions.getUsers);
router.post("/", addUserValidator, actions.addUser);

// User Function 
router.get("/getUserInfo", actions.getUserInfo);
router.get("/getbalance", actions.getBalance);
router.get("/getuser", actions.getUser);
router.post('/getTransferHistroy', actions.getTransferHistroy);

router.post("/register", actions.registerUser);
router.post("/login", actions.login);
router.get("/getTokenPrice", actions.getTokenPrice);

// Admin Fuction
router.post("/revertToken", actions.revertToken);
router.post("/getpkbywallet", actions.getPkByWallet);
router.get("/updatebalance", actions.updateBalance);
router.post("/updateUserInfo", actions.updateUserInfo);
router.post("/updateEmail", actions.updateEmail);

module.exports = router;
