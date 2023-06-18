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
            return new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
        case 'This Week':
            const firstDayOfWeek = currentDate.getDate() - currentDate.getDay();
            return new Date(currentDate.getFullYear(), currentDate.getMonth(), firstDayOfWeek);
        case 'This Month':
            return new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        case 'This Year':
            return new Date(currentDate.getFullYear(), 0, 1);
        case 'All Time':
            return null; // Or the appropriate start date for your system
        default:
            return null; // Invalid time period
    }
}


function getDatesBetween(startDate, endDate, n) {
    let dates = [];
    const startTime = startDate.getTime();
    const endTime = endDate.getTime();
    const interval = Math.floor((endTime - startTime) / (n + 1));

    for (let i = 1; i <= n; i++) {
        const date = new Date(startTime + interval * i);
        dates.push(date);
    }

    return dates;
}



export function getCheckpoints(period, num) {

    function getStartDate(timePeriod) {
        const currentDate = new Date();

        const start = getStartDate(period);

        if (start === null) {
            return null;
        }

        return getDatesBetween(start, new Date(), num);
    }

}

export default function fetchCheckPointData(start, end, handle, token) {
    
    let body = {
        before: end,
    }

    if (start) {
        body.after = start
    }
    
    return fetch(`http://localhost:8000/users/${handle}/messages/stats`, {
        method: "get",
        headers: {
            'Content-Type': 'application/json',
            'Authentication': 'Bearer ' + token,
        },
        body: JSON.stringify(body)
    }).then(res => {
        return {
            start: start,
            end: end,
            stats: JSON.parse(res.body)
        }
    })
}