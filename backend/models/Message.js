const mongoose = require('mongoose');

const config = require('../config/index');


const ReactionSchema = new mongoose.Schema({
    positive: { type: Number, default: 0, min: 0 },
    negative: { type: Number, default: 0, min: 0 },
}, { _id: false });

const MessageMetaSchema = new mongoose.Schema({
    created: { type: Date, default: Date.now },
    lastModified: { type: Date, default: Date.now },
    geo: {},  // any, TODO una volta che e' definito
}, { _id: false });

const MessageSchema = new mongoose.Schema({
        content: String,
        dest: [{ 
            type: String,
            trim: true,
            match: /^[@§#]/,  // Per differenziare i tipi di destinatari  
        }],
        answering: {
            type: mongoose.ObjectId,  // Id dello squeal a cui si sta rispondendo
            ref: 'User',
        },
        reactions: {
            type: ReactionSchema,
            default: () => ({}),
            required: true,
        },
        meta: {
            type: MessageMetaSchema,
            default: () => ({}),
            required: true,
        }
    }, {
        virtuals: {
            // Le info ridondanti possono essere messe come virtual
            reactionCount: {
                get() {
                    return this.reactions.positive + this.reactions.negative
                }
            },
        },
        methods: {
            // Not sure se servano nel backend but oh well male non fanno
            isPopular() {
                return this.reactions.positive >= 0.25 * config.crit_mass;
            },
            isUnpopular() {
                return this.reactions.negative >= 0.25 * config.crit_mass;
            },
            isControversial() {
                return this.isPopular() && this.isUnpopular();
            },
            isAlmostPopular() {
                return !(this.isPopular()) && 
                    (this.reactions.positive >= config.danger_zone * config.crit_mass);
            },
            isAlmostUnpopular() {
                return !(this.isUnpopular()) &&
                    (this.reactions.negative >= config.danger_zone * config.crit_mass);
            },
            isAlmostControversial() {
                return this.isAlmostPopular() && this.isAlmostUnpopular();
            }
        }
    }
);


const Message = mongoose.model('Message', MessageSchema);

module.exports = Message;