const mongoose = require('mongoose');

const config = require('../config/index');

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
        max: config.daily_quote,
        min: 0,
        required: true,
    },
    week: {
        type: Number,
        default: config.weekly_quote,
        max: config.weekly_quote,
        min: 0,
        required: true,
    },
    month: {
        type: Number,
        default: config.monthly_quote,
        max: config.monthly_quote,
        min: 0,
        required: true,
    },
}, { _id: false });

const UserSchema = mongoose.Schema(
    {
        handle: {
            type: String,
            trim: true,
            unique: true,
            required: true,
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
        messages: [{ type: mongoose.ObjectId, ref: 'Message' }],
        meta: {
            type: metaSchema,
            default: () => ({}),  // To actually trigger the created default 
            required: true,
        },
        charLeft: {  // TODO definire i pay plan e aggiornare i max di conseguenza
            type: CharQuotaSchema,
            required: true,
            default: () => ({}),
        },
        proPlan: mongoose.ObjectId,  // TODO change quando i piani sono definiti
        smm: { 
            // Id del social media manager
            type: mongoose.ObjectId, 
            ref: 'User',
        },
        // Account per cui fa da smms
        managed: [{ type: mongoose.ObjectId, ref: 'User' }]
    },
);


const User = mongoose.model('User', UserSchema);

module.exports = User;