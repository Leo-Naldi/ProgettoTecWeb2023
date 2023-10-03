const mongoose = require('mongoose');

/**
 * Reactions schema, every like is saved as a (messageid, userid, 'positive')
 * triple, every dislike as a (messageid, userid, 'negative').
 */
const ReactionSchema = new mongoose.Schema({
    user: {
        type: mongoose.ObjectId, 
        ref: 'User',
        required: true,
    },
    message: {
        type: mongoose.ObjectId,
        ref: 'Message',
        required: true,
    },
    type: {
        type: String,
        enum: ['positive', 'negative'],
        lowercase: true,
        required: true,
    }
})

// Ensure the combinaton of (user, message, type) is unique
ReactionSchema.index({ user: 1, message: 1, type: 1 }, { unique: true });

/**
 * Relatioship Reacts to, containing the user reacting, the message being
 * reacted to, and the type of reaction. This allows to enforce a string
 * one reaction per type per user.
 * @class
 */
const Reaction = mongoose.model('Reaction', ReactionSchema);

// NB: for practical reasons in the dummy db there are way more reactions than users,
// also, (i think), an admin can manually change the number of reactions a message has,
// so its generally not true that every like will have a corresponding like/dislike in this
// collection.

module.exports = Reaction;