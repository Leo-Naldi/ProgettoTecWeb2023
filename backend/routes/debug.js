const express = require('express');
const Message = require('../models/Message');
const User = require('../models/User');
const { logger } = require('../config/logging');
const Channel = require('../models/Channel');
const _ = require('underscore')

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
    }

    const message = await Message.findOne(filter);

    if (!message) {
        return res.status(500).json({ message: 'No public message' });
    }

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

module.exports = DebugRouter;