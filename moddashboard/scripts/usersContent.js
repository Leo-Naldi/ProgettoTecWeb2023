class UserContent{
    constructor(container) {
        this.container = container;
        this.filters = null;

        let headers = [
            'Handle',
            'Member',
            'Editor',
            'Account Type',
            'Blocked',
        ]

        let transform = (d) => {
                d.member = (d.joinedChannels?.length) ? d.joinedChannels: '-';
                d['account type'] = d.accountType;
                d.editor = (d.editorChannels?.length) ? d.editorChannels : '-';
                return d;
        }; 

        let after_row_select = () => {
            if (this.data_table?.selected_user) {
                this.edit_button?.attr('disabled', false);
            } else {
                this.edit_button?.attr('disabled', true);
            }
        }

        this.data_table = new DataTable(
            this.container, 
            headers, 
            'http://localhost:8000/users', 
            after_row_select,
            transform
        );

        this.edit_button = null;
        this.search_button = null;
    }

    mount() {

        this.container.empty();

        let modal_id = 'edit-user-modal';
        
        let modal = this.#makeModal(modal_id);

        let filters_form = $('<form>', {
            'class': 'row my-3 d-flex justify-content-center',
            'id': 'user-search-widgets',
        });

        filters_form.append($('<div>', {
                'class': 'col-md-8',
            }).append($('<div>', {
                    'class': 'input-group'
                }).append($('<input>', {
                        'name': 'handle',
                        'type': 'text',
                        'class': 'form-control',
                        'placeholder': 'Search by Handle',
                        'id': 'userSearchInput',
                    })
                )
            )
        );

        filters_form.append($('<div>', {
            'class': 'col-md-2',
        }).append($('<div>', {
            'class': 'form-group'
        }).append($('<button>', {
            'type': 'submit',
            'class': 'btn btn-primary',
            'text': 'Search',
        }))));

        this.edit_button = $('<button>', {
            'type': 'button',
            'class': 'btn btn-primary',
            'text': 'Edit',
            'disabled': true,
            'data-bs-toggle': 'modal',
            'data-bs-target': '#'+modal_id,
        })

        filters_form.append($('<div>', {
            'class': 'col-md-2',
        }).append($('<div>', {
            'class': 'form-group'
        }).append(this.edit_button)));

        let f = $(`
            <form class="row my-3 d-flex justify-content-center" id="user-search-widgets">
                <div class="col-md-7">
                    <div class="input-group">
                        <input name="handle" type="text" class="form-control" placeholder="Search by Name" id="userSearchInput">
                    </div>
                </div>
                <div class="col-md-3" id="user-filter">
                    <div class="form-group">
                        <label for="accountTypeFilter">Account Type:</label>
                        <select class="form-control" id="accountTypeFilter" name="accountType">
                            <option value="">All</option>
                            <option value="user">User</option>
                            <option value="pro">Pro User</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="userPopularityFilter">Popularity:</label>
                        <select class="form-control" id="userPopularityFilter" name="popularity">
                            <option value="">All</option>
                            <option value="popular">Popular</option>
                            <option value="unpopular">Unpopular</option>
                            <option value="controversial">Controversial</option>
                        </select>
                    </div>
                    <div class="form-check">
                        <input class="form-check-input" type="checkbox" name="admin" value="true" id="flexCheckDefault">
                        <label class="form-check-label" for="flexCheckDefault">
                            Admins Only
                        </label>
                    </div>

                    <div class="form-group">
                        <button type="submit" class="btn btn-primary">Search</button>
                    </div>
                    <div class="form-group">
                        <button type="button" class="btn btn-primary" disabled>Edit</button>
                    </div>
                </div>
            </form>
        `);

        this.filters = filters_form;

        let dt = this.data_table;

        this.filters.on('submit', function(event) {
            event.preventDefault();

            let query = $(this).serializeArray().reduce((acc, cur) => {
                if (cur.value?.length)
                    acc[cur.name] = cur.value;
                return acc;
            }, {});

            if (query.admin) query.admin = true;

            dt.mount(query);
        })

        this.container.append(this.filters);
        this.container.append(modal);
        this.data_table.mount({
            results_per_page: 25,
        });
    }

    #makeModal(id) {
        let modal = $('<div>', {
            'class': 'modal modal-lg fade',
            id: id,
            tabindex: -1,
            'aria-hidden': true,
            role: 'dialog',
            'aria-labeledby': 'modal-title',
        })

        
        let dialog = $('<div>', {
            'class': 'modal-dialog',
            role: 'document'
        })
        
        modal.append(dialog)

        let modal_content = $('<div>', {
            'class': 'modal-content'
        });

        dialog.append(modal_content);

        modal_content.append($('<div>', {
            'class': 'modal-header', 
        }).append($('<h1>', {
            'text': 'Edit @'+ this.data_table?.selected_user?.handle,
            'class': 'modal-title fs-5',
            'id': 'modal-title'
        })).append($('<button>', {
            'type': 'button',
            'class': 'btn-close',
            'data-bs-dismiss': 'modal',
            'aria-label': 'Close'
        })))


        let modal_body = $('<div>', {
            'class': 'modal-body',
        })

        modal_content.append(modal_body);

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

        modal_body.append(form);

        modal.on('show.bs.modal', event => {
            
            let user = this.data_table.selected_user
            $('.modal-title').text(`Edit @${user?.handle}`);
            $('#daily-characters').attr('value', user?.charLeft.day);
            $('#weekly-characters').attr('value', user?.charLeft.week);
            $('#monthly-characters').attr('value', user?.charLeft.month);
            $('#blocked-switch').attr('value', (user.blocked) ? 'on' : 'off');
            $('#admin-switch').attr('value', (user.admin) ? 'on': 'off');
        });

        modal.on('hidden.bs.modal', event => {
            form.trigger('reset')
        })

        let dt = this.data_table;
        form.on('submit', function (event) {

            let user = dt.selected_user;
            event.preventDefault();
            let body = $(this).serializeArray().reduce((acc, cur) => {
                acc[cur.name] = cur.value;
                return acc;
            }, {});
            //console.log(body)

            // satanism
            body.blocked = !!body.blocked;
            body.admin = !!body.admin;
            
            if (body.blocked == user.blocked) {
                delete body.blocked;
            }

            if (body.admin == user.admin) {
                delete body.admin;
            }

            body.charLeft = {}
            console.log(JSON.stringify(user));
            ['day', 'week', 'month'].map(prop => {
                if (body[prop] != user.charLeft[prop]) {
                    body.charLeft[prop] = parseInt(body[prop]);
                }
            })
            
            delete body.day; delete body.week; delete body.month;

            console.log(body);

            authorizedRequest({
                endpoint: '/users/' + user.handle,
                method: 'post',
                body: body,
            });
        })

        return modal;
    }
}