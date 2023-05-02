const mongoose = require('mongoose');4
const dayjs = require('dayjs'); 

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
        query: {
        
            byPopularity(popularity) {
                
                if (popularity === 'popular') {
                
                    return this.where({ 'reactions.positive':  { '$gte': 0.25 * config.crit_mass }})
                
                } else if (popularity === 'unpopular') {
                
                    return this.where({ 'reactions.negative': { '$gte': 0.25 * config.crit_mass } })
                
                } else if (popularity === 'controversial') {
                
                    return this.where({ 'reactions.negative': { '$gte': 0.25 * config.crit_mass },
                        'reactions.positive': { '$gte': 0.25 * config.crit_mass } })
                
                } else {
                    throw Error("Popularity in byPopularity qyery helper can only be popular, unpopular or controversial")
                }
            },
            byTimeFrame(timeFrame){
                if (timeFrame === 'all') {
                    return this;
                } else if (timeFrame === 'today') {

                    return this.where({ 
                        'meta.created': {
                            $gte: dayjs().second(0).hour(0).minute(0).toDate(),
                        } 
                    })
                
                } else if (timeFrame === 'week') {

                    return this.where({
                        'meta.created': {
                            $gte: dayjs().day(1).hour(0).minute(0).toDate(),
                        }
                    })

                } else if (timeFrame === 'month') {
                    
                    return this.where({
                        'meta.created': {
                            $gte: dayjs().date(1).hour(0).minute(0).second(0).toDate(),
                        }
                    })

                } else {
                    throw Error("timeFrame in byTimeFrame qyery helper can only be all, today, week or month")
                }

            }
        }
    }
);


const Message = mongoose.model('Message', MessageSchema);

module.exports = Message;