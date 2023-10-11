$(function() {

    let mod_data = localStorage.getItem('modDashboardData');

    if (mod_data) mod_data = JSON.parse(mod_data);

    if (mod_data?.token) {

        const timestamp = new dayjs(mod_data.timestamp);
        const exp = timestamp.add(1, 'week');

        if ((new dayjs()).isBefore(exp)) {
            
            window.location.href = dasboard_href; 
        }
    }

    $("form").on('submit', function(event) {
        event.preventDefault();

        let body = $(this).serializeArray().reduce((acc, cur) => {
            acc[cur.name] = cur.value;
            return acc;
        }, {});
        
        unauthorizedRequest({
            endpoint: '/auth/login/admin',
            method: 'post',
            body: JSON.stringify(body),
        }).then(res => {
            if (res.ok) {
                return res.json().then(data => {
                    saveLogin(data);
                    window.location.href = dasboard_href;
                })
            } else {
                alert('Username or password did not work');
            }
        }).catch(err => console.log(err))
    })
});