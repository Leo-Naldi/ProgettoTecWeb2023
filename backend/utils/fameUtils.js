const dayjs = require('dayjs');
let isBetween = require('dayjs/plugin/isBetween')
dayjs.extend(isBetween)

const config = require('../config');


function checkThreshold(x, threshold = config.fame_threshold) {
    return x >= threshold;
}

function isPopular(reactions) {
    return checkThreshold(reactions.positive) && !checkThreshold(reactions.negative)
}

function isUnpopular(reactions) {
    return !checkThreshold(reactions.positive) && checkThreshold(reactions.negative)
}

function isControversial(reactions) {
    return checkThreshold(reactions.positive) && checkThreshold(reactions.negative)
}

function atRiskOfUnpopular(reactions) {
    return !(checkThreshold(reactions.positive, config.danger_threshold) || isUnpopular(reactions)) &&
        checkThreshold(reactions.negative, config.danger_threshold);
}

function atRiskOfPopular(reactions) {

    // not at risk of unpopular, not yet popular, about to be popular

    return !(checkThreshold(reactions.negative, config.danger_threshold) || isPopular(reactions)) &&
        checkThreshold(reactions.positive, config.danger_threshold);
}

function atRiskOfControversial(reactions) {

    return checkThreshold(reactions.positive, config.danger_zone) &&
        checkThreshold(reactions.negative, config.danger_zone) &&
        !(isPopular(reactions) && isUnpopular(reactions));
}

function checkFame(reactions, fame) {

    switch (fame) {
        case 'popular':
            return isPopular(reactions);
        case 'unpopular':
            return isUnpopular(reactions);
        case 'controversial':
            return isControversial(reactions)
        default:
            throw Error(`checkFame: unknown fame value '${fame}'`);
    }

}

function checkRiskOfFame(reactions, fame) {

    switch (fame) {
        case 'popular':
            return atRiskOfPopular(reactions);
        case 'unpopular':
            return atRiskOfUnpopular(reactions);
        case 'controversial':
            return atRiskOfControversial(reactions)
        default:
            throw Error(`checkFame: unknown fame value '${fame}'`);
    }

}

module.exports = {
    checkThreshold,
    isPopular,
    isUnpopular,
    isControversial,
    atRiskOfControversial,
    atRiskOfPopular,
    atRiskOfUnpopular,
    checkFame,
    checkRiskOfFame,
}