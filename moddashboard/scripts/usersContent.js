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
            let res = _.clone(d);

            res.member = (res.joinedChannels?.length) ? res.joinedChannels.join(', '): '-';
            res['account type'] = res.accountType;
            res.editor = (res.editorChannels?.length) ? res.editorChannels.join(', ') : '-';
            res.blocked = (res.blocked) ? 'true':'false';
            
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
            'http://site222346.tw.cs.unibo.it/users', 
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

            dt.filter = query;
        })

        this.container.append(this.filters);
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
            form.trigger('reset')
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