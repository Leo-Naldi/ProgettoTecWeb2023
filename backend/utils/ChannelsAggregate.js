const config = require('../config');
const dayjs = require('dayjs');
const { logger } = require('../config/logging');
const Channel = require('../models/Channel');
const _ = require('underscore');


const allowedSortFields = [
    'created',
    '-created',
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
        editor = null,
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

        if (editor) {
            filter.editor_docs = {
                '$elemMatch': { handle: editor }
            }
        }

        this.aggregate.match(filter);

    }

    sort(sortField) {
        if (allowedSortFields.find(elem => elem === sortField)) {

            switch (sortField) {
                case 'created':
                    this.aggregate.sort('created')
                    break;
                case '-created':
                    this.aggregate.sort('-created')
                default:
                    this.aggregate.sort('-created');
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

    static parseDocument(c, reqUser) {

        c.creator = c.creator_doc.handle;
        c.members = _.pluck(c.member_docs, 'handle');
        c.editors = _.pluck(c.editor_docs, 'handle');
        c.memberRequests = _.pluck(c.member_request_docs, 'handle');
        c.editorRequests = _.pluck(c.editor_request_docs, 'handle');

        c.id = c._id.toString();

        if (!((c.publicChannel) ||
            (reqUser && reqUser?.joinedChannels.some(id => id.equals(c._id))))) {

            // private channels can only be viewed by members
            delete c.members;
            delete c.editors;
            delete c.memberRequests;
            delete c.editorRequests;
        }

        delete c.member_docs;
        delete c.editor_docs;
        delete c.editor_request_docs;
        delete c.member_request_docs;
        delete c.creator_doc      
        delete c.__v;

        return c;
    }

    static parsePaginatedResults(results, page, results_per_page, reqUser) {

        if (results[0].documents.length === 0) results[0].meta = [{ total_results: 0 }];

        if (page > 0) {
            return {
                pages: Math.ceil(results[0].meta[0].total_results / results_per_page),
                results: results[0].documents.map((d) => ChannelsAggregate.parseDocument(d, reqUser)),
            }
        } else {
            return {
                pages: 1,
                results: results[0].documents.map((d) => ChannelsAggregate.parseDocument(d, reqUser)),
            }
        }
    }

    async run() {
        return await this.aggregate;
    }
}

module.exports = ChannelsAggregate;