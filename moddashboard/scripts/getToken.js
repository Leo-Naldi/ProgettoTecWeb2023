function getToken() {
    let mem = localStorage.getItem('modDashboardData');

    return (mem) ? JSON.parse(mem).token : null;
}