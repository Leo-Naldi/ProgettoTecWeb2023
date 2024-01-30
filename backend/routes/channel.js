const express = require('express');
const passport = require('passport');

const Controller = require('../controllers/Controller');
const ChannelServices = require('../services/ChannelServices');
const MessageServices = require('../services/MessageServices');
const Channel = require('../models/Channel');
const { getAuthMiddleware, checkNameCreator, checkNameCreatorOrAdmin } = require('../middleware/auth');


const ChannelRouter = express.Router();

// Get all channels created by all users
ChannelRouter.get('/', getAuthMiddleware('basicAuth'), async (req, res) => {

    // Lists of messages and members is removed from private channels if the user
    // is not an admin or a member
    await Controller.handleRequest(req, res, ChannelServices.getChannels);
})

// Get all channels created by a user
ChannelRouter.get('/:handle/created/', getAuthMiddleware('basicAuth'), async(req, res) =>{
    await Controller.handleRequest(req, res, ChannelServices.getUserChannels);
})

// Get the name of the creator based on ObjectId
// Deprecated
ChannelRouter.get('/:name/creator', getAuthMiddleware('basicAuth'), async(req, res) =>{
    await Controller.handleRequest(req, res, ChannelServices.getChannelCreator);
})

// get a channel
ChannelRouter.get('/:name', getAuthMiddleware('basicAuth'), async (req, res) => {

    // Lists of messages and members is removed from private channels if the user
    // is not an admin or a member
    await Controller.handleRequest(req, res, ChannelServices.getChannel);
})

// create a channel
ChannelRouter.post('/:name', getAuthMiddleware('basicAuth'), async (req, res) => {

    let requestParams = {
        ...req.params,
        ...req.body,
        ...req.query,
    };

    if (requestParams.hasOwnProperty('official')) {
        if (!req.user.admin) {
            return res.status(401).json({ message: `Only admins can create official channels` });
        }
    }
    
    await Controller.handleRequest(req, res, ChannelServices.createChannel);
})


// modify a channel
ChannelRouter.put('/:name', getAuthMiddleware('basicAuth'), checkNameCreatorOrAdmin, async (req, res) => {

    await Controller.handleRequest(req, res, ChannelServices.writeChannel);
})


ChannelRouter.delete('/:name', getAuthMiddleware('basicAuth'), checkNameCreatorOrAdmin, async (req, res) => {

    await Controller.handleRequest(req, res, ChannelServices.deleteChannel);
})

ChannelRouter.post('/:name/members/', getAuthMiddleware('basicAuth'), checkNameCreator, async (req, res) => {

    await Controller.handleRequest(req, res, ChannelServices.addChannelMembers);
})

ChannelRouter.delete('/:name/members/', getAuthMiddleware('basicAuth'), checkNameCreator, async (req, res) => {

    await Controller.handleRequest(req, res, ChannelServices.deleteChannelMembers);
})

ChannelRouter.delete('/:name/members/requests/', getAuthMiddleware('basicAuth'), checkNameCreator, async (req, res) => {

    await Controller.handleRequest(req, res, ChannelServices.deleteChannelMemberRequests);
})

ChannelRouter.post('/:name/editors/', getAuthMiddleware('basicAuth'), checkNameCreator, async (req, res) => {

    await Controller.handleRequest(req, res, ChannelServices.addChannelEditors);
})

ChannelRouter.delete('/:name/editors/', getAuthMiddleware('basicAuth'), checkNameCreator, async (req, res) => {

    await Controller.handleRequest(req, res, ChannelServices.deleteChannelEditors);
})

ChannelRouter.delete('/:name/editors/requests/', getAuthMiddleware('basicAuth'), checkNameCreator, async (req, res) => {

    await Controller.handleRequest(req, res, ChannelServices.deleteChannelEditorRequests);
})

ChannelRouter.get('/:name/available', getAuthMiddleware('basicAuth'), checkNameCreator, async (req, res) => {

    await Controller.handleRequest(req, res, ChannelServices.availableChannel);
})

module.exports = ChannelRouter;