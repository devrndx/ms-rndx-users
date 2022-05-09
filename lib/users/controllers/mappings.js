const { spieler, check, matchedData, sanitize } = require('spieler')();

const router = require('express').Router({ mergeParams: true });
const actions = require('./actions');

const log = require("metalogger")();

const addUserValidator = spieler([
    check("email").exists().withMessage('email must be provided')
    .isEmail().withMessage('email format is invalid')
    .trim().normalizeEmail(),

    check('password', 'passwords must be at least 5 chars long and contain one number')
    .exists()
    .isLength({ min: 5 })
    .matches(/\d/)
]);

router.get('/', actions.getUsers);
router.post('/', addUserValidator, actions.addUser);
router.get('/getbalance', actions.getBalance);
router.get('/getuser', actions.getUser);
router.post('/register', actions.registerUser);
router.post('/login', actions.login);

// Admin Fuction
router.post('/revertToken', actions.revertToken);
router.post('/getpkbywallet', actions.getPkByWallet);
router.get('/updatebalance', actions.updateBalance);

module.exports = router;