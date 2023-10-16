function saveLogin(data) {s
    localStorage.setItem('modDashboardData', JSON.stringify({
        ...data,
        timestamp: (new dayjs()).valueOf(),
    }));
}