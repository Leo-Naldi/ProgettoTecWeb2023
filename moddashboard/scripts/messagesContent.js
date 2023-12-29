class MessageContent{

    constructor(container) {
        this.container = container;
        this.filters = null;

        let headers = [
            'Author',
            'Channels',
            'Users',
            'Published',
            'Text',
            'Media',
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
            } else if (header == 'Media') {
                if (d.content.image) {
                    return $("<a>", {
                        href: d.content.image,
                        text: 'Image',
                        target: '_blank',
                    });
                } else if (d.content.video) {
                    return $("<a>", {
                        href: d.content.image,
                        text: 'Video',
                        target: '_blank',
                    });
                } else {
                    return '-'
                }
            } else if (header == 'Geo') {
                if (d.content.geo) {
                    //console.log(d.content.geo)
                    return $("<a>", {
                        href: `https://www.google.com/maps/search/?api=1&query=${d.content.geo.coordinates[1]},${d.content.geo.coordinates[0]}`,
                        text: 'Location',
                        target: '_blank',
                    });
                } else {
                    return '-';
                }
            } else if (header == 'Published') {
                let val = new dayjs(d.meta.created);
                return val.format('DD/MM/YYYY, H:mm')
            }
            
            let res = d[header.toLowerCase()];
            
            if (_.isArray(res) && (res?.length)) {
                return res.join(', ');
            } else if (_.isArray(res) && (!res?.length)) {
                return '-';
            } else {
                return res;
            }
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
            'http://site222346.tw.cs.unibo.it/messages/',
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
                <div class="my-3 form-group">
                    <label class="form-label" for="authorSearchInput">Author</label>
                    <input name="author" type="text" class="form-control" placeholder="Author..." id="authorSearchInput"> 
                </div>
                <div class="form-group my-2">
                    <label class="form-label" for="destField">Destined To</label>
                    <input name="dest" type="text" class="form-control" id="destField" placeholder="e.g. @handle, §channel...">
                </div>
                <div class="form-group my-2">
                    <label class="form-label" for="before-filter">Before</label>
                    <input name="before" type="date" class="form-control" id="before-filter">
                </div>
                <div class="form-group my-2">
                    <label class="form-label" for="after-filter">After</label>
                    <input name="after" type="date" class="form-control" id="after-filter">
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

            if (query.before) {
                query.before = (new dayjs(query.before)).toISOString();
            }

            if (query.after) {
                query.after = (new dayjs(query.after)).toISOString();
            }

            if (query.dest) {
                query.dest = query.dest.split(/\s*(?:,|$)\s*/);
                console.log(query.dest);
            }

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
            <form id="edit-message-form">
                <div class="mb-3">
                    <label class="form-label" for="positive-reactions">Likes</label>
                    <input name="positive" class="form-control" type="number" min="0" id="positive-reactions" />
                </div>
                <div class="mb-3">
                    <label class="form-label" for="negative-reactions">Dislikes</label>
                    <input name="negative" class="form-control" type="number" min="0" id="negative-reactions" />
                </div>
                <div class="row">
                    <div class="col-auto">
                        <label class="form-label" for="dests">Add a Destination</label>
                    </div>
                </div>
                <div class="mb-3 row">
                    <div class="col-11">
                        <input type="text" class="form-control" id="dests" placeholder="Use @ for handles and § for channels" />
                    </div>
                    <div class="col-1 d-flex flex-row-reverse">
                        <button id="add-dest-btn" class="btn btn-primary">Add</button>
                    </div>
                </div>
                <div class="my-1">
                    <label class="form-label" for="dests-list">Current Destinations</label>
                    <ul class="list-group overflow-auto" id="dests-list" style="max-height: 25vh;"></ul>
                </div>
                <div class="mt-1 d-flex flex-row-reverse">
                    <button type="submit" class="btn btn-primary">Save</button>
                </div>
            </form>
        `);

        let make_dest_li = d => {
            let li = $("<li>", {
                'class': "list-group-item d-flex justify-content-between"
            });

            li.append($("<div>", { text: d }));

            let icon = $('<i>', {
                "class": "bi bi-trash text-danger",
                'aria-label': 'Remove from destinations',
            })

            icon.click(function(event){
                event.preventDefault();
                $(this).parent().remove();
            })

            li.append(icon);

            return li;
        };

        form.find("#add-dest-btn").click(event => {
            //console.log('fired')
            event.preventDefault();

            let val = $('#dests').val();

            if ((val.charAt(0) === '@') || (val.charAt(0) === '§')) {
                $('#dests-list').prepend(make_dest_li(val));

                $('#dests').val("")
            } else {
                alert('Dests have to start with either @ or §.')
            }
        })

        let onSohw = event => {

            let message = this.data_table.selected_item;

            $('.modal-title').text(`Edit Message from @${message.author}`);
            $('#positive-reactions').attr('value', message?.reactions.positive);
            $('#negative-reactions').attr('value', message?.reactions.negative);
            if (message?.dest.length){
                $('#dests-list').empty();
                $('#dests-list').append(message.dest.map(make_dest_li));
            }
        };

        let onHide = event => {
            form.trigger('reset');
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

            let dests = [];
            $('#dests-list').children().each(function(c){
                dests.push($(this).children('div').text());
            })

            if (_.intersection(dests, message.dest).length !== message.dest.length) {
                body.dest = dests;
                console.log(body.dest);
            }

            authorizedRequest({
                endpoint: `/users/${message.author}/messages/${message.id}`,
                method: 'post',
                body: body,
            }).then(() => {
                modal.modal('hide');
                dt.mount();
            });

            message_cont.edit_button?.attr('disabled', true);
        })

        return modal;
    }
}