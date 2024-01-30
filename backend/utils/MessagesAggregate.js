const { mongoose } = require('mongoose');

const _ = require('underscore');
const Message = require('../models/Message');

const config = require('../config');
const dayjs = require('dayjs');
const { logger } = require('../config/logging');

const allowedSortFields = [
    'meta.created',
    'created',
    'reactions.positive',
    'positive',
    'reactions.negative',
    'negative',
    '-meta.created',
    '-created',
    '-reactions.positive',
    '-positive',
    '-reactions.negative',
    '-negative',
]

class MessagesAggregate {

    constructor(aggregate = Message.aggregate().match({})) {
        this.aggregate = aggregate;
        this.count_aggregate = null;
    }

    #matchTimePeriod(period) {

        if (period === 'today') period = 'day';

        const start = dayjs().startOf(period).toDate();

        if (period !== 'all') {

            this.aggregate.match({
                'meta.created': {
                    '$gte': start,
                }
            })
        }
    }

    matchTimeFrame(before, after) {
        if (before) {
            this.aggregate.match({
                'meta.created': {
                    '$lte': (new dayjs(before)).toDate(),
                }
            })
        }

        if (after) {
            this.aggregate.match({
                'meta.created': {
                    '$gte': (new dayjs(after)).toDate(),
                }
            })
        }
    }

    matchFame(popular, unpopular, controversial, risk) {
        if (controversial) {

            // reactions
            this.aggregate.match({
                '$and': [
                    {
                        'reactions.positive': { '$gte': config.fame_threshold }
                    },
                    {
                        'reactions.negative': { '$gte': config.fame_threshold }
                    },
                ]
            });
            // timeframe
            this.#matchTimePeriod(controversial);

        } else if (popular) {

            // reactions
            this.aggregate.match({
                '$and': [
                    {
                        'reactions.positive': { '$gte': config.fame_threshold }
                    },
                    {
                        'reactions.negative': { '$lt': config.fame_threshold }
                    },
                ]
            });
            // timeframe
            this.#matchTimePeriod(popular);

        } else if (unpopular) {

            // reactions
            this.aggregate.match({
                '$and': [
                    {
                        'reactions.negative': { '$gte': config.fame_threshold }
                    },
                    {
                        'reactions.positive': { '$lt': config.fame_threshold }
                    },
                ]
            });
            // timeframe
            this.#matchTimePeriod(unpopular);

        } else if (risk) {
            if (risk === 'controversial') {
                this.aggregate.match({
                    '$and': [
                        {
                            'reactions.negative': { '$gte': config.danger_threshold }
                        },
                        {
                            'reactions.positive': { '$gte': config.danger_threshold }
                        },
                        {
                            '$or': [
                                {
                                    'reactions.negative': { '$lt': config.fame_threshold }
                                },
                                {
                                    'reactions.positive': { '$lt': config.fame_threshold }
                                },
                            ]
                        }
                    ]
                });
            } else if (risk === 'popular') {
                this.aggregate.match({
                    '$and': [
                        {
                            'reactions.negative': { '$lt': config.danger_threshold }
                        },
                        {
                            'reactions.positive': {
                                '$gte': config.danger_threshold,
                                '$lt': config.fame_threshold,
                            }
                        },
                    ]
                });
            } else if (risk === 'unpopular') {
                this.aggregate.match({
                    '$and': [
                        {
                            'reactions.positive': { '$lt': config.danger_threshold }
                        },
                        {
                            'reactions.negative': {
                                '$gte': config.danger_threshold,
                                '$lt': config.fame_threshold,
                            }
                        },
                    ]
                });
            }
        }
    }

    lookupDestUser() {

        this.aggregate.lookup({
            from: 'users',
            localField: 'destUser',
            foreignField: '_id',
            as: 'destUser_docs',
        });

    }

    lookupDestChannel() {
        this.aggregate.lookup({
            from: 'channels',
            localField: 'destChannel',
            foreignField: '_id',
            as: 'destChannel_docs',
        });
    }

    lookupAuthor() {
        this.aggregate.lookup({
            from: 'users',
            localField: 'author',
            foreignField: '_id',
            as: 'author_doc',
        });

        this.aggregate.unwind('author_doc');
    }

    lookupAuthorSmm() {
        this.aggregate.lookup({
            from: 'users',
            localField: 'author_doc.smm',
            foreignField: '_id',
            as: 'author_smm_doc',
        })

        this.aggregate.unwind({ path: '$author_smm_doc', preserveNullAndEmptyArrays: true });
    }

    lookupAnsweringWithAuthor() {
        this.aggregate.lookup({
            from: 'messages',
            localField: 'answering',
            foreignField: '_id',
            as: 'answering_doc',
        });

        this.aggregate.unwind({ path: '$answering_doc', preserveNullAndEmptyArrays: true });

        this.aggregate.lookup({
            from: 'users',
            localField: 'answering_doc.author',
            foreignField: '_id',
            as: 'answering_author_doc',
        })

        this.aggregate.unwind({ path: '$answering_author_doc', preserveNullAndEmptyArrays: true });

        this.aggregate.lookup({
            from: 'users',
            localField: 'answering_author_doc.smm',
            foreignField: '_id',
            as: 'answering_author_smm_doc',
        })

        this.aggregate.unwind({ path: '$answering_author_smm_doc', preserveNullAndEmptyArrays: true });
    }

    lookupDestChannelMembers(){
        this.aggregate.lookup({
            from: 'users',
            let: { destChannel: '$destChannel' },
            pipeline: [
                {
                    $unwind: '$joinedChannels',
                },
                {
                    $match: {
                        $expr: { $in: ['$joinedChannels', '$$destChannel'] }
                    }
                },
                {
                    $project: { handle: 1, _id: 1 }
                },
                {
                    $group: {
                        _id: '$_id',
                        handle: { '$first': '$handle' },
                    }
                }
            ],
            as: 'dest_channel_members_docs'
        })
    }

    lookup(){
        this.lookupDestChannel();
        this.lookupDestUser();
        this.lookupAuthor();
        this.lookupAuthorSmm();
        this.lookupAnsweringWithAuthor();
        this.lookupDestChannelMembers();
    }

    matchDest(dest) {

        if (dest) {
            if (!_.isArray(dest)) {
                dest = [dest];
            }


            let handles = dest?.filter(val => ((val.charAt(0) === '@') && (val.length > 1)))
                .map(h => h.slice(1));
            let names = dest?.filter(val => ((val.charAt(0) === '§') && (val.length > 1)))
                .map(name => name.slice(1));


            if (handles?.length) {

                this.aggregate.match({
                    'destUser_docs.handle': {
                        '$all': handles,
                    }
                })
            }

            if (names?.length) {
                this.aggregate.match({
                    'destChannel_docs.name': {
                        '$all': names,
                    }
                })
            }
        }
    }

    matchFields({
        reqUser = null,
        official = null,
        author = null,
        publicMessage = null,
        answering = null,
        mentions = [],
        keywords = [],
        text = '',
        author_filter = '',
    }) {
        let filter = {};


        if (reqUser) {
            filter['$or'] = [
                { 'author': reqUser._id },
                { 'destUser': reqUser._id },
                { 'publicMessage': true },
                { 'destChannel': { '$in': reqUser.joinedChannels } },
            ]
        } else {
            filter['$and'] = [
                {
                    'publicMessage': true,
                },
                {
                    'official': true,
                }
            ]
        }



        if (_.isBoolean(official)) filter.official = official;
        if (author) filter.author = author._id;
        if (_.isBoolean(publicMessage)) filter.publicMessage = publicMessage;
        if (answering) filter.answering = new mongoose.Types.ObjectId(answering);

        if ((mentions?.length) || (keywords?.length) || (text?.length)) {


            let pattern = '^';

            if (_.isString(mentions)) {
                mentions = [mentions]
            } else if (!_.isArray(mentions)) {
                mentions = []
            }

            if (_.isString(keywords)) {
                keywords = [keywords]
            } else if (!_.isArray(keywords)) {
                keywords = []
            }

            if (!_.isString(text)) text = '';

            if (keywords?.length) {

                // Turn the mentions array into '(?=.*#kw1)(?=.*#kw2)(?=.*#kw3)...'
                pattern += keywords.reduce((pattern, keyword) => {
                    if (keyword.charAt(0) !== '#') {
                        keyword = '#' + keyword.trim();
                    }

                    keyword = keyword.trim();
                    pattern += `(?=.*${keyword})`;

                    return pattern;
                }, '');
            }

            if (mentions?.length) {

                // Turn the mentions array into '(?=.*@u1)(?=.*@u2)(?=.*@u3)...'
                pattern += mentions.reduce((pattern, mention) => {
                    if (mention.charAt(0) !== '@') {
                        mention = '@' + mention.trim();
                    }

                    mention = mention.trim();
                    pattern += `(?=.*${mention})`;

                    return pattern;
                }, '');
            }

            if (text?.length) {
                pattern += `(?=.*${text})`;
            }

            if (pattern !== '^') {

                filter['content.text'] = {
                    '$regex': pattern,
                    '$options': 'i',
                    '$exists': true,
                };
            }
        }

        if ((_.isString(author_filter)) && (author_filter?.length)) {

            filter['author_doc.handle'] = {
                '$exists': true,
                '$regex': author_filter,
                '$options': 'i'
            }
        }

        this.aggregate.match(filter);
    }

    sort(sortField) {
        if (allowedSortFields.find(elem => elem === sortField)) {

            switch (sortField) {
                case 'created':
                    this.aggregate.sort('meta.created')
                    break;
                case 'positive':
                    this.aggregate.sort('reactions.positive')
                    break;
                case 'negative':
                    this.aggregate.sort('reactions.negative')
                    break;
                case '-created':
                    this.aggregate.sort('-meta.created')
                    break;
                case '-positive':
                    this.aggregate.sort('-reactions.positive')
                    break;
                case '-negative':
                    this.aggregate.sort('-reactions.negative')
                    break;
                default:
                    this.aggregate.sort(sortField);
                    break;
            }
        }
    }

    countAndSlice(page, results_per_page) {

        this.count_aggregate = Message.aggregate(this.aggregate.pipeline()).count('total_results');
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

    static parseDocument(doc, deleteAuthor = false) {
        doc.id = doc._id.toString();
        doc.author = doc.author_doc.handle;
        doc.dest = [
            ...doc.destChannel_docs.map(c => `§${c.name}`),
            ...doc.destUser_docs.map(u => `@${u.handle}`),
        ];

        delete doc.__v;
        delete doc.author_doc;
        delete doc.destChannel_docs;
        delete doc.destUser_docs;
        delete doc.destUser;
        delete doc.destChannel;
        delete doc.answering_doc;
        delete doc.answering_author_doc;
        delete doc.answering_author_smm_doc;

        doc.meta.impressions += 1;

        if (deleteAuthor) delete doc.author;

        return doc;
    }

    static parsePaginatedResults(results, page, results_per_page) {


        if (results[0].documents.length === 0) results[0].meta = [{ total_results: 0 }];

        if (page > 0) {
            return {
                pages: Math.ceil(results[0].meta[0].total_results / results_per_page),
                results: results[0].documents.map((d) => MessagesAggregate.parseDocument(d)),
            }
        } else {
            return {
                pages: 1,
                results: results[0].documents.map((d) => MessagesAggregate.parseDocument(d)),
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

    static get_update_ids(res, reqUser) {
        if (reqUser) {
            return _.pluck(res[0].documents.filter(d => d.handle !== reqUser.handle), '_id')
        } else {
            return _.pluck(res[0].documents, '_id');
        }
    }
}

module.exports = MessagesAggregate;