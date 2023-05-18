const dayjs = require('dayjs');

function getRandom(maximum) {

    // Random int between 0 and max, 0 included max excluded,
    return Math.floor(Math.random() * maximum);
}

function getDateWithin(timeperiod) {

    let baseRes = dayjs().startOf('day')

    switch (timeperiod) {
        case 'today':

            break;  // Base res is fine

        case 'week':

            // Return a random date within the past week
            baseRes = baseRes.startOf('week').add(getRandom(8), 'day')
            break;

        case 'month':
            // Return a random date within the past month
            baseRes = baseRes.startOf('month')
                .add(getRandom(dayjs().date() + 1), 'day')
            break;

        case 'year':

            baseRes = baseRes.startOf('year')
                .add(getRandom(dayjs().month() + 1), 'month');  // months are 0 indexed
            baseRes = baseRes.add(getRandom(baseRes.daysInMonth() + 1), 'day');

            break;
        default:
            throw Error(`getDateWithin unknown time period: ${timeperiod}`);
    }

    baseRes = baseRes.add(getRandom(24), 'hour')
        .add(getRandom(60), 'minute')
        .add(getRandom(60), 'second');

    // Since we added random hour/min/secs we could end up with a date in the future
    if (baseRes.isAfter(dayjs(), 'second'))
        baseRes = dayjs();

    return baseRes;
}

module.exports = { getRandom, getDateWithin }