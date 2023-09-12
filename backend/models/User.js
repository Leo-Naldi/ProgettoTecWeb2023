const mongoose = require('mongoose');

const config = require('../config/index');
const Plan = require('./Plan')


// Schema per i metadata utente, va fatto cosi per far funzionare i default
const metaSchema = new mongoose.Schema({
    created: {
        type: Date,
        default: Date.now,
    }
}, { _id: false });

const CharQuotaSchema = new mongoose.Schema({
    day: {
        type: Number,
        default: config.daily_quote,
        min: 0,
        required: true,
    },
    week: {
        type: Number,
        default: config.weekly_quote,
        min: 0,
        required: true,
    },
    month: {
        type: Number,
        default: config.monthly_quote,
        min: 0,
        required: true,
    },
}, { _id: false });

const SubscriptionSchema = new mongoose.Schema({

    proPlan: {
        type: mongoose.ObjectId,
        ref: 'Plan',
    },
    expires: {
        type: Date,
        required: true,
        default: Date.now,
    }, 
    autoRenew: {
        type: Boolean,
        required: true,
        default: false,
    }

}, { _id: false })

const UserSchema = mongoose.Schema(
    {
        handle: {
            type: String,
            trim: true,
            unique: true,
            required: true,
            minLength: 1
        },
        username: {
            type: String,
            trim: true,
            default: 'user',
            required: true,
        },
        name: {
            type: String,
        },
        lastName: {
            type: String,
        },
        email: {
            type: String,
            required: true,
            unique: true,
        },
        phone: {
            type: String,
        },
        gender: {
            type: String,
        },
        urlAvatar: {
            type: String,
        },
        password: {
            type: String,
            required: true,
            minLength: 6,
        },
        blocked: {
            type: Boolean,
            default: false,
            required: true,
        },
        accountType: {
            type: String,
            trim: true,
            lowercase: true,
            enum: ['user', 'pro'],
            default: 'user',
            required: true,
        },
        admin: {
            type: Boolean,
            default: false,
            required: true,
        },
        joinedChannels: [{ type: mongoose.ObjectId, ref: 'Channel' }],
        meta: {
            type: metaSchema,
            default: () => ({}),  // To actually trigger the created default 
            required: true,
        },
        charLeft: {  
            type: CharQuotaSchema,
            required: true,
            default: () => ({}),
        },
        proPlan: {
            type: mongoose.ObjectId,
            ref: 'Plan',
        },
        smm: { 
            // Id del social media manager
            type: mongoose.ObjectId, 
            ref: 'User',
        },
        lastLoggedin: Date,
        // Account per cui fa da smms
    }, {
        statics: {
            async findManaged(smmid) {
                return await this.find({ smm: smmid });
            }
        } 
    }
);

UserSchema.virtual('messages', {
    ref: 'Message',
    localField: '_id',
    foreignField: 'author'
})

UserSchema.virtual('managed', {
    ref: 'User',
    localField: '_id',
    foreignField: 'smm'
})

UserSchema.pre('deleteOne', { document: true }, async function(){
    
    const updates = (await this.constructor.find({ smm: this._id })).map(async u => {
        u.smm = null;
        return u.save();
    })

    await Promise.all(updates);
})

const User = mongoose.model('User', UserSchema);

module.exports = User;