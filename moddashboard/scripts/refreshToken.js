let refresh_token_interval = null;

function refreshToken() {

    let mem = localStorage.getItem('modDashboardData');
    if (!mem) throw Error('Called refresh token but no token was present');

    let data = JSON.parse(mem);

    authorizedRequest({
        endpoint: '/auth/refresh',
        token: data.token,
        method: 'post',
    }).then(res => res.json())
    .then(d => {
        data.token = d.token;
        saveLogin(data);
    });
}

function startRefreshTokenInterval() {
    refresh_token_interval = setInterval(refreshToken, 36000);
}

function clearRefreshTokenInterval() {
    clearInterval(refresh_token_interval);
    refresh_token_interval = null;
}