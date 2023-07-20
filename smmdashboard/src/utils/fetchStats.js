import dayjs from "dayjs";

export const time_periods = [
    'Today',
    'This Week',
    'This Month',
    'This Year',
    'All Time',
];

export function getAfterDate(timePeriod, created) {

    let ret_val = null;

    switch (timePeriod) {
        case 'Today':
            ret_val = dayjs().startOf('day');
            break;
        case 'This Week':
            ret_val =  dayjs().startOf('week');
            break;
        case 'This Month':
            ret_val =  dayjs().startOf('month');
            break;
        case 'This Year':
            ret_val =  dayjs().startOf('year');
            break;
        case 'All Time':
            ret_val = created;
            break;
        default:
            throw Error(`Unknown time period: ${timePeriod}`); // Invalid time period
    }

    if (created.isAfter(ret_val)) ret_val = created;

    return ret_val;
}


function getDatesBetween(startDate, endDate, n) {

    if (!startDate) throw Error("Start date was Null")

    let dates = [new dayjs(startDate)];
    const startTime = startDate.valueOf();
    const endTime = endDate.valueOf();
    const interval = Math.floor((endTime - startTime) / (n + 1));

    for (let i = 1; i <= n; i++) {
        let date = new dayjs(startTime + interval * i);
        date = date.minute(0)
        dates.push(date);
    }

    return dates;
}



export function getCheckpoints(period, num, created=null) {

    let after = getAfterDate(period, created);

    if (after === null) after = new dayjs(0);

    return getDatesBetween(after, new dayjs(), num);
}

export default function fetchCheckPointData(before, after, handle, token) {

    // Define the base URL
    const baseUrl = `http://localhost:8000/users/${handle}/messages/stats`;

    // Create a new URL object
    const url = new URL(baseUrl);

    // Create a new URLSearchParams object
    const params = new URLSearchParams();

    // Add query parameters
    params.append('before', before.toISOString());
    params.append('after', after.toISOString());

    // Attach the query parameters to the URL
    url.search = params.toString();

    return fetch(url.href, {
        headers: {
            'Authorization': 'Bearer ' + token,
        }
    })
}