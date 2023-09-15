const mongoose = require('mongoose');


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
        // users with reading permission
        members: [{
            type: mongoose.ObjectId,
            ref: 'User',
        }],
        // user with writing permission
        editors: [{
            type: mongoose.ObjectId,
            ref: 'User',
        }],
        // users requesting reading permission
        memberRequests: [{
            type: mongoose.ObjectId,
            ref: 'User',
        }],
        // users requesting writing permission
        editorRequests: [{
            type: mongoose.ObjectId,
            ref: 'User',
        }],
        publicChannel: { type: Boolean, default: true, required: true, },
        official: { type: Boolean, default: false, required: true, },
        created: {
            type: Date,
            required: true,
            default: Date.now,
        },
    }, {
        virtuals: {
            privateChannel: {
                get() {
                    return !this.publicChannel;
                },
            }
        }
    }
);


const Channel = new mongoose.model('Channel', ChannelSchema);

module.exports = Channel;