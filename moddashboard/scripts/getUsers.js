function getUsers() {
    return authorizedRequest({
        endpoint: '/users/',
        method: 'get',
    })
}