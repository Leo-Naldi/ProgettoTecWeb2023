let expect = require('chai').expect;
const dayjs = require('dayjs');
let isBetween = require('dayjs/plugin/isBetween')
let isSameOrBefore = require('dayjs/plugin/isSameOrBefore')
let isSameOrAfter = require('dayjs/plugin/isSameOrAfter')

dayjs.extend(isBetween)
dayjs.extend(isSameOrBefore)
dayjs.extend(isSameOrAfter)

const config = require('../config');
const User = require('../models/User');
const Message = require('../models/Message');
const Channel = require('../models/Channel');
const MessageService = require('../services/MessageServices');
const { testUser, addMessage, UserDispatch, lorem, createChannel } = require('./hooks');
const { getRandom, getDateWithin } = require('../utils/getDateWithin');
const {
    checkFame,
    checkRiskOfFame,
    getUnpopular,
    getControversial,
    getRiskPopular,
    getPopular,
    getRiskUnpopular,
    getRiskControversial,
} = require('../utils/fameUtils');


const {
    checkErrorCode,
    checkSuccessCode,
    checkPayloadArray,
    checkPayloadObject,
    checkObject,
    checkArray,
} = require('../utils/testingUtils');

const messagesCount = 30;


const periods = ['today', 'week', 'month', 'year'];
const maxMessages = 20;

const fames = ['popular', 'unpopular', 'controversial'];
const timeframes = ['day', 'week', 'month', 'year'];

describe("getMessagesStats Unit Tests", function () {

    let reqUser = null, users = [], secondAuthor = null;

    before(async function () {
        /*
        *  NB this breaks the character limits, messages should be added using the service
        */
        this.timeout(7000)

        reqUser = await User.findOne({ handle: UserDispatch.getNext().handle }).orFail();
        users = [
            await User.findOne({ handle: UserDispatch.getNext().handle }).orFail(),
            await User.findOne({ handle: UserDispatch.getNext().handle }).orFail(),
            await User.findOne({ handle: UserDispatch.getNext().handle }).orFail(),
            await User.findOne({ handle: UserDispatch.getNext().handle }).orFail(),
            await User.findOne({ handle: UserDispatch.getNext().handle }).orFail(),
            await User.findOne({ handle: UserDispatch.getNext().handle }).orFail(),
            await User.findOne({ handle: UserDispatch.getNext().handle }).orFail(),
            await User.findOne({ handle: UserDispatch.getNext().handle }).orFail(),
            await User.findOne({ handle: UserDispatch.getNext().handle }).orFail(),
        ]

        let uids = users.map(u => u._id);

        const publicNotJoinedChannels = [
            // Public channels reqUser is not a member of
            new Channel({
                name: UserDispatch.getNextChannelName(),
                description: lorem.generateParagraphs(1),
                members: uids.slice(0, Math.floor(uids.length / 2)),
                creator: uids[0],
            }),
            new Channel({
                name: UserDispatch.getNextChannelName(),
                description: lorem.generateParagraphs(1),
                members: uids.slice(Math.floor(uids.length / 2)),
                creator: uids[Math.floor(uids.length / 2)]
            }),
        ]

        // Public channels reqUser is a member of
        const publicJoinedChannels = [
            new Channel({
                name: UserDispatch.getNextChannelName(),
                description: lorem.generateParagraphs(1),
                members: uids.slice(0, Math.floor(uids.length / 2)).concat([reqUser._id]),
                creator: uids[0]
            }),
            new Channel({
                name: UserDispatch.getNextChannelName(),
                description: lorem.generateParagraphs(1),
                members: uids.slice(Math.floor(uids.length / 2)).concat([reqUser._id]),
                creator: uids[Math.floor(uids.length / 2)]
            }),
            new Channel({
                name: UserDispatch.getNextChannelName(),
                description: lorem.generateParagraphs(1),
                members: uids.slice(Math.floor(uids.length / 2)).concat([reqUser._id]),
                creator: uids[Math.floor(uids.length / 2)],
                official: true,
            }),
        ]

        const privateNotJoinedChannels = [
            // Public channels reqUser is not a member of
            new Channel({
                name: UserDispatch.getNextChannelName(),
                description: lorem.generateParagraphs(1),
                members: uids.slice(0, Math.floor(uids.length / 2)),
                publicChannel: false,
                creator: uids[0]
            }),
            new Channel({
                name: UserDispatch.getNextChannelName(),
                description: lorem.generateParagraphs(1),
                members: uids.slice(Math.floor(uids.length / 2)),
                publicChannel: false,
                creator: uids[Math.floor(uids.length / 2)]
            }),
        ]

        // Public channels reqUser is a member of
        const privateJoinedChannels = [
            new Channel({
                name: UserDispatch.getNextChannelName(),
                description: lorem.generateParagraphs(1),
                members: uids.slice(0, Math.floor(uids.length / 2)).concat([reqUser._id]),
                publicChannel: false,
                creator: uids[0]
            }),
            new Channel({
                name: UserDispatch.getNextChannelName(),
                description: lorem.generateParagraphs(1),
                members: uids.slice(Math.floor(uids.length / 2)).concat([reqUser._id]),
                publicChannel: false,
                creator: uids[Math.floor(uids.length / 2)]
            })
        ]

        let messages = [];

        // Random Messages
        for (let i = 0; i < messagesCount; i++) {

            messages.push(new Message({
                content: {
                    text: lorem.generateSentences(getRandom(3) + 1),
                },
                author: reqUser._id,
                destUser: uids,
                reactions: {
                    positive: 10,
                    negative: 10,
                }
            }))

            messages.push(new Message({
                content: {
                    text: lorem.generateSentences(getRandom(3) + 1),
                },
                author: reqUser._id,
                destUser: uids,
                reactions: {
                    positive: 10,
                    negative: 10,
                },
                publicMessage: false,
            }))

            messages.push(new Message({
                content: {
                    text: lorem.generateSentences(getRandom(3) + 1),
                },
                author: uids[0],
                destUser: uids.slice(1),
                reactions: {
                    positive: 10,
                    negative: 10,
                },
                publicMessage: false,
            }))

            messages.push(new Message({
                content: {
                    text: lorem.generateSentences(getRandom(3) + 1),
                },
                author: uids[0],
                destUser: uids.slice(1),
                reactions: {
                    positive: 10,
                    negative: 10,
                },
                publicMessage: true,
            }))

            // private messages reqUser cant see
            messages.push(new Message({
                content: {
                    text: lorem.generateSentences(getRandom(3) + 1),
                },
                author: uids[0],
                destUser: uids.slice(1),
                destChannel: privateNotJoinedChannels.map(c => c._id),
                reactions: {
                    positive: 10,
                    negative: 10,
                },
                publicMessage: false,
            }))

            // private messages reqUser can see

            // These can be seen since reqUser is part of the channel
            messages.push(new Message({
                content: {
                    text: lorem.generateSentences(getRandom(3) + 1),
                },
                author: uids[0],
                destUser: uids.slice(1),
                destChannel: privateJoinedChannels.map(c => c._id),
                reactions: {
                    positive: 10,
                    negative: 10,
                },
                publicMessage: false,
            }))

            // These can be seen since reqUser is part of the dests
            messages.push(new Message({
                content: {
                    text: lorem.generateSentences(getRandom(3) + 1),
                },
                author: uids[0],
                destUser: uids.slice(1).concat([reqUser._id]),
                destChannel: privateNotJoinedChannels.map(c => c._id),
                reactions: {
                    positive: 10,
                    negative: 10,
                },
                publicMessage: false,
            }))

            // Public channels
            messages.push(new Message({
                content: {
                    text: lorem.generateSentences(getRandom(3) + 1),
                },
                author: reqUser._id,
                destUser: uids,
                destChannel: publicJoinedChannels.map(c => c._id),
                reactions: {
                    positive: 10,
                    negative: 10,
                },
                publicMessage: true,
            }))

            messages.push(new Message({
                content: {
                    text: lorem.generateSentences(getRandom(3) + 1),
                },
                author: uids[0],
                destUser: uids.slice(1),
                destChannel: [publicNotJoinedChannels[0]._id],
                reactions: {
                    positive: 10,
                    negative: 10,
                },
                publicMessage: false,
            }))
        }

        // Ensure there are public messages for every fame configuration and every time frame

        periods.map(p => {
            for (let i = 0; i < getRandom(maxMessages) + 1; i++) {

                messages.push(new Message({
                    content: {
                        text: lorem.generateSentences(getRandom(3) + 1),
                    },
                    author: reqUser._id,
                    destUser: uids,
                    meta: {
                        created: getDateWithin(p),
                    },
                    reactions: getPopular()
                }));

                messages.push(new Message({
                    content: {
                        text: lorem.generateSentences(getRandom(3) + 1),
                    },
                    author: reqUser._id,
                    destUser: uids,
                    meta: {
                        created: getDateWithin(p),
                    },
                    reactions: getUnpopular()
                }));

                messages.push(new Message({
                    content: {
                        text: lorem.generateSentences(getRandom(3) + 1),
                    },
                    author: reqUser._id,
                    destUser: uids,
                    meta: {
                        created: getDateWithin(p),
                    },
                    reactions: getControversial()
                }))

                messages.push(new Message({
                    content: {
                        text: lorem.generateSentences(getRandom(3) + 1),
                    },
                    author: reqUser._id,
                    destUser: uids,
                    meta: {
                        created: getDateWithin(p),
                    },
                    reactions: getRiskPopular()
                }))

                messages.push(new Message({
                    content: {
                        text: lorem.generateSentences(getRandom(3) + 1),
                    },
                    author: reqUser._id,
                    destUser: uids,
                    meta: {
                        created: getDateWithin(p),
                    },
                    reactions: getRiskUnpopular()
                }))

                messages.push(new Message({
                    content: {
                        text: lorem.generateSentences(getRandom(3) + 1),
                    },
                    author: reqUser._id,
                    destUser: uids,
                    meta: {
                        created: getDateWithin(p),
                    },
                    reactions: getRiskControversial()
                }))
            }
        })

        const times = [
            dayjs().startOf('day'),
            dayjs().startOf('week'),
            dayjs().startOf('month'),
            dayjs().startOf('year'),
        ];

        times.map(d => {
            messages.push(new Message({
                content: {
                    text: lorem.generateSentences(getRandom(3) + 1),
                },
                author: reqUser._id,
                destUser: uids,
                meta: {
                    created: d.subtract(1, 'hour'),
                },
                reactions: {
                    positive: 20,
                    negative: 20,
                }
            }))

            messages.push(new Message({
                content: {
                    text: lorem.generateSentences(getRandom(3) + 1),
                },
                author: reqUser._id,
                destUser: uids,
                meta: {
                    created: d.add(1, 'hour'),
                },
                reactions: {
                    positive: 20,
                    negative: 20,
                }
            }))
        })

        const allChannels = publicNotJoinedChannels
            .concat(publicJoinedChannels)
            .concat(privateJoinedChannels)
            .concat(privateNotJoinedChannels)

        const allUsers = users.concat([reqUser]);

        allChannels.map(c => {
            for (let i = 0; i < allUsers.length; i++) {
                if (c.members.find(id => id.equals(allUsers[i]._id))) {
                    allUsers[i].joinedChannels.push(c._id);
                }
            }
        })

        messages.map(m => {
            const ind = allUsers.findIndex(a => a._id.equals(m.author));

            expect(ind).to.not.equal(-1)

            allUsers[ind].messages.push(m._id);

            for (let i = 0; i < m.destChannel.length; i++) {

                const cind = allChannels.findIndex(c => c._id.equals(m.destChannel[i]));

                expect(cind).to.not.equal(-1)
                allChannels[cind].messages.push(m._id);
            }
        })

        await Promise.all(messages.map(m => m.save()));
        //console.log(accounts)
        await Promise.all(allUsers.map(u => u.save()));
        await Promise.all(allChannels.map(u => u.save()));

        reqUser = await User.findById(reqUser._id).orFail();

        const l = users.length;

        secondAuthor = users[0];

        users = await User.find({ handle: { $in: users.map(u => u.handle) } });

        secondAuthor = users.find(u => u._id.equals(secondAuthor._id));


        expect(users).to.be.an('array').that.has.lengthOf(l);

        const ad = await User.findOne({ handle: UserDispatch.getNextAdmin().handle }).orFail();

        official_channels = [
            new Channel({
                name: UserDispatch.getNextChannelName().toUpperCase(),
                description: lorem.generateParagraphs(1),
                creator: ad._id,
                members: [ad._id],
                official: true,
            }),
            new Channel({
                name: UserDispatch.getNextChannelName().toUpperCase(),
                description: lorem.generateParagraphs(1),
                creator: ad._id,
                members: [ad._id],
                official: true,
            }),
            new Channel({
                name: UserDispatch.getNextChannelName().toUpperCase(),
                description: lorem.generateParagraphs(1),
                creator: ad._id,
                members: [ad._id],
                official: true,
            })
        ]

        let official_messages = []
        for (let i = 0; i < 20; i++) {
            official_messages.push(
                new Message({
                    content: {
                        text: lorem.generateSentences(3),
                    },
                    author: ad._id,
                    destChannel: [official_channels[i % 3]._id],
                })
            )

            official_channels[i % 3].messages.push(
                official_messages.at(-1)._id
            )

            ad.messages.push(official_messages.at(-1)._id)
        }

        official_channels = await Promise.all(official_channels.map(c => c.save()));
        await Promise.all(official_messages.map(m => m.save()));
        admin = await ad.save();

        all = await Message.find();
    })

    it("Shoud fail if given handle does not exist", async function () {
        const res = await MessageService.getMessagesStats({
            reqUser: reqUser, handle: reqUser.handle + 'vwefvwefvwfv'
        });

        checkErrorCode(res);
    });

    it("Should return a stats object", async function () {
        const res = await MessageService.getMessagesStats({
            reqUser: reqUser, handle: reqUser.handle
        });

        checkSuccessCode(res);
        checkPayloadObject(res, ['positive', 'negative', 'total']);
        expect(res.payload.positive).to.be.a('number')
        expect(res.payload.negative).to.be.a('number')
        expect(res.payload.total).to.be.a('number')
    });

    describe("Filters Unit Tests", function () {   

        fames.map(fame => {
            timeframes.map(timeframe => {
                it(`Should return the correct vaulues for ${fame} messages from this ${timeframe}`, async function () {

                    let params = new Object();

                    expect(reqUser).to.not.be.null;

                    params[fame] = timeframe;
                    params.handle = reqUser.handle;
                    params.reqUser = reqUser;
                    params.page = -1

                    const resStats = await MessageService.getMessagesStats(params);

                    checkSuccessCode(resStats);
                    checkPayloadObject(resStats, ['positive', 'negative', 'total']);

                    const filter = await MessageService._addQueryChains({
                        query: Message.find(),
                        ...params,
                        author: reqUser,
                        filterOnly: true,
                    })

                    const AllMessages = await Message.find(filter);

                    expect(AllMessages).to.be.an('array').that.is.not.empty;

                    const totPos = AllMessages.reduce((acc, cur) => {
                        return acc + cur.reactions.positive;
                    }, 0)
                    const totNeg = AllMessages.reduce((acc, cur) => {
                        return acc + cur.reactions.negative;
                    }, 0)

                    expect(resStats.payload.positive).to.equal(totPos);
                    expect(resStats.payload.negative).to.equal(totNeg);
                    expect(AllMessages.length).to.equal(resStats.payload.total);

                    const extra = await MessageService.getUserMessages({
                        ...params, page: -1,
                    })

                    expect(extra.payload).to.have.lengthOf(resStats.payload.total)
                })
                it(`Should return the correct vaulues for ${fame} messages from this ${timeframe}`, async function () {

                    let params = new Object();

                    expect(reqUser).to.not.be.null;

                    params[fame] = timeframe;
                    params.handle = reqUser.handle;
                    params.reqUser = reqUser;
                    params.page = -1

                    const resStats = await MessageService.getMessagesStats(params);

                    checkSuccessCode(resStats);
                    checkPayloadObject(resStats, ['positive', 'negative', 'total']);

                    const filter = await MessageService._addQueryChains({
                        query: Message.find(),
                        ...params,
                        author: reqUser,
                        filterOnly: true,
                    })

                    const AllMessages = await Message.find(filter);

                    expect(AllMessages).to.be.an('array').that.is.not.empty;

                    const totPos = AllMessages.reduce((acc, cur) => {
                        return acc + cur.reactions.positive;
                    }, 0)
                    const totNeg = AllMessages.reduce((acc, cur) => {
                        return acc + cur.reactions.negative;
                    }, 0)

                    expect(resStats.payload.positive).to.equal(totPos);
                    expect(resStats.payload.negative).to.equal(totNeg);
                    expect(AllMessages.length).to.equal(resStats.payload.total);

                    const extra = await MessageService.getUserMessages({
                        ...params, page: -1,
                    })

                    expect(extra.payload).to.have.lengthOf(resStats.payload.total)
                })
            })
        })

        it("Should return the correct values when using the before field", async function () {
            await Promise.all([
                dayjs().startOf('week'),
                dayjs().startOf('month'),
                dayjs().startOf('year'),
            ].map(async d => {

                let params = new Object();

                expect(reqUser).to.not.be.null;

                params.before = d.toDate();
                params.handle = reqUser.handle;
                params.reqUser = reqUser;
                params.page = -1

                const resMessages = await MessageService.getUserMessages(params);

                const filter = await MessageService._addQueryChains({
                    ...params, author: reqUser,
                    filterOnly: true
                })

                const check = await Message.find(filter);

                expect(check).to.have.lengthOf(resMessages.payload.length)

                checkSuccessCode(resMessages);
                checkPayloadArray(resMessages);

                expect(resMessages.payload).to.not.be.empty

                const resStats = await MessageService.getMessagesStats(params);

                checkSuccessCode(resStats);
                checkPayloadObject(resStats, ['positive', 'negative', 'total']);

                const totPos = resMessages.payload.reduce((acc, cur) => {
                    return acc + cur.reactions.positive;
                }, 0)
                const totNeg = resMessages.payload.reduce((acc, cur) => {
                    return acc + cur.reactions.negative;
                }, 0)

                expect(resStats.payload.positive).to.equal(totPos);
                expect(resStats.payload.negative).to.equal(totNeg);
                expect(resMessages.payload.length).to.equal(resStats.payload.total);
            }));
        })

        it("Should return the correct values when using the after field", async function () {
            await Promise.all([
                dayjs().startOf('week'),
                dayjs().startOf('month'),
                dayjs().startOf('year'),
            ].map(async d => {

                let params = new Object();

                expect(reqUser).to.not.be.null;

                params.after = d.toDate();
                params.handle = reqUser.handle;
                params.reqUser = reqUser;
                params.page = -1

                const resMessages = await MessageService.getUserMessages(params);

                const filter = await MessageService._addQueryChains({
                    ...params, author: reqUser,
                    filterOnly: true
                })

                const check = await Message.find(filter);

                expect(check).to.have.lengthOf(resMessages.payload.length)

                checkSuccessCode(resMessages);
                checkPayloadArray(resMessages);

                expect(resMessages.payload).to.not.be.empty

                const resStats = await MessageService.getMessagesStats(params);

                checkSuccessCode(resStats);
                checkPayloadObject(resStats, ['positive', 'negative', 'total']);

                const totPos = resMessages.payload.reduce((acc, cur) => {
                    return acc + cur.reactions.positive;
                }, 0)
                const totNeg = resMessages.payload.reduce((acc, cur) => {
                    return acc + cur.reactions.negative;
                }, 0)

                expect(resStats.payload.positive).to.equal(totPos);
                expect(resStats.payload.negative).to.equal(totNeg);
                expect(resMessages.payload.length).to.equal(resStats.payload.total);
            }));
        })

        it("Should return the correct values when using the author field", async function () {

            const handles = users.map(u => u.handle);

            let params = new Object();

            expect(reqUser).to.not.be.null;

            params.dest = handles.map(h => '@' + h);
            params.handle = reqUser.handle;
            params.reqUser = reqUser;
            params.page = -1

            const resMessages = await MessageService.getUserMessages(params);

            checkSuccessCode(resMessages);
            checkPayloadArray(resMessages);

            const resStats = await MessageService.getMessagesStats(params);

            checkSuccessCode(resStats);
            checkPayloadObject(resStats, ['positive', 'negative', 'total']);

            const totPos = resMessages.payload.reduce((acc, cur) => {
                return acc + cur.reactions.positive;
            }, 0)
            const totNeg = resMessages.payload.reduce((acc, cur) => {
                return acc + cur.reactions.negative;
            }, 0)

            expect(resStats.payload.positive).to.equal(totPos);
            expect(resStats.payload.negative).to.equal(totNeg);
            expect(resMessages.payload.length).to.equal(resStats.payload.total);
        });

        it("Should only return messages destined to the given channels", async function () {

            const creator = UserDispatch.getNext();
            const locUsers = [UserDispatch.getNext(), UserDispatch.getNext(), UserDispatch.getNext()]
            const description = lorem.generateParagraphs(1);

            const name = UserDispatch.getNextChannelName();
            const name2 = UserDispatch.getNextChannelName();


            await createChannel({
                name: name,
                ownerHandle: creator.handle,
                description: description,
            })

            await createChannel({
                name: name2,
                ownerHandle: creator.handle,
                description: description,
            })

            let crec = await Channel.findOne({ name: name }).orFail();
            let crec2 = await Channel.findOne({ name: name2 }).orFail();

            await Promise.all(locUsers.map(async u => {

                let urec = await User.findOne({ handle: u.handle });

                expect(urec).to.not.be.null;

                urec.joinedChannels.push(crec._id);
                urec.joinedChannels.push(crec2._id);
                return urec.save();
            }))

            for (let i = 0; i < locUsers.length; i++) {

                let urec = await User.findOne({ handle: locUsers[i].handle });

                crec.members.push(urec._id);
                crec2.members.push(urec._id);

                await crec.save()
                await crec2.save()
                crec = await Channel.findOne({ name: name });
                crec2 = await Channel.findOne({ name: name2 });
            }

            for (let i = 0; i < 10; i++) {

                await addMessage(lorem.generateSentences(2), creator.handle,
                    locUsers.map(u => u.handle),
                    [name])

                await addMessage(lorem.generateSentences(2), creator.handle,
                    locUsers.map(u => u.handle),
                    [name, name2])
                await addMessage(lorem.generateSentences(2), creator.handle,
                    locUsers.map(u => u.handle),
                    [name2])
            }

            const bf = await Message.find({ destChannel: crec._id });

            expect(bf).to.be.an('array').that.is.not.empty;

            let creatorRec = await User.findOne({ handle: creator.handle });

            expect(creatorRec).to.not.be.null;

            let params = {
                reqUser: creatorRec,
                handle: creator.handle,
                dest: ['§' + name],
                page: -1,
            }

            const resMessages = await MessageService.getUserMessages(params);

            checkSuccessCode(resMessages);
            checkPayloadArray(resMessages);

            const resStats = await MessageService.getMessagesStats(params);

            checkSuccessCode(resStats);
            checkPayloadObject(resStats, ['positive', 'negative', 'total']);

            const totPos = resMessages.payload.reduce((acc, cur) => {
                return acc + cur.reactions.positive;
            }, 0)
            const totNeg = resMessages.payload.reduce((acc, cur) => {
                return acc + cur.reactions.negative;
            }, 0)

            expect(resStats.payload.positive).to.equal(totPos);
            expect(resStats.payload.negative).to.equal(totNeg);
            expect(resMessages.payload.length).to.equal(resStats.payload.total);
        });

    });
})