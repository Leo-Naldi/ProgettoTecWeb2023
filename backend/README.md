# Backend

API and eventually other stuff I'm sure.

## Setup

Run

```bash
npm i 
```

To install the node modules, then create a .env file like so:

```bash
SECRET='supersafesecret99'
PORT=8000  # Or whatever port you want to listen to
DB_HOST=127.0.0.1  # Locally installed db
DB_PORT=27017  # Default mongo port
DB_NAME=TecWebDB  # Will eventually be changed to a proper name
CRIT_MASS=200
DANGER_ZONE="0.2"
```

To check wether mongo is running you can do:

```bash
sudo systemctl status mongod
```

To start/stop it you can use the same command with start/stop instead of status.
If you need to change the url string for the db you will find it in ./config/index.js