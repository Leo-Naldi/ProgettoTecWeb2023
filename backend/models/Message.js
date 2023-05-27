const mongoose = require('mongoose');
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

const ContentSchema = new mongoose.Schema({
    text: String,
    image: String,
}, { _id: false })


const MessageSchema = new mongoose.Schema({
        content: {
            type: ContentSchema,
        },
        author: {
            type: mongoose.ObjectId,
            ref: 'User',
            required: true,
        },
        destChannel: [{ 
            type: mongoose.ObjectId,
            ref: 'Channel', 
        }],
        destUser: [{
            type: mongoose.ObjectId,
            ref: 'User',
        }],
        answering: {
            type: mongoose.ObjectId,  // Id dello squeal a cui si sta rispondendo
            ref: 'Message',
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
        },
        publicMessage: { 
            type: Boolean, 
            required: true, 
            default: true 
        }
    }, {
        virtuals: {
            // Le info ridondanti possono essere messe come virtual
            reactionCount: {
                get() {
                    return this.reactions.positive + this.reactions.negative
                }
            },
            privateMessage:  {
                get() {
                    return !this.publicMessage;
                }
            }
        },
        query: {
        
            byPopularity(popularity) {

                
                if (popularity === 'popular') {
                
                    return this.where('reactions.positive').gte(config.fame_threshold)
                        .where('reactions.negative').lt(config.fame_threshold);
                
                } else if (popularity === 'unpopular') {
                
                    return this.where('reactions.positive').lt(config.fame_threshold)
                        .where('reactions.negative').gte(config.fame_threshold);
                
                } else if (popularity === 'controversial') {
                
                    return this.where('reactions.positive').gte(config.fame_threshold)
                        .where('reactions.negative').gte(config.fame_threshold);
                
                } else {
                    throw Error("Popularity in byPopularity qyery helper can only be popular, unpopular or controversial")
                }
            },
            byRisk(popularity){

                if (popularity === 'popular') {

                    return this.where('reactions.positive').gte(config.danger_threshold).lt(config.fame_threshold)
                        .where('reactions.negative').lt(config.danger_threshold);

                } else if (popularity === 'unpopular') {

                    return this.where('reactions.negative').gte(config.danger_threshold).lt(config.fame_threshold)
                        .where('reactions.positive').lt(config.danger_threshold);

                } else if (popularity === 'controversial') {

                    return this.or([
                        { 'reactions.positive': { '$lt': config.fame_threshold }}, 
                        { 'reactions.negative': { '$lt': config.fame_threshold } }])
                        .where('reactions.positive').gte(config.danger_threshold)
                        .where('reactions.negative').gte(config.danger_threshold);

                } else {
                    throw Error("Popularity in byPopularity qyery helper can only be popular, unpopular or controversial")
                }
            },
            byTimeFrame(timeFrame){
                if (timeFrame === 'all') {
                    return this;
                } else if ((timeFrame === 'today') || (timeFrame === 'day')) {

                    return this.where('meta.created')
                        .lte(dayjs().toDate())
                        .gte(dayjs().startOf('day').toDate());
                
                } else if (timeFrame === 'week') {

                    return this.where('meta.created')
                        .lte(dayjs().toDate())
                        .gte(dayjs().startOf('week').toDate());

                } else if (timeFrame === 'month') {
                    
                    return this.where('meta.created')
                        .lte(dayjs().toDate())
                        .gte(dayjs().startOf('month').toDate());

                } else if (timeFrame === 'year') {

                    return this.where('meta.created')
                        .lte(dayjs().toDate())
                        .gte(dayjs().startOf('year').toDate());

                } else {
                    throw Error("timeFrame in byTimeFrame qyery helper can only be all, today, week or month")
                }

            }
        }
    }
);


const Message = mongoose.model('Message', MessageSchema);

module.exports = Message;