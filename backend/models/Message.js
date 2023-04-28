const Schema = require('mongoose').Schema;

const config = require('../config/index');


const MessageSchema = new Schema({
        content: String,
        dest: [{ 
            type: String,
            trim: true,
            match: /^[@§#]/,  // Per differenziare i tipi di destinatari  
        }],
        reactions: {
            positive: { type: Number, default: 0, min: 0 },
            negative: { type: Number, default: 0, min: 0 },
        },
        meta: {
          created: Date,
          lastModified: Date,
          geo: {},  // any, TODO una volta che e' definito
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

module.exports = MessageSchema;