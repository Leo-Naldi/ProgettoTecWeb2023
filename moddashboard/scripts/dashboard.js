let user_table = null;
let message_table = null;
let channel_table = null;


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

    let container = $('div.container');
    
    container.empty();

    let header = makeDashboardHeader();
    let users = makeUserContent();
    let messages = makeMessagesContent();
    let channels = makeChannelsContent();

    container.append(header);
    container.append(users);
    container.append(messages);
    container.append(channels);

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
        'class': 'container active-content',
        id: 'usersContent',
    })
    
    let users_content = new UserContent(result);
    users_content.mount();

    return result;
}

function makeMessagesContent() {
    return $(`
        <div class="content" id="messagesContent">
            <div class="row my-3 d-flex justify-content-center" id="message-search-widgets">     
                <div class="col-md-5" id="filter-dropdowns">
                    <div class="form-group">
                        <label for="authorSearchInput">Author:</label>
                        <input type="text" class="form-control" placeholder="Author..." id="authorSearchInput"> 
                    </div>
                    <div class="form-group">
                        <label for="destField">Destined To:</label>
                        <input type="text" class="form-control" id="destField">
                    </div>
                    <div class="form-group">
                        <label for="dateFilter">Date:</label>
                        <input type="date" class="form-control" id="dateFilter">
                    </div>
                </div>
            </div>

        </div>
    `)
}

function makeChannelsContent() {
    return $(`
        <div class="content" id="channelsContent">
            <!-- Channels content goes here -->
            <h2>Channels Content</h2>
        </div>
    `)
}

function addTabClickListeners() {
    $(".nav-link").click(function () {
        // Remove the 'active' class from all tabs
        $(".nav-link").removeClass("active");
        // Add the 'active' class to the clicked tab
        $(this).addClass("active");

        // Hide all content sections
        $(".content").removeClass("active-content");

        // Show the corresponding content section based on the clicked tab
        var tabId = $(this).attr("id").replace("Tab", "Content");
        $("#" + tabId).addClass("active-content");
    });
}
