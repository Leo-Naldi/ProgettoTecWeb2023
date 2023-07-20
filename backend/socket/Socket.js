const { logger } = require('../config/logging');
const User = require('../models/User');

class SquealSocket {

    static logEvent(event, nms) {
        logger.debug(`Event '${event}' fired in '${nms}' namespace`)
    }

    static messageCreated({ message, destUser, destChannel, authorHandle, smmHandle, socket }) {

        // TODO if the message is destined to an official channel, emit a /public-io event

        let ebody = {
            id: message.id,
            meta: message.meta,
            reactions: message.reactions,
            author: authorHandle,
        };

        socket.of('/user-io/' + authorHandle).emit('message:created', ebody)
        SquealSocket.logEvent('message:created', '/user-io/' + authorHandle);

        if (smmHandle) {
            socket.of('/pro-io/' + smmHandle).emit('message:created', ebody)
            SquealSocket.logEvent('message:created', '/pro-io/' + smmHandle);
        }

        destUser.map(u => {
            socket.of('/user-io/' + u.handle).emit('message:received', ebody)
            SquealSocket.logEvent('message:received', '/user-io/' + u.handle)
        });

        // TODO channel Sockert
    }

    static async reactionsChanged({ message, authorHandle, smmHandle, socket }) {

        let ebody = { 
            id: message.id, 
            meta: message.meta, 
            reactions: message.reactions, 
            author: authorHandle
        };

        socket.of('/user-io/' + authorHandle).emit('message:reactions', {
            ...ebody
        })
        SquealSocket.logEvent('message:reactions', '/user-io/' + authorHandle);

        if (smmHandle) {
            socket.of('/pro-io/' + smmHandle).emit('message:reactions', {
                ...ebody
            })
            SquealSocket.logEvent('message:reactions', '/pro-io/' + smmHandle);
        }
    }

    static async charsChanged({ user, smmHandle, socket }) {
        socket.of('/user-io/' + user.handle).emit("characters", { charLeft: user.charLeft });

        if (user.smm) {
            socket.of('/pro-io/' + smmHandle).emit("characters", 
                { 
                    charLeft: user.charLeft, 
                    handle: user.handle 
                }
            )
            SquealSocket.logEvent('characters', '/pro-io/' + smmHanlde);
        }
    }
}

module.exports = SquealSocket