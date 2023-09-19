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

ChannelSchema.virtual('memberRequests', {
    ref: 'User',
    localField: '_id',
    foreignField: 'joinChannelRequests'
});

ChannelSchema.virtual('editorRequests', {
    ref: 'User',
    localField: '_id',
    foreignField: 'editorChannelRequests'
});

ChannelSchema.virtual('members', {
    ref: 'User',
    localField: '_id',
    foreignField: 'joinedChannels'
});

ChannelSchema.virtual('editors', {
    ref: 'User',
    localField: '_id',
    foreignField: 'editorChannels'
});

/*
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
*/

const Channel = new mongoose.model('Channel', ChannelSchema);

module.exports = Channel;