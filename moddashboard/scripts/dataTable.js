class DataTable {
    
    constructor(container, headers, data_transform=null) {
        this.headers = headers;
        this.table = null;
        this.spinner = null;
        this.container = container;
        this.data_transform = data_transform;
    }


    mount(endpoint, query) {
        this.mountSpinner();

        authorizedRequest({
            endpoint: endpoint,
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
            <div class="spinner-border" role="status">
                <span class="visually-hidden">Loading...</span>
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
            let row = $('<tr>');

            headers.map(header => {
                row.append($(`<td>${d[header.toLowerCase()]}</td>`));
            });

            tbody.append(row);
        });

        let table = $('<table>', { "class": "table" });

        table.append(thead);
        table.append(tbody);

        return table;
    }

    static #getToken() {
        let mem = localStorage.getItem('modDashboardData');

        return (mem) ? JSON.parse(mem).token : null;
    }

}