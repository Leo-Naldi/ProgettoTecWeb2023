let user_table = null;
let message_table = null;
let channel_table = null;
let container = null;
let tabs = null;


$(function () {
    
    let mem = localStorage.getItem('modDashboardData');

    let mod_data = (mem) ? JSON.parse(mem) :null;

    if (mod_data) {

        const timestamp = new dayjs(mod_data.timestamp);
        const exp = timestamp.add(1, 'week');

        if ((new dayjs()).isBefore(exp)) {
            refreshToken();
            mountDashboard();
        } else {
            mountLogin();
        }
    } else {
       mountLogin();
    }
    
});

function mountLogin() {
    $('div.container').empty();

    $('div.container').append(makeLogin());
    addLoginFormListeners();
}

function addLoginFormListeners() {
    $('#login-form').on('submit', function (event) {
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
                    console.log('aaaaaaa')
                    mountDashboard();
                })
            } else {
                $('form').prepend(`
                    <div class="alert alert-danger p-3 my-2">
                        Username or password did not work
                    </div>
                `);
            }
        }).catch(err => {
            $('form').prepend(`
                    <div class="alert alert-danger p-3 my-2">
                        Username or password did not work
                    </div>
            `);
            console.log(err);
        })
    });
}

function makeLogin() {
    let login_body =  $(`
        <div class="row justify-content-center mt-5" id="login-content">
            <div class="col-8">
                <div class="card">
                    <div class="card-header">
                        <h3>Login</h3>
                    </div>
                    <div class="card-body">
                        <form class="px-3" id="login-form">
                            <div class="mb-3">
                                <label for="handle" class="form-label">Handle</label>
                                <input type="text" name="handle" class="form-control" id="handle">
                            </div>
                            <div class="mb-3">
                                <label for="password" class="form-label">Password</label>
                                <input type="password" name="password" class="form-control" id="password">
                            </div>
                            <button type="submit" class="btn btn-primary">Log in</button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    `);

    return login_body;
}

function mountDashboard(){

    container = $('div.container');
    container.empty();
    startRefreshTokenInterval();

    tabs = makeDashboardHeader();
    let users = makeUserContent();

    container.append(tabs);

    let main = $('<main>');
    container.append(main);

    main.append(users);

    addTabClickListeners();
}

function makeDashboardHeader() {

    let ul = $('<ul>', {
        'class': 'nav nav-tabs',
    });

    ['Users', 'Messages', 'Channels'].map((val, i) => {

        let li = $('<li>', { "class": 'nav-item' });
        let a = $('<a>', {
            'class': (i === 0) ? 'nav-link active' : 'nav-link',
            id: val.toLowerCase() + 'Tab',
            text: val,
        });
        li.append(a);
        ul.append(li);
    })

    let header = $('<header>', { 'class': 'mt-2' });
    header.append(ul)

    return header;
}

function makeUserContent() {
    
    let result = $("<div>", {
        'class': 'container',
        id: 'usersContent',
    })
    
    let users_content = new UserContent(result);
    users_content.mount();

    return result;
}

function makeMessagesContent() {
    
    let result = $("<div>", {
        'class': 'container',
        id: 'messagesContent',
    })

    let messages_content = new MessageContent(result);
    messages_content.mount();

    return result;
}

function makeChannelsContent() {
    let result = $("<div>", {
        'class': 'container',
        id: 'channelsContent',
    })

    let channels_content = new ChannelsContent(result);
    channels_content.mount();

    return result;
}

function addTabClickListeners() {
    $(".nav-link").click(function () {
       
        if (!$(this).hasClass("active")) {

            $(".nav-link").removeClass("active");
            $(this).addClass("active");
            
            $('main').empty();
            let new_content_name = $(this).attr("id");
            let new_content = null;

            switch (new_content_name) {
                case 'usersTab': {
                    console.log('Switched to users');
                    new_content = makeUserContent();
                    break;
                } case 'messagesTab' : {
                    console.log('Switched to messages');
                    new_content = makeMessagesContent();
                    break;
                } case 'channelsTab' : {
                    new_content = makeChannelsContent();
                    break;
                } default: {
                    throw new Error(`Unknown content name: ${new_content_name}`);
                }
            }

            $('main').append(new_content);
        }
    });
}

