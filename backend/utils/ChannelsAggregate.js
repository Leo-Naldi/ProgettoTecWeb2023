const config = require('../config');
const dayjs = require('dayjs');
const { logger } = require('../config/logging');
const Channel = require('../models/Channel');
const _ = require('underscore');


const allowedSortFields = [
    'meta.created',
    'created',
    'popular',
    '-popular',
    'unpopular',
    '-unpopular',
]

class ChannelsAggregate {

    constructor(aggregate = Channel.aggregate()) {
        this.aggregate = aggregate;
    }

    lookupCreator(){
        this.aggregate.lookup({
            from: 'users',
            localField: 'creator',
            foreignField: '_id',
            as: 'creator_doc',
        });

        this.aggregate.unwind('creator_doc');
    }

    lookupMembers() {
        this.aggregate.lookup({
            from: 'users',
            let: { cid: '$_id' },
            pipeline: [
                {
                    '$match': {
                        '$expr': {
                            '$in': [
                                '$$cid',
                                '$joinedChannels'
                            ]
                        }
                    }
                },
                {
                    '$project': {
                        _id: 1,
                        handle: 1,
                    }
                }
            ],
            as: 'member_docs',
        });
    }

    lookupEditors() {
        this.aggregate.lookup({
            from: 'users',
            let: { cid: '$_id' },
            pipeline: [
                {
                    '$match': {
                        '$expr': {
                            '$in': [
                                '$$cid',
                                '$editorChannels'
                            ]
                        }
                    }
                },
                {
                    '$project': {
                        _id: 1,
                        handle: 1,
                    }
                }
            ],
            as: 'editor_docs',
        });
    }
    
    lookupMemberRequests() {
        this.aggregate.lookup({
            from: 'users',
            let: { cid: '$_id' },
            pipeline: [
                {
                    '$match': {
                        '$expr': {
                            '$in': [
                                '$$cid',
                                '$joinChannelRequests'
                            ]
                        }
                    }
                },
                {
                    '$project': {
                        _id: 1,
                        handle: 1,
                    }
                }
            ],
            as: 'member_request_docs',
        });
    }

    lookupEditorRequests() {
        this.aggregate.lookup({
            from: 'users',
            let: { cid: '$_id' },
            pipeline: [
                {
                    '$match': {
                        '$expr': {
                            '$in': [
                                '$$cid',
                                '$editorChannelRequests'
                            ]
                        }
                    }
                },
                {
                    '$project': {
                        _id: 1,
                        handle: 1,
                    }
                }
            ],
            as: 'editor_request_docs',
        });
    }

    lookup() {
        this.lookupCreator();
        this.lookupMembers();
        this.lookupEditors();
        this.lookupMemberRequests();
        this.lookupEditorRequests();
    }

    matchFields({
        owner = null, 
        publicChannel = null,
        member = null, 
        name = null, 
        official = null,
    }) {
        let filter = {};

        if ((_.isString(name)) && (name?.length)) {
            filter.name = {
                $regex: name,
                $options: 'i',
            };
        }

        if (_.isBoolean(official)) {
            filter.official = official;
        }

        if (_.isBoolean(publicChannel)) {
            filter.publicChannel = publicChannel;
        }

        if (owner) {
            filter['creator_doc.handle'] = owner;
        }
        if (member) {
            filter.member_docs = {
                '$elemMatch': { handle: member }
            }
        }

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

        let documents_pipeline = [];
        if (page > 0) {
            documents_pipeline.push({
                '$skip': (page - 1) * results_per_page,
            });
            documents_pipeline.push({
                '$limit': results_per_page,
            })
        }

        this.aggregate.facet({
            "meta": [{
                '$count': "total_results",
            }],
            "documents": documents_pipeline,
        })
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

        logger.debug(results.length)
        logger.debug(Object.keys(results[0]))
        logger.debug(results[0].meta.length)

        if (results[0].documents.length === 0) results[0].meta = [{ total_results: 0 }];

        if (page > 0) {
            return {
                pages: Math.ceil(results[0].meta[0].total_results / results_per_page),
                results: results[0].documents.map((d) => ChannelsAggregate.parseDocument(d)),
            }
        } else {
            return {
                pages: 1,
                results: results[0].documents.map((d) => ChannelsAggregate.parseDocument(d)),
            }
        }
    }

    async run() {
        return await this.aggregate;
    }
}

module.exports = ChannelsAggregate;