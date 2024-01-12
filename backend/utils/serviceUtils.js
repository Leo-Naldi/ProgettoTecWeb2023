const _ = require('underscore');
const { logger } = require('../config/logging');

function makeGetResBody({ docs, page, results_per_page, results_f = _.identity }) {
    let res = {}

    if (page > 0) {
        res.results = docs.slice((page - 1) * results_per_page, page * results_per_page)
        res.pages = Math.ceil(docs.length / results_per_page);
    } else {
        res.pages = 1;
        res.results = docs;
    }

    res.results = results_f(res.results);

    return res;
}

module.exports = {
    makeGetResBody,
}