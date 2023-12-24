function authorizedRequest({ endpoint, method = 'get', query = null, body = null }) {
    const baseUrl = `http://site222346.tw.cs.unibo.it/`;

    const u = new URL(endpoint, baseUrl);

    let url = u.href;

    let token = getToken();

    if (!token) throw Error("No token available");

    let opt = {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        method: method,
    }

    if (body) opt.body = _.isString(body) ? body : JSON.stringify(body);
    
    if ((query) && (!_.isEmpty(query))) {
        
        url += '?';

        let query_str = _.pairs(query).map(pair => {
            const key = pair[0];
            const val = pair [1];
            if (!_.isArray(val)) {
                return `${key}=${val}`;
            } else {
                return val.map(v => `${key}=${v}`).join('&')
            }
        }).join('&');
        
        url += query_str
    }

    return fetch(url, opt);
}


function authorizedRequest2({ endpoint, method = 'get', query = null, body = null }) {
    const baseUrl = `http://localhost:8000/`;

    let token = getToken();

    if (!token) throw Error("No token available");

    // Create a new URL object
    const url = new URL(endpoint, baseUrl);
    //console.log(url.href);

    if (query) {
        const params = new URLSearchParams();

        for (let p in query) {
            params.append(p, query[p]);
        }

        url.search = params.toString();
    }

    let opt = {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        method: method,
    }

    if (body) opt.body = _.isString(body) ? body : JSON.stringify(body);
    if (query) opt.query = query;

    return fetch(url.href, opt);
}

function unauthorizedRequest({ endpoint, method = 'get', query = null, body = null }) {
    const baseUrl = `http://site222346.tw.cs.unibo.it/`;

    // Create a new URL object
    const url = new URL(endpoint, baseUrl);
    //console.log(url.href);

    if (query) {
        const params = new URLSearchParams();

        for (let p in query) {
            params.append(p, query[p]);
        }

        url.search = params.toString();
    }

    let opt = {
        headers: {
            'Content-Type': 'application/json'
        },
        method: method,
    }

    if (body) opt.body = _.isString(body) ? body: JSON.stringify(body);

    //console.log(opt.body)

    return fetch(url.href, opt);
}