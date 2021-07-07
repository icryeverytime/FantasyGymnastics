const check = require('express-validator').check;
const constants = require('../constant');

const teamValidation = [
    check('name')
        .exists()
        .withMessage(constants.NAME_IS_MISSING)
        .isLength({min: 1})
        .withMessage(constants.NAME_TOO_SHORT)
        .isLength({max: 30})
        .withMessage(constants.NAME_TOO_LONG),
];

module.exports = teamValidation;