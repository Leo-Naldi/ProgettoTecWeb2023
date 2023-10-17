class UserContent{
    constructor(container) {
        this.container = container;
        this.filters = null;

        let headers = [
            'Handle',
            'Member',
            'Editor',
            'Account Type',
            'Blocked',
        ]

        let transform = (data) => {

            return data.map(d => {

                d.member = (d.joinedChannels?.length) ? d.joinedChannels: '-';
                d['account type'] = d.accountType;
                d.editor = (d.editorChannels?.length) ? d.editorChannels : '-';
                return d;
            });
        } 

        this.data_table = new DataTable(this.container, headers, 'http://localhost:8000/users', transform);
    }

    mount() {

        this.container.empty();

        this.filters = $(`
            <form class="row my-3 d-flex justify-content-center" id="user-search-widgets">
                <div class="col-md-7">
                    <div class="input-group">
                        <input name="handle" type="text" class="form-control" placeholder="Search by Name" id="userSearchInput">
                    </div>
                </div>
                <div class="col-md-3" id="user-filter">
                    <div class="form-group">
                        <label for="accountTypeFilter">Account Type:</label>
                        <select class="form-control" id="accountTypeFilter" name="accountType">
                            <option value="">All</option>
                            <option value="user">User</option>
                            <option value="pro">Pro User</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="userPopularityFilter">Popularity:</label>
                        <select class="form-control" id="userPopularityFilter" name="popularity">
                            <option value="">All</option>
                            <option value="popular">Popular</option>
                            <option value="unpopular">Unpopular</option>
                            <option value="controversial">Controversial</option>
                        </select>
                    </div>
                    <div class="form-check">
                        <input class="form-check-input" type="checkbox" name="admin" value="true" id="flexCheckDefault">
                        <label class="form-check-label" for="flexCheckDefault">
                            Admins Only
                        </label>
                    </div>

                    <div class="form-group">
                        <button type="submit" class="btn btn-primary">Search</button>
                    </div>
                </div>
            </form>
        `);

        let dt = this.data_table;

        this.filters.on('submit', function(event) {
            event.preventDefault();

            let query = $(this).serializeArray().reduce((acc, cur) => {
                if (cur.value?.length)
                    acc[cur.name] = cur.value;
                return acc;
            }, {});

            if (query.admin) query.admin = true;

            dt.mount(query);
        })

        this.container.append(this.filters);
        this.data_table.mount();
    }


    makeUserTable() {

    }

}