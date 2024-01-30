const { mongoose } = require('mongoose');

const _ = require('underscore');
const Message = require('../models/Message');

const config = require('../config');
const dayjs = require('dayjs');
const User = require('../models/User');
const { logger } = require('../config/logging');

const allowedSortFields = [
    'meta.created',
    'created',
    '-meta.created',
    '-created',
    'popular',
    '-popular',
    'unpopular',
    '-unpopular',
]

class UsersAggregate {

    constructor(aggregate = User.aggregate().match({})) {
        this.aggregate = aggregate;
        this.count_aggregate = null;
    }


    lookupEditorChannels() {
        this.aggregate.lookup({
            from: 'channels',
            localField: 'editorChannels',
            foreignField: '_id',
            as: 'editorChannels_docs',
        })
    }

    lookupJoinedChannels() {
        this.aggregate.lookup({
            from: 'channels',
            localField: 'joinedChannels',
            foreignField: '_id',
            as: 'joinedChannels_docs',
        })
    }

    lookupEditorChannelRequests() {
        this.aggregate.lookup({
            from: 'channels',
            localField: 'editorChannelRequests',
            foreignField: '_id',
            as: 'editorChannelRequests_docs',
        })
    }

    lookupJoinedChannelRequests() {
        this.aggregate.lookup({
            from: 'channels',
            localField: 'joinChannelRequests',
            foreignField: '_id',
            as: 'joinChannelRequests_docs',
        })
    }

    lookupSmm() {
        this.aggregate.lookup({
            from: 'users',
            localField: 'smm',
            foreignField: '_id',
            as: 'smm_doc',
        })

        this.aggregate.unwind({ path: '$smm_doc', preserveNullAndEmptyArrays: true });
    }

    lookupManaged(){
        this.aggregate.lookup({
            from: 'users',
            let: { uid: '$_id' },
            pipeline: [
                {
                    $match: {
                        $expr: {
                            $eq: [ '$smm', '$$uid' ]
                        }
                    }
                },
                {
                    '$project': {
                        _id: 1,
                        handle: 1,
                        smm: 1,
                    }
                }
            ],
            as: 'managed_docs'
        })
    }

    lookupLiked(){
        this.aggregate.lookup({
            from: 'reactions',
            let: { uid: '$_id' },
            pipeline: [
                {
                    $match: {
                        $expr: {
                            $eq: ['$user', '$$uid']
                        },
                        'type': 'positive'
                    }
                },
                {
                    '$project': {
                        message: 1,
                    }
                }
            ],
            as: 'liked_docs'
        })
    }

    lookupDisiked() {
        this.aggregate.lookup({
            from: 'reactions',
            let: { uid: '$_id' },
            pipeline: [
                {
                    $match: {
                        $expr: {
                            $eq: ['$user', '$$uid']
                        },
                        'type': 'negative'
                    }
                },
                {
                    '$project': {
                        message: 1,
                    }
                }
            ],
            as: 'disliked_docs'
        })
    }

    lookupReactionCounts(){
        this.aggregate.lookup({
            from: 'messages',
            localField: '_id',
            foreignField: 'author',
            as: 'messages_docs',
        })
            .unwind({ path: '$messages_docs', preserveNullAndEmptyArrays: true })
        .group({
            _id: '$_id',
            positive_count: { $sum: "$messages_docs.reactions.positive" },
            negative_count: { $sum: "$messages_docs.reactions.negative" },
            doc: { $first: '$$ROOT' }
        })
        .replaceRoot({
            $mergeObjects: ["$$ROOT", '$doc']
        })
        .project({
            messages_docs: 0,
            doc: 0,
        })
    }

    lookupProPlan(){
        this.aggregate.lookup({
            from: 'plans',
            localField: 'subscription.proPlan',
            foreignField: '_id',
            as: 'proPlan_doc'
        })

        this.aggregate.unwind({ path: '$proPlan_doc', preserveNullAndEmptyArrays: true })
    }

    lookup() {
        this.lookupEditorChannelRequests()
        this.lookupJoinedChannelRequests()
        this.lookupEditorChannels()
        this.lookupJoinedChannels()
        this.lookupSmm();
        this.lookupManaged();
        this.lookupProPlan();
        this.lookupDisiked();
        this.lookupLiked();
        this.lookupReactionCounts();
    }

    matchFields({
        handle=null,
        admin=null,
        accountType=null,
    }) {
        let filter = {};

        if (handle) filter.handle = { $regex: handle, $options: 'i' };
        if (_.isBoolean(admin)) filter.admin = admin;
        if (accountType) filter.accountType = accountType;

        if (filter)
            this.aggregate.match(filter);
    }

    sort(sortField) {
        if (allowedSortFields.find(elem => elem === sortField)) {

            switch (sortField) {
                case 'created':
                case 'meta.created':
                    this.aggregate.sort('meta.created')
                    break;
                case '-created':
                case '-meta.created':
                    this.aggregate.sort('-meta.created')
                    break;
                case 'popular':
                    this.aggregate.sort('-positive_count')
                    break;
                case '-popular':
                    this.aggregate.sort('positive_count')
                    break;
                case 'unpopular':
                    this.aggregate.sort('-negative_count')
                    break;
                case '-unpopular':
                    this.aggregate.sort('negative_count')
                    break;
                default:
                    this.aggregate.sort('-meta.created');
                    break;
            }
        }
    }

    countAndSlice(page, results_per_page) {

        this.count_aggregate = User.aggregate(this.aggregate.pipeline()).count('total_results');
        if (page > 0) {
            this.aggregate.skip((page - 1) * results_per_page);
            this.aggregate.limit(results_per_page);
        }
    }

    slice(page, results_per_page) {
        if (page > 0) {
            this.aggregate.skip((page - 1) * results_per_page);
            this.aggregate.limit(results_per_page);
        }
    }

    static parseDocument(u) {
        u.smm = u.smm_doc?.handle;
        u.managed = u.managed_docs.map(m => m.handle);
        u.joinedChannels = u.joinedChannels_docs.map(c => c.name);
        u.editorChannels = u.editorChannels_docs.map(c => c.name);
        u.joinChannelRequests = u.joinChannelRequests_docs.map(c => c.name);
        u.editorChannelRequests = u.editorChannelRequests_docs.map(c => c.name);

        if (u.subscription) {
            u.subscription.proPlan = u.proPlan_doc;
            delete u.subscription.proPlan.__v;
            u.subscription.proPlan.id = u.subscription.proPlan._id.toString();
        }

        u.liked = _.pluck(u.liked_docs, 'message');
        u.disliked = _.pluck(u.disliked_docs, 'message');
        u.total_likes = u.positive_count;
        u.total_dislikes = u.negative_count;
        
        delete u.positive_count;
        delete u.negative_count;
        delete u.proPlan_doc;
        delete u.smm_doc;
        delete u.managed_docs;
        delete u.editorChannelRequests_docs;
        delete u.joinChannelRequests_docs;
        delete u.editorChannels_docs;
        delete u.joinedChannels_docs;
        delete u.liked_docs;
        delete u.disliked_docs
        delete u.password;
        delete u.__v;

        u.id = u._id.toString();

        return u;
    }

    static parsePaginatedResults(results, page, results_per_page) {

        if (results[0].documents.length === 0) results[0].meta = [{ total_results: 0 }];

        if (page > 0) {
            return {
                pages: Math.ceil(results[0].meta[0].total_results / results_per_page),
                results: results[0].documents.map((d) => UsersAggregate.parseDocument(d)),
            }
        } else {
            return {
                pages: 1,
                results: results[0].documents.map((d) => UsersAggregate.parseDocument(d)),
            }
        }
    }

    async run() {
        if (!this.count_aggregate)
            return await this.aggregate;

        let res = await Promise.all([
            this.aggregate,
            this.count_aggregate,
        ])

        if (res[0].length)
            return [{ meta: [{ total_results: res[1][0].total_results }], documents: res[0] }]

        return [{ meta: [{ total_results: 0 }], documents: res[0] }]
    }
}

module.exports = UsersAggregate;