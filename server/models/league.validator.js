// league.validator.js, 2021, FG
// Defines validators used for league related requests
// ------------------------------------------------------------------------

const check = require('express-validator').check;
const constants = require('../misc/constants');

// Validator for league creation form
const LeagueCreationValidator = [
    check('name')
        .exists()
        .withMessage(constants.NAME_IS_MISSING)
        .isLength({min: 1})
        .withMessage(constants.NAME_TOO_SHORT)
        .isLength({max: 30})
        .withMessage(constants.NAME_TOO_LONG),
    check('rosterSize')
        .exists()
        .withMessage(constants.ROSTER_SIZE_IS_MISSING)
        .isInt()
        .withMessage(constants.EXPECTED_INT)
        .isInt({min: 3})
        .withMessage(constants.ROSTER_SIZE_TOO_SMALL)
        .isInt({max: 30})
        .withMessage(constants.ROSTER_SIZE_TOO_BIG),
    check('eventLineupSize')
        .exists()
        .withMessage(constants.EVENT_LINEUP_SIZE_IS_MISSING)
        .isInt()
        .withMessage(constants.EXPECTED_INT)
        .isInt({min: 3})
        .withMessage(constants.EVENT_LINEUP_SIZE_TOO_SMALL)
        .isInt({max: 30})
        .withMessage(constants.EVENT_LINEUP_SIZE_TOO_BIG),
    check('eventCountSize')
        .exists()
        .withMessage(constants.EVENT_COUNT_SIZE_IS_MISSING)
        .isInt()
        .withMessage(constants.EXPECTED_INT)
        .isInt({min: 3})
        .withMessage(constants.EVENT_LINEUP_COUNT_SIZE_TOO_SMALL)
        .isInt({max: 30})
        .withMessage(constants.EVENT_LINEUP_COUNT_SIZE_TOO_BIG)
];

module.exports = LeagueCreationValidator;