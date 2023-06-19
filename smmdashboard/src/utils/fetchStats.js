import dayjs from "dayjs";

export const time_periods = [
    'Today',
    'This Week',
    'This Month',
    'This Year',
    'All Time',
];

export function getStartDate(timePeriod) {
    const currentDate = new Date();

    switch (timePeriod) {
        case 'Today':
            return dayjs().startOf('day');
        case 'This Week':
            return dayjs().startOf('week');
        case 'This Month':
            return dayjs().startOf('month');
        case 'This Year':
            return dayjs().startOf('year');
        case 'All Time':
            return dayjs().startOf('year').subtract(1, 'year'); // Or the appropriate start date for your system
        default:
            return null; // Invalid time period
    }
}


function getDatesBetween(startDate, endDate, n) {
    let dates = [];
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



export function getCheckpoints(period, num) {

    const start = getStartDate(period);

    if (start === null) {
        return null;
    }

    return getDatesBetween(start, new dayjs(), num);
}

export default function fetchCheckPointData(start, end, handle, token) {

    // Define the base URL
    const baseUrl = `http://localhost:8000/users/${handle}/messages/stats`;

    // Create a new URL object
    const url = new URL(baseUrl);

    // Create a new URLSearchParams object
    const params = new URLSearchParams();

    // Add query parameters
    params.append('before', end.toISOString());

    if (start) {
        params.append('after', start.toISOString());
    }

    // Attach the query parameters to the URL
    url.search = params.toString();

    return fetch(url.href, {
        headers: {
            'Authorization': 'Bearer ' + token,
        }
    })
}