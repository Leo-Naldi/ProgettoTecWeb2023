class ChannelsContent {

    constructor(container) {
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
            } else {
                this.edit_button?.attr('disabled', true);
            }
        }

        this.table_container = $('<div>');
        this.data_table = new DataTable(
            this.table_container,
            headers,
            'http://localhost:8000/channels/',
            after_row_select,
            transform,
            display,
            25,
            { official: true }
        );

        this.edit_button = null;
        this.search_button = null;
    }

    mount() {

        this.container.empty();

        let modal_id = 'edit-channel-modal';

        let modal = this.#makeEditDescriptionModal(modal_id);

        let s = `
            <form id="message-search>     
                <div class="my-3 form-group">
                    <label class="form-label" for="authorSearchInput">Name</label>
                    <input name="name" type="text" class="form-control" placeholder="Author..." id="authorSearchInput"> 
                </div>
            </form>
        `

        let filters_form = $(s);

        filters_form.append($('<div>', {
            'class': 'col-md-2',
        }).append($('<div>', {
            'class': 'form-group'
        }).append($('<button>', {
            'type': 'submit',
            'class': 'btn btn-primary my-2',
            'text': 'Search',
        }))));

        this.edit_button = $('<button>', {
            'type': 'button',
            'class': 'btn btn-primary',
            'text': 'Edit',
            'disabled': true,
            'data-bs-toggle': 'modal',
            'data-bs-target': '#' + modal_id,
        })

        filters_form.append($('<div>', {
            'class': 'col-md-2',
        }).append($('<div>', {
            'class': 'form-group'
        }).append(this.edit_button)));

        this.filters = filters_form;

        let dt = this.data_table;

        this.filters.on('submit', function (event) {
            event.preventDefault();

            let query = $(this).serializeArray().reduce((acc, cur) => {
                if (cur.value?.length)
                    acc[cur.name] = cur.value;
                return acc;
            }, {});


            dt.filter = query;
        })

        this.container.append(this.filters);
        this.container.append(modal);
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
            <form id="edit-message-form">
                <div class="mb-3">
                    <label class="form-label" for="positive-reactions">Description</label>
                    <input id="description" name="description" class="form-control" type="text" />
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
}