/**
 * Builds a jquery table using the given headers and data.
 * 
 * @param {string[]} headers The headers to be used in the table.
 * @param {Object[]} data The data used to fill the table, will be accessed using given headers as keys.
 * @returns A jquery node of the table.
 */
function makeTable(headers, data) {
    
    let thead = $('<thead>');
    let tbody = $('<tbody>');

    let headers_row = $('<tr>')

    headers.map(header => headers_row.append($(`<th scope="col">${header}</th>`)));

    thead.append(headers_row);

    data.map(d => {
        let row = $('<tr>');
        
        headers.map(header => {
            row.append($(`<td>${d.header}</td>`));
        });

        tbody.append(row);
    });

    let table = $('<table>', { "class": "table" });
    
    table.append(thead);
    table.append(tbody);

    return table;
}