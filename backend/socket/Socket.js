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

        if (populatedMessage.publicMessage) {
            namespaces.add('/admin-io/');
        }

        if (populatedMessage.answering) {
            namespaces.add(`/user-io/${populatedMessage.answering.author.handle}`);
            if (populatedMessage.answering.author.smm) {
                namespaces.add(`/pro-io/${populatedMessage.answering.author.smm.handle}`);
            }
        }

        return namespaces;
    }

    static #makeNamespacesFromPopulatedChannel(populatedChannel) {
        const namespaces = new Set(populatedChannel.members.map(u => `user-io/${u.handle}`));

        if (populatedChannel.official) {
            namespaces.add('/public-io/');
        }

        if (populatedChannel.publicChannel) {
            namespaces.add('/admin-io/');
        }

        return namespaces;
    }

    static userChanged({ populatedUser, ebody, old_smm_handle, socket }) {
        let nms = new Set([`/user-io/${populatedUser.handle}`, '/admin-io/']);

        //logger.debug(JSON.stringify(populatedUser))
        if (populatedUser.smm?.handle) nms.add(`/pro-io/${populatedUser.smm.handle}`);

        if (old_smm_handle) nms.add(`/pro-io/${old_smm_handle}`);

        if (populatedUser.managed?.length) {
            populatedUser.managed.map(u => nms.add(`/user-io/${u.handle}`))
        }

        ebody.handle = populatedUser.handle;

        SquealSocket.emit({
            socket: socket,
            namespaces: nms,
            eventName: 'user:changed',
            eventBody: ebody,
        })
    }

    static userDeleted({ handle, smm_handle=null, managed=[], socket }) {
        
        let namespaces = new Set(['/admin-io/']);
        
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

    static messageDeleted({ id, destHandles, smm_handle=null, answering_smm=null, official, socket }) {
        let namespaces = new Set(['/admin-io/']);
         
        destHandles.forEach(handle => namespaces.add(`/user-io/${handle}`));

        if (official) {
            namespaces.add('/public-io/')
        }

        if (smm_handle) {
            namespaces.add(`/pro-io/${smm_handle}`);
        }

        if (answering_smm) {
            namespaces.add(`/pro-io/${answering_smm}`);
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

        ebody.id = populatedMessage._id.toString();

        SquealSocket.emit({
            socket: socket,
            namespaces: namespaces,
            eventName: 'message:changed',
            eventBody: ebody,
        });
    }

    /*
    static reactionRecived({ populatedMessage, type, socket }) {
        
        let namespaces = SquealSocket.#makeNamespacesFromPopulatedMessage(populatedMessage);
        
        SquealSocket.emit({
            socket: socket,
            namespaces: namespaces,
            eventName: 'reaction:recived',
            eventBody: { id: populatedMessage._id.toString(), type: type },
        });
    }

    static reactionDeleted({ populatedMessage, type, socket }) {
        
        let namespaces = SquealSocket.#makeNamespacesFromPopulatedMessage(populatedMessage);
        
        SquealSocket.emit({
            socket: socket,
            namespaces: namespaces,
            eventName: 'reaction:deleted',
            eventBody: { id: populatedMessage._id.toString(), type: type },
        });
    }
    */

    static channelChanged({ populatedChannelObject, ebody, socket }) {
        const namespaces = SquealSocket.#makeNamespacesFromPopulatedChannel(populatedChannelObject);

        if (!ebody) {
            ebody = populatedChannelObject;
        }

        ebody.name = populatedChannelObject.name;

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
            eventBody: { name: populatedChannelObject.name, id: populatedChannelObject._id.toString() },
        });
    }
}

module.exports = SquealSocket