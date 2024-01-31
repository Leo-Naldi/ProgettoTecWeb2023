class UserContent{

    constructor(container, socket) {
        this.container = container;
        this.filters = null;

        let headers = [
            'Handle',
            'Member',
            'Editor',
            'Account Type',
            'Likes',
            'Dislikes',
            'Blocked',
        ]

        let transform = (d) => {
            let res = _.clone(d);

            res.member = (res.joinedChannels?.length) ? res.joinedChannels.join(', '): '-';
            res['account type'] = res.admin ? "Administrator": ((res.accountType === 'pro') ? 'Pro User': 'Free User');
            res.editor = (res.editorChannels?.length) ? res.editorChannels.join(', ') : '-';
            res.blocked = res.blocked ? 'Yes': 'No';
            res.likes = res.total_likes;
            res.dislikes = res.total_dislikes;
            
            return res;
        }; 

        let after_row_select = () => {
            if (this.data_table?.selected_item) {
                this.edit_button?.attr('disabled', false);
            } else {
                this.edit_button?.attr('disabled', true);
            }
        }

        this.table_container = $('<div>');
        this.data_table = new DataTable(
            this.table_container, 
            headers, 
            '/users/', 
            after_row_select,
            'Squealer Users',
            transform,
            (data, header) => (data[header.toLowerCase()]),
            25,
            {},
            'user',
            socket,
        );

        this.edit_button = null;
        this.search_button = null;
    }

    mount() {

        this.container.empty();

        let modal_id = 'edit-user-modal';
        
        let modal = this.#makeModal(modal_id);


        this.edit_button = $('<button>', {
            'type': 'button',
            'class': 'btn btn-primary ml-2',
            'text': 'Edit',
            'disabled': true,
            'data-bs-toggle': 'modal',
            'data-bs-target': '#' + modal_id,
            'aria-controls': modal_id,
            'aria-haspopup': "dialog",
            'aria-expanded': undefined,
        });

        this.edit_button.on('click', () => {
            this.edit_button.attr('aria-expanded', 
                this.edit_button.attr('aria-expanded') === 'true' ? undefined: 'true');
        })

        let edit_div = $('<div>', {
            'class': 'd-flex flex-row-reverse col-md-2 py-2',
        })

        edit_div.append(this.edit_button);

        let form = $(`
            <form class="col-md-10" id="user-search-widgets" role="search">
                <div class="row my-2">
                    <div class="col-md-6">
                        <input type="text" class="form-control" name="handle" placeholder="Search by Handle..." id="userSearchInput" />
                    </div>
                    <div class="col-md-2">
                        <select class="form-select" aria-label="Select User Type" id="select-user-type">
                            <option value="all" selected>Any</option>
                            <option value="pro">Pro Users</option>
                            <option value="user">Free Users</option>
                            <option value="admin">Administrators</option>
                        </select>
                    </div>
                    <div class="col-md-3">
                        <div class="row">
                            <div class="col-auto">
                                <label for="select-user-sort" class="col-form-label">Sort By:</label>
                            </div>
                            <div class="col-auto">
                                <select class="form-select" id="select-user-sort">
                                    <option value="-created" selected>Creation Date</option>
                                    <option value="popular">Popularity</option>
                                    <option value="unpopular">Unpopularity</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-1">
                        <input type="submit" class="btn btn-primary" value="Search" />
                    </div>
                
                </div>
            </form>
        `);

        let form_div = $('<div>', {
            'class': 'row'
        })

        form_div.append(form);
        form_div.append(edit_div);

        this.filters = form;

        let dt = this.data_table;

        this.filters.on('submit', function(event) {
            event.preventDefault();

            let query = $(this).serializeArray().reduce((acc, cur) => {
                if (cur.value?.length)
                    acc[cur.name] = cur.value;
                return acc;
            }, {});

            if (query.admin) query.admin = true;

            let user_type = $('select#select-user-type').val();

            if ((user_type === 'user') || (user_type === 'pro')) {
                query.accountType = user_type;
                query.admin = false;
            } else if (user_type === 'admin') {
                query.admin = true;
            }

            let sort = $('select#select-user-sort').val();

            if (sort === '-created') {
                query.sort = sort;
            } else {
                query.popularity = sort;
            }

            dt.filter = query;
        })

        this.container.append(form_div);
        this.container.append(modal);
        this.container.append(this.table_container);
        this.data_table.mount();
    }

    #makeModal(id) {

        let modal_headers = [
            $('<h1>', {
                'text': 'Edit @' + this.data_table?.selected_item?.handle,
                'class': 'modal-title fs-5',
                'id': 'modal-title'
            }),
            $('<button>', {
                'type': 'button',
                'class': 'btn-close',
                'data-bs-dismiss': 'modal',
                'aria-label': 'Close'
            }),
        ]
        

        let form = $(`
            <form>
                <div class="mb-3">
                    <label class="form-label" for="daily-characters">Daily Charachters</label>
                    <input name="day" class="form-control" type="number" min="0" id="daily-characters" />
                </div>
                <div class="mb-3">
                    <label class="form-label" for="weekly-characters">Weekly Charachters</label>
                    <input name="week" class="form-control" type="number" min="0" id="weekly-characters" />
                </div>
                <div class="mb-3">
                    <label class="form-label" for="monthly-characters">Monthly Characters</label>
                    <input name="month" class="form-control" type="number" min="0" id="monthly-characters" />
                </div>
                <div class="form-check form-switch mb-2">
                    <label class="form-check-label" for="blocked-switch">Blocked</label>
                    <input name="blocked" value="true" class="form-check-input" type="checkbox" role="switch" id="blocked-switch">
                </div>
                <div class="form-check form-switch mb-2">
                    <label class="form-check-label" for="admin-switch">Admin</label>
                    <input name="admin" value="true" class="form-check-input" type="checkbox" role="switch" id="admin-switch">
                </div>
                <div class="d-flex flex-row-reverse">
                    <button type="submit" class="btn btn-primary">Save</button>
                </div>
            </form>
        `);

        let onSohw = event => {

            let user = this.data_table.selected_item;
            $('.modal-title').text(`Edit @${user?.handle}`);
            $('#daily-characters').attr('value', user?.charLeft.day);
            $('#weekly-characters').attr('value', user?.charLeft.week);
            $('#monthly-characters').attr('value', user?.charLeft.month);
            $('#blocked-switch').attr('checked', user.blocked);
            $('#admin-switch').attr('checked', user.admin);
        };

       let onHide = event => {
            form.trigger('reset');
        };

        let modal = makeModDashboardModal(id, modal_headers, form, onSohw, onHide);

        let dt = this.data_table;
        let user_cont = this;
        form.on('submit', function (event) {

            let user = dt.selected_item;
            event.preventDefault();
            let body = $(this).serializeArray().reduce((acc, cur) => {
                acc[cur.name] = cur.value;
                return acc;
            }, {});

            // satanism, since checkbocks give no value if they are not checked
            body.blocked = !!body.blocked;
            body.admin = !!body.admin;

            if (body.blocked == user.blocked) {
                delete body.blocked;
            }

            if (body.admin == user.admin) {
                delete body.admin;
            }

            let charLeft = {
                day: body.day,
                week: body.week,
                month: body.month,
            }
            body.charLeft = _.mapObject(charLeft, function (val, key) { return parseInt(val) });

            delete body.day; delete body.week; delete body.month;

            authorizedRequest({
                endpoint: '/users/' + user.handle,
                method: 'post',
                body: body,
            });

            modal.modal('hide');
            dt.mount();
            user_cont.edit_button?.attr('disabled', true);
        })

        return modal;
    }
}