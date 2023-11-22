class MessageContent{

    constructor(container) {
        this.container = container;
        this.filters = null;

        let headers = [
            'Author',
            'Channels',
            'Users',
            'Text',
            'Image',
            'Geo',
            'Privacy',
        ]

        let transform = (d) => {
            let res = _.clone(d);

            res.channels = res.dest.filter(dest => dest.charAt(0) === '§');
            res.users = res.dest.filter(dest => dest.charAt(0) === '@');
            res.public = res.publicMessage;
            res.privacy = res.public ? 'Public': 'Private';

            return res;
        };

        let display = (d, header) => {
            
            if (header == 'Text') {
                return d.content.text || '-';
            } else if (header == 'Image') {
                if (d.content.image) {
                    return $("<a>", {
                        href: d.content.image,
                        text: 'Image',
                    });
                } else {
                    return '-'
                }
            } else if (header == 'Geo') {
                if (d.content.geo) {
                    console.log(d.content.geo)
                    return $("<a>", {
                        href: `https://www.google.com/maps/search/?api=1&query=${d.content.geo.coordinates[1]},${d.content.geo.coordinates[0]}`,
                        text: 'Location',
                    });
                } else {
                    return '-';
                }
            }
            
            let res = d[header.toLowerCase()];
            
            if (_.isArray(res)) {
                if (res.length) {
                    return res.join(', ');
                } else {
                    return '-';
                }
            } else {
                return res;
            }

            let result = $('<div>', {
                'class': 'ellipsis-text'
            });
            
            if (d.content.text) {
                result.append($('<div>', {
                    'class': 'ellipsis-text',
                    text: d.content.text
                }));
            }

            return result;
        }

        let display2 = () => 'content';

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
            'http://localhost:8000/messages/',
            after_row_select,
            transform,
            display,
        );

        this.edit_button = null;
        this.search_button = null;
    }

    mount() {

        this.container.empty();

        let modal_id = 'edit-messages-modal';

        let modal = this.#makeModal(modal_id);

        let s = `
        
            <form id="message-search>     
                <div class="mb-3">
                    <label class="form-label" for="authorSearchInput">Author</label>
                    <input type="text" class="form-control" placeholder="Author..." id="authorSearchInput"> 
                </div>
                <div class="form-group">
                    <label class="form-label" for="destField">Destined To</label>
                    <input type="text" class="form-control" id="destField">
                </div>
                <div class="form-group">
                    <label class="form-label" for="before-filter">Before</label>
                    <input type="date" class="form-control" id="before-filter">
                </div>
                <div class="form-group">
                    <label class="form-label" for="after-filter">After</label>
                    <input type="date" class="form-control" id="after-filter">
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
            'class': 'btn btn-primary',
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

            if (query.admin) query.admin = true;

            dt.filter = query;
        })

        this.container.append(this.filters);
        this.container.append(modal);
        this.container.append(this.table_container);
        this.data_table.mount();
    }

    #makeModal(id) {

        // TODO add list items
        let modal_headers = [
            $('<h1>', {
                'text': 'Edit Message ' + this.data_table?.selected_item?.id,
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
                    <label class="form-label" for="positive-reactions">Likes</label>
                    <input name="positive" class="form-control" type="number" min="0" id="positive-reactions" />
                </div>
                <div class="mb-3">
                    <label class="form-label" for="negative-reactions">Likes</label>
                    <input name="negative" class="form-control" type="number" min="0" id="negative-reactions" />
                </div>
                <div class="d-flex flex-row-reverse">
                    <button type="submit" class="btn btn-primary">Save</button>
                </div>
            </form>
        `);

        let onSohw = event => {

            let message = this.data_table.selected_item;
            $('.modal-title').text(`Edit Message ${message.id}`);
            $('#positive-reactions').attr('value', message?.reactions.positive);
            $('#negative-reactions').attr('value', message?.reactions.negative);
        };

        let onHide = event => {
            form.trigger('reset')
        };

        let modal = makeModDashboardModal(id, modal_headers, form, onSohw, onHide);

        let dt = this.data_table;
        let message_cont = this;
        form.on('submit', function (event) {

            let message = dt.selected_item;
            event.preventDefault();
            let body = $(this).serializeArray().reduce((acc, cur) => {
                acc[cur.name] = cur.value;
                return acc;
            }, {});

            let reactions = {
                positive: body.positive,
                negative: body.negative,
            }
            body.reactions = _.mapObject(reactions, function (val, key) { return parseInt(val) });

            delete body.positive; delete body.negative;

            authorizedRequest({
                endpoint: '/messages/' + message.id,
                method: 'post',
                body: body,
            });

            modal.modal('hide');
            dt.mount();
            message_cont.edit_button?.attr('disabled', true);
        })

        return modal;
    }
}