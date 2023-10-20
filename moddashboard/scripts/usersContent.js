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
            role: 'dialog'
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
            'class': 'modal-header'  
        }).append($('<h1>', {
            'text': 'Edit @'+ this.data_table?.selected_user?.handle,
            'class': 'modal-title fs-5'
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

        modal_content.append($('<div>', {
            'class': 'modal-footer',
        }).append($('<button>', {
            type: 'button',
            text: 'Save',
            'class': 'btn btn-primary',
        })));

        let daily_input = $('<input>', {
            type: 'number',
            min: 0,
            id: 'daily-input',
            'class': 'form-control',
        });

        let daily_label = $('<label>', {
            for: 'daily-input',
            'class': 'form-label',
            text: 'Daily Characters'
        });

        let daily_input_group = $('<div>', {
            'class': 'input-group mb-3',
        });

        daily_input_group.append(daily_label);
        daily_input_group.append(daily_input);

        let weekly_input = $('<input>', {
            type: 'number',
            min: 0,
            id: 'weekly-input',
            'class': 'form-control',
        });

        let weekly_label = $('<label>', {
            for: 'weekly-input',
            'class': 'form-label',
            text: 'Weekly Characters'
        });

        let weekly_input_group = $('<div>', {
            'class': 'input-group mb-3',
        });

        weekly_input_group.append(weekly_label);
        weekly_input_group.append(weekly_input);

        let montly_input = $('<input>', {
            type: 'number',
            min: 0,
            id: 'montly-input',
            'class': 'form-control',
        });

        let montly_label = $('<label>', {
            for: 'montly-input',
            'class': 'form-label',
            text: 'Montly Characters'
        });

        let montly_input_group = $('<div>', {
            'class': 'input-group mb-3',
        });

        montly_input_group.append(montly_label);
        montly_input_group.append(montly_input);

        let form = $(`
            <form>
                <div class="mb-3">
                    <label class="form-label" for="daily-characters">Daily Charachters</label>
                    <input class="form-control" type="number" min="0" id="daily-characters" />
                </div>
                <div class="mb-3">
                    <label class="form-label" for="weekly-characters">Weekly Charachters</label>
                    <input class="form-control" type="number" min="0" id="weekly-characters" />
                </div>
                <div class="mb-3">
                    <label class="form-label" for="monthly-characters">Monthly Characters</label>
                    <input class="form-control" type="number" min="0" id="monthly-characters" />
                </div>
            </form>
        `);

        //form.append(daily_input);
        //form.append(weekly_input);
        //form.append(montly_input);


        modal_body.append(form);

        modal.on('show.bs.modal', event => {
            
            let user = this.data_table.selected_user
            $('.modal-title').text(`Edit @${user?.handle}`);
            $('#daily-characters').attr('value', user?.charLeft.day);
            $('#weekly-characters').attr('value', user?.charLeft.week);
            $('#monthly-characters').attr('value', user?.charLeft.month);
        })

        return modal;
    }
}