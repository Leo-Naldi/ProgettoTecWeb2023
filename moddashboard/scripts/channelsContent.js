class ChannelsContent {

    constructor(container, socket) {
        this.container = container;
        this.filters = null;

        let headers = [
            'Name',
            'Creator',
            'Description',
            'Members',
            'Editors',
        ]

        let transform = _.identity;

        let display = (d, header) => {
            if (header === 'Members') {
                return d.members?.map(h => `@${h}`).join(', ');
            } else if (header === 'Editors') {
                return d.editors?.map(h => `@${h}`).join(', ');
            } else if (header === 'Creator') {
                return `@${d.creator}`
            } 

            return d[header.toLowerCase()];
        }

        let after_row_select = () => {
            if (this.data_table?.selected_item) {
                this.edit_button?.attr('disabled', false);
                this.delete_button?.attr('disabled', false);
            } else {
                this.edit_button?.attr('disabled', true);
                this.delete_button?.attr('disabled', true);
            }
        }

        this.table_container = $('<div>');
        this.data_table = new DataTable(
            this.table_container,
            headers,
            '/channels/',
            after_row_select,
            'Channels',
            transform,
            display,
            25,
            { official: true },
            'channel',
            socket,
        );

        this.edit_button = null;
        this.search_button = null;
        this.delete_button = null;
    }

    mount() {

        this.container.empty();

        let edit_modal_id = 'edit-channel-modal';

        let modal = this.#makeEditDescriptionModal(edit_modal_id);

        let new_channel_modal_id = 'create-channel-modal';
        let new_channel_modal = this.#makeChannelCreationModal(new_channel_modal_id);

        let s = `
            <form id="message-search">     
                <div class="my-3 row form-group">
                    <div class="col-md-8">
                        <input class="form-control" name="name" type="text" placeholder="Channel Name..." id="name-search-input"> 
                    </div>
                    <div id="message-search-buttons" class="col-auto d-flex">
                        <button type="submit" class="btn btn-primary" class="mx-1">Search</button>
                    </div>
                </div>
            </form>
        `

        let filters_form = $(s);

        this.edit_button = $('<button>', {
            'type': 'button',
            'class': 'btn btn-primary mx-2',
            'text': 'Edit',
            'disabled': true,
            'data-bs-toggle': 'modal',
            'data-bs-target': '#' + edit_modal_id,
        })

        let new_button = $('<button>', {
            'type': 'button',
            'class': 'btn btn-primary',
            'text': 'Create',
            'data-bs-toggle': 'modal',
            'data-bs-target': '#' + new_channel_modal_id,
        });

        this.delete_button = $(`
            <button class="btn btn-danger mx-1" disabled>
                <i class="bi bi-trash"></i>
            </button>
        `)

        filters_form.find('#message-search-buttons').append(this.edit_button);
        filters_form.find('#message-search-buttons').append(new_button);
        filters_form.find('#message-search-buttons').append(this.delete_button);

        this.filters = filters_form;

        let dt = this.data_table;

        this.filters.on('submit', function (event) {
            event.preventDefault();

            let query = $(this).serializeArray().reduce((acc, cur) => {
                if (cur.value?.length)
                    acc[cur.name] = cur.value;
                return acc;
            }, {});


            dt.filter = { ...query, official: true };
        })
        this.delete_button.on('click', (event) => {
            event.preventDefault();
            authorizedRequest({
                endpoint: `/channels/${this.data_table.selected_item.name}`,
                method: 'delete',
            }).then(() => {
                $('#name-search-input').val('')
                this.data_table.filter = { official: true }
            });

            this.edit_button?.attr('disabled', true);
            this.delete_button?.attr('disabled', true);

        })

        this.container.append(this.filters);
        this.container.append(modal);
        this.container.append(new_channel_modal);
        this.container.append(this.table_container);
        this.data_table.mount();
    }

    #makeEditDescriptionModal(id) {

        let modal_headers = [
            $('<h1>', {
                'text': 'Edit §' + this.data_table?.selected_item?.id + "'s description",
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
            <form id="edit-channel-form">
                <div class="mb-3">
                    <textarea id="description" name="description" class="form-control" type="text"></textarea>
                </div>
                <div class="mt-1 d-flex flex-row-reverse">
                    <button type="submit" class="btn btn-primary">Save</button>
                </div>
            </form>
        `);

        let onSohw = event => {

            let channel = this.data_table.selected_item;

            $('.modal-title').text(`Edit Channel §${channel.name}'s description`);
            $('#description').attr('value', channel.description);
        };

        let onHide = event => {
            form.trigger('reset');
        };

        let modal = makeModDashboardModal(id, modal_headers, form, onSohw, onHide);

        let dt = this.data_table;
        let channel_cont = this;
        
        form.on('submit', function (event) {

            let channel = dt.selected_item;
            event.preventDefault();
            let body = $(this).serializeArray().reduce((acc, cur) => {
                acc[cur.name] = cur.value;
                return acc;
            }, {});

            authorizedRequest({
                endpoint: `/channels/${channel.name}`,
                method: 'put',
                body: body,
            }).then(() => {
                modal.modal('hide');
                dt.mount();
            });

            channel_cont.edit_button?.attr('disabled', true);
        })

        return modal;
    }

    #makeChannelCreationModal(id) {

        let modal_headers = [
            $('<h1>', {
                'text': 'New Official Channel',
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
            <form id="create-channel-form">
                <div class="mb-3">
                    <label for="name" class="form-label">Channel's Name</label>
                    <input id="name" name="name" class="form-control" type="text" />
                </div>
                <div class="mb-3">
                    <label for="description" class="form-label">Channel's Descrtiption</label>
                    <input id="description" name="description" class="form-control" type="text" />
                </div>
                <div class="mt-1 d-flex flex-row-reverse">
                    <button type="submit" class="btn btn-primary">Save</button>
                </div>
            </form>
        `);

        let onHide = event => {
            form.trigger('reset');
        };

        let modal = makeModDashboardModal(id, modal_headers, form, ()=>{}, onHide);

        let dt = this.data_table;

        form.on('submit', function (event) {

            event.preventDefault();
            let body = $(this).serializeArray().reduce((acc, cur) => {
                acc[cur.name] = cur.value;
                return acc;
            }, {});

            let name = body.name;
            delete body.name;
            body.official = true;

            authorizedRequest({
                endpoint: `/channels/${name}`,
                method: 'post',
                body: body,
            }).then(() => {
                modal.modal('hide');
                dt.mount();
            });
        })

        return modal;
    }
}