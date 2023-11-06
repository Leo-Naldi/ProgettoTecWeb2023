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
MAIL_USER= '' # your mail used for send mail to user
MAIL_PASSWORD= '' # your mail account password
MAIL_SERVICE= '' # nodemailer default supported mail: [Well-known services – Nodemailer](https://community.nodemailer.com/2-0-0-beta/setup-smtp/well-known-services/)
MAIL_HOST= '' # if not listed in mail_service
```

To check wether mongo is running you can do:

```bash
sudo systemctl status mongod
```

To start/stop it you can use the same command with start/stop instead of status.
If you need to change the url string for the db you will find it in ./config/index.js

## Libraries

We used [mongoose](https://mongoosejs.com/) to implement the Models (see ./models) and Schema validation. Dates are 
largely handled through the [dayjs](https://day.js.org/) library. The server is implemented using [Express](https://expressjs.com/),
authentication is done through express middlewares, the [passport](http://www.passportjs.org/) and [jsonwebtoken](https://www.npmjs.com/package/jsonwebtoken) libraries. 

## Server Structure

TODO

## Socket IO

[Socket.io](https://socket.io) is used for real time comms, (i.e. sending messages, notifying of likes etc.). Events are emitted from the server whenever needed, so clients only need to worry about listening.

Communication will be divided into four namespaces:
* /public-io for non-logged in users.
* /user-io/{handle} for logged-in users.
* /pro-io/{handle} for logged-in pro users.
* /admin-io/{handle} for logged-in admins.

Any events relative to the user, for example a message destined to them, a like on one of their posts etc., will be emitted there to their namespace. A user can only access namespaces with its own handle, using the same jwt used for authentication.

All namespaces except /public-io require the same JSON Web Token as the API's non-public routes to authenticate the user. For example:

```js
const socket = io("https://localhost:8000/public-io"); // Public namespace

// replace HANDLE and JWT_TOKEN with the appropriate values
const userSocket = io("https://localhost:8000/user-io/handle", {
    extraHeaders: {
        Authorization: 'Bearer JWT_TOKEN'
    }
}); // For app non pro users

const proSocket = io("https://localhost:8000/pro-io/handle", {
    extraHeaders: {
        Authorization: 'Bearer JWT_TOKEN'
    }
}); // For app/smm dashboard pro users

const adminSocket = io("https://localhost:8000/admin-io/handle", {
    extraHeaders: {
        Authorization: 'Bearer JWT_TOKEN'
    }
}); // For admin

// Afterwards the sockets can be used normally.
// Again, events are fired off in the API, so clients need only listen to them (AKA only use .on and not .emit)
adminSocket.on('some event', (...args) => {
    console.log(args)
});
```

More on namespaces [here](https://socket.io/docs/v4/namespaces/). The file ./SocketExample.html contains a page that allows to see the events in real time.

| Event Name | Args | Description |
|-------|-------|-------|
|user:changed| Either the whole new user object or the specific fields that changed. | A user record changed. |
|user:deleted| { handle: handle } | The user @handle was deleted. |
|message:deleted| { id: id } | The given message was deleted. |
| message:created | The message object. | A message was created. |
| message:changed | Either the whole new message object or the specific fields that were altered. | Message record was changed. |
|channel:changed| The channel object | A channel record was changed. |
|channel:deleted| { name: name } | The channel named name was deleted. |

## Logger

Logging is done using Winston and Morgan, like so:

```js
const { logger } = require('./config/logging');

logger.error("Error Message");
logger.warn("Warn Message");
logger.info("Info Message");
logger.http("HTTP Message");
logger.verbose("Verbose Message");
logger.debug("Debug Message");
```

Messages will be printed to the console and saved as json objects in the log files contained in the ./logs directory. Error messages are also saved in an extra error-%DATE%.log file. A new log file gets created every day and log files older than 5 days are deleted (see ./config/logging.js). I'm not 100% sure what happens if you don't create the ./logs directory by hand so do it.