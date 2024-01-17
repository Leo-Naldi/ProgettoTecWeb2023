const data_display_default = (data, header) => data[header.toLowerCase()];

class DataTable {

    #headers;
    #table = null;
    #spinner = null;
    #container;
    #endpoint;
    #data_transform;
    #data_display;
    #selected_row = null;
    #selected_item = null;
    #after_row_select;

    #caption;

    #results_per_page;
    #page = 1;
    #pages = null;
    #data = [];

    #pagination = null;
    #filter = {};

    #socket_prefix;
    #socket;

    constructor(
        container, 
        headers, 
        endpoint, 
        after_row_select, 
        caption,
        data_transform = _.identity, 
        data_display = data_display_default, 
        results_per_page = 25,
        default_filter={}, 
        socket_prefix='', 
        socket=null
    ) {
        
        this.#headers = headers;
        this.#container = container;
        this.#endpoint = endpoint;
        this.#data_transform = data_transform;
        this.#data_display = data_display;
        this.#after_row_select = after_row_select;

        this.#caption = caption;
        
        this.#results_per_page = results_per_page;
        this.#filter = default_filter;

        this.#socket_prefix = socket_prefix;
        this.#socket = socket;
        
        this.addSocketListeners();
    }

    get selected_item() {
        return this.#selected_item;
    }

    /**
     * @param {object} f The new filter object
     */
    set filter(f) {
        this.#filter = f;
        this.#page = 1;
        this.#pages = null;
        this.#selected_row = null;
        this.#selected_item = null;
        this.#after_row_select();
        this.mount();
    }

    get filter() {
        return this.#filter;
    }

    /**
     * @param {number} n
     */
    set page(n) {
        if ((n <= 0) || (n > this.#pages)) {
            throw Error(`DataTable.page bad value: ${n}`);
        } else {
            this.#page = n;
            this.#pageChanged();
        }
    }

    get page() {
        return this.#page;
    }

    #fetchData() {
        return authorizedRequest({
            endpoint: this.#endpoint,
            method: 'get',
            query: {
                ...this.filter,
                results_per_page: this.#results_per_page,
                page: this.#page,
            },
            token: DataTable.#getToken(),
        }).then(data => data.json());
    }

    #mountSpinner() {
        this.#table?.remove();

        this.#spinner = $(`
            <div class="d-flex justify-content-center mt-4">
                <div class="spinner-border" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
            </div>
        `);

        this.#container.append(this.#spinner);
    }

    /**
    * Creates the table anew.
    */
    mount() {
        this.#container.empty();
        this.#mountSpinner();

        this.#fetchData()
            .then(data => {
                this.#spinner?.remove();

                this.#pages = data.pages;
                this.#data = data.results;
                //console.log(this.#pages);

                this.#table = this.#makeTable(data);
                this.#pagination = this.#makePagination()
                
                this.#container.append(this.#table);
                this.#container.append(this.#pagination);
            })
    }

    #pageChanged() {
        this.#mountSpinner();

        this.#fetchData()
            .then(data => {

                this.#data = data.results;
                this.#table = this.#makeTable(data);
                this.#spinner?.remove();
                this.#pagination?.remove();
                this.#pagination = this.#makePagination();
                this.#container.append(this.#table);
                this.#container.append(this.#pagination);
            })
    }

    #makeTable(data) {

        let div = $('<div>');
        
        let thead = $('<thead>');
        let tbody = $('<tbody>');

        let headers_row = $('<tr>')

        this.#headers.map(header => 
            headers_row.append($(`<th scope="col">${header}</th>`)));

        thead.append(headers_row);

        data.results.map(d => {
            let row = $('<tr>', {
                id: d.id,
            });

            let transformed = this.#data_transform?.(d) ?? d;
            this.#headers.map(header => {

                let td = $('<td>', {
                    'class': `ellipsis-text`
                });
                let content = this.#data_display(transformed, header);
                if (_.isArray(content)) {
                    td.append(...content);
                } else {
                    td.append(content);
                }

                row.append(td);

            });
            tbody.append(row);

            let td = this;
            row.click(function (event) {
                td.#selectRow($(this), d);
            });
        });

        let table = $('<table>', { 
            "class": "table table-hover",
            'aria-live': 'polite',
        });
        table.append($('<caption>', {
            text: this.#caption,
        }))

        table.append(thead);
        table.append(tbody);
        
        div.append(table);

        let pagination = $('<div>', { id: 'user-pagination' });

        div.append(pagination);

        return div;
    }

    #makePagination() {
        
        let ul = $('<ul>', { "class": "pagination justify-content-center" })
        let nav = $(`
            <nav aria-label="Table Pagination">
            </nav>
        `);

        let first_a = $('<a class="page-link"><<</a>');
        let first = $('<li class="page-item"></li>');
        let last_a = $('<a class="page-link">>></a>');
        let last = $('<li class="page-item"></li>');

        first.click(event => {
            event.preventDefault();
            if (this.page !== 1) {
                this.page = 1;
            }
        });

        last.click(event => {
            event.preventDefault();
            if (this.page !== this.#pages) {
                this.page = this.#pages;
            }
        });

        first.append(first_a);
        last.append(last_a);

        ul.append(first);

        this.#getPages().map(p => {
            let a = $(`<a class="page-link">${p}</a>`);
            let li = $('<li class="page-item"></li>');

            if (this.page === p) li.addClass('active');

            li.append(a);

            li.click(event => {
                event.preventDefault();
                if (this.page !== p) {
                    this.page = p;
                }
            })

            ul.append(li);
        });

        ul.append(last);

        nav.append(ul);

        return nav;
    }

    #getPages() {
        if (this.#page === 1) {
            return _.range(1, Math.min(3, this.#pages) + 1);
        } else if (this.#page === this.#pages) {
            return _.range(Math.max(1, this.#pages - 2), this.#pages + 1);
        } else {
            return [this.#page - 1, this.#page, this.#page + 1];
        }
    }

    #selectRow(row, data) {
        this.#selected_row?.toggleClass('table-primary');
        this.#selected_row?.children('td').toggleClass('ellipsis-text');
        
        if (this.#selected_row?.attr('id') !== row.attr('id')) {
            row.toggleClass('table-primary');
            row.children('td').toggleClass('ellipsis-text');
            this.#selected_row = row;
            this.#selected_item = data;

        } else {
            this.#selected_row = null;
            this.#selected_item = null;
        }

        this.#after_row_select();
    }

    addSocketListeners() {

        this.#socket?.removeAllListeners();

        this.#socket?.on(`${this.#socket_prefix}:changed`, (changes) => {

            let i = this.#data.findIndex(d => d.id === changes.id)

            if (i >= 0) {
                this.#data[i] = {
                    ...this.#data[i],
                    ...changes,
                }

                let row = $(`#${this.#data[i].id}`);

                row.empty();

                let d = this.#data[i];
                let transformed = this.#data_transform?.(d) ?? d;

                this.#headers.map(header => {

                    let td = $('<td>', {
                        'class': 'ellipsis-text'
                    });
                    let content = this.#data_display(transformed, header);
                    if (_.isArray(content)) {
                        td.append(...content);
                    } else {
                        td.append(content);
                    }

                    row.append(td);

                });

                if (this.#selected_row?.attr('id') === row.attr('id')) {
                    this.#selected_row?.toggleClass('table-primary');
                    this.#selected_row = null;
                    this.#selected_item = null;
                    this.#after_row_select();
                }
            }
        })

        this.#socket?.on(`${this.#socket_prefix}:deleted`, (data) => {

            // TODO
            let i = this.#data.findIndex(d => d.id === data.id)

            if (i >= 0) {
                if (this.#selected_row?.attr('id') === data.id) {
                    this.#selectRow(this.#selected_row, this.#selected_item);
                }

                $(`#${data.id}`).remove();
            }
        })
    }

    static #getToken() {
        let mem = localStorage.getItem('modDashboardData');
        
        if (!mem) throw new Error("No token in localstorage");

        return JSON.parse(mem).token;
    }

}