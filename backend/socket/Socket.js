const { Socket } = require('socket.io');
const { logger } = require('../config/logging');
const SocketServer = require('./SocketServer');

class SquealSocket {

    static logEvent(event, nms) {
        logger.debug(`Event [${event}] fired in [${nms}] namespace`)
    }

    static logBroadcast(event) {
        logger.debug(`Event [${event}] broadcasted`)
    }

    static emit({ socket, namespaces, eventName, eventBody, }) {
        namespaces.forEach(nms => {
            socket.of(nms).emit(eventName, eventBody);
            SquealSocket.logEvent(eventName, nms);
        });
    }

    static #makeNamespacesFromPopulatedMessage(populatedMessage) {
        let namespaces = new Set([
            ...populatedMessage.destUser.map(u => `/user-io/${u.handle}`),
            `/user-io/${populatedMessage.author.handle}`
        ]);

        populatedMessage.destChannel.map(c =>
            namespaces.add(...c.members.map(u => `/user-io/${u.handle}`)));

        if (populatedMessage.official) {
            namespaces.add('/public-io/')
        }

        if (populatedMessage.author.smm) {
            namespaces.add(`/pro-io/${populatedMessage.author.smm.handle}`)
        }

        //logger.debug(populatedMessage.author.smm.handle)

        return namespaces;
    }

    static #makeNamespacesFromPopulatedChannel(populatedChannel) {
        const namespaces = new Set(populatedChannel.members.map(u => `user-io/${u.handle}`));

        if (populatedChannel.official) {
            namespaces.add('/public-io/');
        }

        return namespaces;
    }

    static userChanged({ populatedUser, ebody, old_smm_handle, socket }) {
        let nms = new Set([`/user-io/${populatedUser.handle}`]);

        if (populatedUser.smm?.handle) nms.add(`/pro-io/${populatedUser.smm.handle}`);

        if (old_smm_handle) nms.add(`/pro-io/${old_smm_handle}`);

        if (populatedUser.managed?.length) {
            populatedUser.managed.map(u => nms.add(`/user-io/${u.handle}`))
        }

        if (!ebody.handle) ebody = { ...ebody, handle: populatedUser.handle }

        SquealSocket.emit({
            socket: socket,
            namespaces: nms,
            eventName: 'user:changed',
            eventBody: ebody,
        })
    }

    static userDeleted({ handle, smm_handle=null, managed=[], socket }) {
        
        let namespaces = new Set();
        
        if (smm_handle) {
            namespaces.add(`/pro-io/${smm_handle}`);
        }

        if (managed?.length) {
            managed.map(u => namespaces.add(`/user-io/${u.handle}`))
        }

        SquealSocket.emit({
            namespaces: namespaces,
            eventName: 'user:deleted',
            eventBody: { handle: handle },
            socket: socket,
        })
    }

    static messageDeleted({ id, destHandles, smm_handle=null, official, socket }) {
        let namespaces = new Set();
         
        destHandles.forEach(handle => namespaces.add(`/user-io/${handle}`));

        if (official) {
            namespaces.add('/public-io/')
        }

        if (smm_handle) {
            namespaces.add(`/pro-io/${smm_handle}`);
        }

        SquealSocket.emit({
            socket: socket,
            namespaces: namespaces,
            eventName: 'message:deleted',
            eventBody: { id: id },
        })
    }

    static messageCreated({ populatedMessage, populatedMessageObject, socket }) {
        let namespaces = SquealSocket.#makeNamespacesFromPopulatedMessage(populatedMessage);

        SquealSocket.emit({
            socket: socket,
            namespaces: namespaces,
            eventName: 'message:created',
            eventBody: populatedMessageObject,
        });
    }

    static messageChanged({ populatedMessage, populatedMessageObject, ebody, socket }) {
        let namespaces = SquealSocket.#makeNamespacesFromPopulatedMessage(populatedMessage);

        if (!ebody) {
            ebody = populatedMessageObject;
        }

        if (!ebody.id) ebody.id = populatedMessage._id.toString();

        SquealSocket.emit({
            socket: socket,
            namespaces: namespaces,
            eventName: 'message:changed',
            eventBody: ebody,
        });
    }

    static reactionRecived({ id, smm_handle, type, socket }) {
        namespaces = new Set([`/pro-io/${smm_handle}`]);
        SquealSocket.emit({
            socket: socket,
            namespaces: namespaces,
            eventName: 'reaction:recived',
            eventBody: { id: id, type: type },
        });
    }

    static reactionDeleted({ id, smm_handle, type, socket }) {
        namespaces = new Set([`/pro-io/${smm_handle}`]);
        SquealSocket.emit({
            socket: socket,
            namespaces: namespaces,
            eventName: 'reaction:deleted',
            eventBody: { id: id, type: type },
        });
    }

    static channelChanged({ populatedChannelObject, ebody, socket }) {
        const namespaces = SquealSocket.#makeNamespacesFromPopulatedChannel(populatedChannelObject);

        if (!ebody) {
            ebody = populatedChannelObject;
        }

        if (!ebody.name) ebody = { ...ebody, name: populatedChannelObject.name };

        SquealSocket.emit({
            socket: socket,
            namespaces: namespaces,
            eventName: 'channel:changed',
            eventBody: ebody,
        });
    }

    static channelDeleted({ populatedChannelObject, socket }) {
        const namespaces = SquealSocket.#makeNamespacesFromPopulatedChannel(populatedChannelObject);

        SquealSocket.emit({
            socket: socket,
            namespaces: namespaces,
            eventName: 'channel:deleted',
            eventBody: { name: populatedChannelObject.name },
        });
    }
}

module.exports = SquealSocket