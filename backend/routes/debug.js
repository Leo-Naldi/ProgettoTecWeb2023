const express = require('express');
const Message = require('../models/Message');
const User = require('../models/User');
const { logger } = require('../config/logging');
const Channel = require('../models/Channel');
const _ = require('underscore');
const Reaction = require('../models/Reactions');
const Plan = require('../models/Plan');
const { makeDefaultUsers } = require('../utils/defaultUsers');
const mongoose = require('mongoose');
const resetDB = require('../utils/resetDB');


/**
 * Debug Routes used in postman pre request scripts.
 */

const DebugRouter = express.Router();

DebugRouter.get('/answered_message', async (req, res) => {
    const message = await Message.findOne({ answering: { $ne: null }, publicMessage: true });

    if (!message) {
        return res.status(500).json({ message: 'No public message with answers' });
    }

    return res.status(200).json({ id: message.answering.toString() });
})

DebugRouter.get('/public_message', async (req, res) => {

    let filter = { publicMessage: true };
    
    if (req.query.author) {
        const author = await User.findOne({ handle: req.query.author });

        if (!author) return res.status(409).json({ message: `No user named @${req.query.author}` });

        filter.author = author._id;
        logger.debug(req.query.author)
    }


    const message = await Message.findOne(filter);

    if (!message) {
        return res.status(409).json({ message: 'No public message' });
    }

    return res.status(200).json({ id: message._id.toString() });
});

DebugRouter.get('/private_message/:dest', async (req, res) => {
    let filter = {
        publicMessage: false,
    }

    let dest = req.params.dest;

    if (dest.charAt(0) === '@') {

        let user = await User.findOne({ handle: dest.slice(1) });

        if (!user) return res.status(409).json({ message: `No user named ${dest}` });

        filter.destUser = user._id;
    } else {
        let channel = await Channel.findOne({ name: dest.slice(1) });

        if (!channel) return res.status(409).json({ message: `No Channel named ${dest}` });

        filter.destChannel = channel._id;
    }

    let message;
    try {

        message = await Message.findOne(filter);
    } catch (err) {
        logger.error(err)
    }

    //logger.debug(message);
    //logger.debug(JSON.stringify(filter));

    if (!message) return res.status(409).json({ message: `No private message to ${dest}` });

    return res.status(200).json({
        ...message,
        id: message._id.toString(),
    })
})

DebugRouter.post('/reaction/:type/from/:handle', async (req, res) => {

    const user = await User.findOne({ handle: req.params.handle });

    if (!user) {
        return res.status(409).json({ message: `No user named @${handle}` });
    }

    let messages = await Message.find({
        publicMessage: true,
    });

    if (!messages.length) {
        return res.status(500).json({ message: `No public messages left` });
    }

    let message = messages[0];

    let reaction = await Reaction.findOne({
        user: user._id,
        message: message._id,
        type: req.params.type,
    });

    if (reaction) {
        return res.status(409).json({ message: `Already disliked message ${id}` });
    }

    reaction = new Reaction({
        user: user._id,
        message: message._id,
        type: req.params.type,
    })

    if (req.params.type === 'positive')
        message.reactions.positive += 1;
    else
        message.reactions.negative += 1;

    let err = null;
    try {
        message = await message.save();
        await reaction.save()

    } catch (e) {
        err = e;
        logger.error(`debug add reaction Error: ${e.message}`);
    }

    if (err)
        return res.status(500).json(err);

    return res.status(200).json({ id: message._id.toString() });
})

DebugRouter.get('/channel/member/:handle', async (req, res) => {

    const user = await User.findOne({ handle: req.params.handle });

    if (!user) {
        return res.status(409).json({ message: `No user named @${handle}` });
    }

    let messages = await Message.find({ destChannel: { $in: user.joinedChannels }, publicMessage: true });

    if (!messages?.length) {
        return res.status(409).json({ message: `User did not join any channels containing messagess` });
    }

    let cids = new Set();
    
    messages.map(m => m.destChannel.map(cid => cids.add(cid)));
    cids = Array.from(cids);
    cids = cids.filter(cid => user.joinedChannels.some(id => id.equals(cid)));

    const channels = await Channel.find({ _id: { $in: cids } });

    if (!channels?.length) {
        return res.status(500).json({ message: 'No joined channel' });
    }

    return res.status(200).json(channels);
})

DebugRouter.get('/channel/creator/:handle', async (req, res) => {

    const user = await User.findOne({ handle: req.params.handle });

    const channels = await Channel.find({ creator: user._id });

    if (!channels?.length) {
        return res.status(500).json({ message: 'No joined channel' });
    }

    return res.status(200).json(channels);
})

DebugRouter.get('/:handle/reacted', async (req, res) => {
    let user = await User.findOne({ handle: req.params.handle });
    if (!user) res.sendStatus(409);

    let reactions = await Reaction.find({ user: user._id });

    return res.status(200).json({
        positive: reactions.filter(r => r.type === 'positive').map(r => r.message),
        negative: reactions.filter(r => r.type === 'negative').map(r => r.message),
    })
});

DebugRouter.post('/restart', async (req, res) => {
    
    await resetDB(true);

    await makeDefaultUsers();

    return res.sendStatus(200);
})

module.exports = DebugRouter;