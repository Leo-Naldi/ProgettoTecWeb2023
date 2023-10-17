class DataTable {
    
    constructor(container, headers, endpoint, data_transform=null) {
        this.headers = headers;
        this.table = null;
        this.spinner = null;
        this.container = container;
        this.endpoint = endpoint;
        this.data_transform = data_transform;
        this.selected_row = null;
    }


    mount(query) {
        this.mountSpinner();

        authorizedRequest({
            endpoint: this.endpoint,
            method: 'get',
            query: query,
            token: DataTable.#getToken(),
        }).then(data => data.json())
        .then(data => this.data_transform?.(data) ?? data)
        .then(data => {
            this.table = this.#makeTable(data);
            this.spinner?.remove();
            this.container.append(this.table);
        })
    }

    mountSpinner() {
        this.table?.remove();

        this.spinner = $(`
            <div class="d-flex justify-content-center">
                <div class="spinner-border" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
            </div>
        `);

        this.container.append(this.spinner);
    }

    #makeTable(data) {

        // TODO add onclick to rows

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

            this.headers.map(header => {
                row.append($(`<td>`, {
                    text: d[header.toLowerCase()],
                    'class': 'ellipsis-text',
                }));

            });
            tbody.append(row);

            let td = this;
            row.click(function (event) {
                td.#selectRow($(this));
            });
        });

        let table = $('<table>', { "class": "table" });

        table.append(thead);
        table.append(tbody);

        return table;
    }

    #selectRow(row) {
        this.selected_row?.toggleClass('table-primary');
        
        if (this.selected_row?.attr('id') !== row.attr('id')) {
            row.toggleClass('table-primary');
            this.selected_row = row;
        } else {
            this.selected_row = null;
        }
    }

    static #getToken() {
        let mem = localStorage.getItem('modDashboardData');

        return (mem) ? JSON.parse(mem).token : null;
    }

}