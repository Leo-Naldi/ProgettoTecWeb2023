class DataTable {
    
    constructor(container, headers, endpoint, after_row_select, data_transform=null) {
        this.headers = headers;
        this.table = null;
        this.spinner = null;
        this.container = container;
        this.endpoint = endpoint;
        this.data_transform = data_transform;
        this.selected_row = null;
        this.selected_user = null;
        this.after_row_select = after_row_select;
    }


    mount(query) {
        this.mountSpinner();

        authorizedRequest({
            endpoint: this.endpoint,
            method: 'get',
            query: query,
            token: DataTable.#getToken(),
        }).then(data => data.json())
        .then(data => {
            this.table = this.#makeTable(data);
            this.spinner?.remove();
            this.container.append(this.table);
        })
    }

    mountSpinner() {
        this.table?.remove();

        this.spinner = $(`
            <div class="d-flex justify-content-center mt-4">
                <div class="spinner-border" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
            </div>
        `);

        this.container.append(this.spinner);
    }

    #makeTable(data) {

        let div = $('<div>');
        
        let thead = $('<thead>');
        let tbody = $('<tbody>');

        let headers_row = $('<tr>')

        this.headers.map(header => 
            headers_row.append($(`<th scope="col">${header}</th>`)));

        thead.append(headers_row);

        data.map(d => {
            let row = $('<tr>', {
                id: d.id,
            });

            let transformed = this.data_transform?.(d) ?? d;
            this.headers.map(header => {
                row.append($(`<td>`, {
                    text: transformed[header.toLowerCase()],
                    'class': 'ellipsis-text',
                }));

            });
            tbody.append(row);

            let td = this;
            row.click(function (event) {
                td.#selectRow($(this), d);
            });
        });

        let table = $('<table>', { "class": "table table-hover" });

        table.append(thead);
        table.append(tbody);

        
        div.append(table);
        return div;
    }

    #selectRow(row, user) {
        this.selected_row?.toggleClass('table-primary');
        
        if (this.selected_row?.attr('id') !== row.attr('id')) {
            row.toggleClass('table-primary');
            this.selected_row = row;
            this.selected_user = user;
        } else {
            this.selected_row = null;
            this.selected_user = null;
        }

        this.after_row_select(this);
    }

    static #getToken() {
        let mem = localStorage.getItem('modDashboardData');

        return (mem) ? JSON.parse(mem).token : null;
    }

}