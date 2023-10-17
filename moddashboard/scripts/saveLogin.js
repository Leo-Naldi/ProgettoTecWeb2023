function saveLogin(data) {
    localStorage.setItem('modDashboardData', JSON.stringify({
        ...data,
        timestamp: (new dayjs()).valueOf(),
    }));
}