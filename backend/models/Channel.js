const mongoose = require('mongoose');

const Message = require('./Message')


const ChannelSchema = new mongoose.Schema(
    {
        name: { 
            type: String, 
            required: true,
            unique: true,
            trim: true,
        },
        description: String,
        creator: { 
            type: mongoose.ObjectId,
            ref: 'User',
            required: true,
         },
        messages: [{ 
            type: mongoose.ObjectId,
            ref: 'Message',
        }],
        members: [{
            type: mongoose.ObjectId,
            ref: 'Message',
        }],
        privateChannel: { type: Boolean, default: false, required: true, },
        official: { type: Boolean, default: false, required: true, },
        created: {
            type: Date,
            required: true,
            default: Date.now,
        },
        // TODO add a waiting list of people who want to join
        // TODO differentiate between people who can only read and people who can rw
    }
);

const Channel = new mongoose.model('Channel', ChannelSchema);

module.exports = Channel;