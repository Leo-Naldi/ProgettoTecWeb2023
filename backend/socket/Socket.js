const { logger } = require('../config/logging');
const User = require('../models/User');

class SquealSocket {

    static logEvent(event, nms) {
        logger.debug(`Event '${event}' fired in '${nms}' namespace`)
    }

    static messageCreated({ message, destChannel, authorHandle, socket }) {

        // TODO if the message is destined to an official channel, emit a /public-io event
        let messageRes = message.toObject();

        delete messageRes.destUser;
        delete messageRes._id;
        delete messageRes.__v;
        
        messageRes.id = message.id;
        messageRes.destChannel = destChannel.map(c => c.name);
        messageRes.author = authorHandle;

        message.destUser.map(u => {
            socket.of('/user-io/' + u).emit('message:recieved', messageRes)
            SquealSocket.logEvent('message:recieved', '/user-io/' + u)
        });

        message.destChannel.map(c => {
            c.members?.map(m => {
                socket.of('/user-io/' + m).emit('channel:message', messageRes)
                SquealSocket.logEvent('channel:message', '/user-io/' + m)
            })
        });
    }

    static async reactionsChanged({ message, socket }) {

        let author = await User.findById(message.author).orFail();

        let messageRes = message.toObject();

        delete messageRes.destUser;
        delete messageRes._id;
        delete messageRes.__v;

        messageRes.id = message.id

        socket.of('/user-io/' + author.id).emit('message:reactions', {
            id: message.id,
            reactions: message.reactions,
        })
        SquealSocket.logEvent('message:reactions', '/user-io/' + author.id);

        if (author.smm) {
            socket.of('/pro-io/' + author.smm).emit('message:reactions', {
                id: message.id,
                reactions: message.reactions,
            })
            SquealSocket.logEvent('message:reactions', '/pro-io/' + author.smm);
        }
    }

    static async charsChanged({ user, socket }) {
        socket.of('/user-io/' + user.handle).emit("characters", { charLeft: user.charLeft });

        if (user.smm) {
            socket.of('/pro-io/' + user.smm).emit("characters", { charLeft: user.charLeft, handle: user.handle })
            SquealSocket.logEvent('characters', '/pro-io/' + author.smm);
        }
    }
}

module.exports = SquealSocket