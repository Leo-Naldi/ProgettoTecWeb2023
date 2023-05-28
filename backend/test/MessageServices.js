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

describe('Message Service Unit Tests', function () {

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
            })
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
            for (let i = 0; i < getRandom(maxMessages) + 1; i++){

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

    describe("getMessages Unit Tests", function(){

        it("Should return an array of messages", async function(){

            const res = await MessageService.getMessages();

            checkSuccessCode(res);
            checkPayloadArray(res);

            res.payload.map(m => {

                checkObject(m, [
                    'content',
                    'reactions',
                    'meta',
                    'author',
                    'destChannel',
                    'destUser',
                ])

                checkObject(m.meta, ['created']);
                checkArray(m.destChannel, true);
                checkArray(m.destUser, true);
                checkObject(m.content);
                checkObject(m.reactions, ['positive', 'negative']);
            })
        });

        it(`Should at most return ${config.results_per_page} messages`, async function(){
            
            const res = await MessageService.getMessages();
            const ofCh = await Channel.find({ official: true }); 
            expect(ofCh).to.not.be.empty
            const num_messages = await Message.find({ destChannel: { $in: ofCh.map(c => c._id) } }).count();

            checkSuccessCode(res);
            checkPayloadArray(res);
            
            expect(res.payload).to.have.lengthOf(Math.min(config.results_per_page, num_messages))
        });

        describe("Filters Unit Tests", function(){
        
            const fames = ['popular', 'unpopular', 'controversial'];
            const timeframes = ['day', 'week', 'month', 'year'];

            fames.map(fame => {
                timeframes.map(timeframe => {
                    it(`Should return only ${fame} messages from this ${timeframe}`, async function(){
                        
                        let params = new Object();

                        params[fame] = timeframe;
                        params.reqUser = reqUser;

                        const res = await MessageService.getMessages(params);

                        checkSuccessCode(res)
                        checkPayloadArray(res)

                        res.payload.map(m => {
                            expect(checkFame(m.reactions, fame)).to.be.true;
                            expect(dayjs(m.meta.created).isBetween(dayjs(), dayjs().startOf(timeframe)))
                                .to.be.true;
                        })
                    })
                })
            })

            fames.map(fame => {
                it(`Should return only messages that are almost ${fame}`, async function () {

                    const res = await MessageService.getMessages({ risk: fame, reqUser: reqUser });

                    checkSuccessCode(res)
                    checkPayloadArray(res)

                    res.payload.map(m => {
                        expect(checkRiskOfFame(m.reactions, fame)).to.be.true;
                    })
                })
            })

            it("Should only return messages created before the given date", async function(){
                await Promise.all([
                    dayjs().startOf('week'),
                    dayjs().startOf('month'),
                    dayjs().startOf('year'),
                ].map(async d => {

                    const res = await MessageService.getMessages({ 
                        before: d.toString(),
                        reqUser: reqUser,
                    })
                    
                    checkSuccessCode(res)
                    checkPayloadArray(res)

                    res.payload.map(m => {
                        expect(dayjs(m.meta.created).isSameOrBefore(d, 'second')).to.be.true;
                    })
                }));
            })

            it("Should only return messages created after the given date", async function () {
                await Promise.all([
                    dayjs().startOf('week'),
                    dayjs().startOf('month'),
                    dayjs().startOf('year'),
                ].map(async d => {

                    const res = await MessageService.getMessages({ 
                        after: d.toString(),
                        reqUser: reqUser,
                    })

                    checkSuccessCode(res)
                    checkPayloadArray(res)

                    res.payload.map(m => {
                        expect(dayjs(m.meta.created).isSameOrAfter(d, 'second')).to.be.true;
                    })
                }));
            })

            it("Should only return messages destined to the given user", async function(){

                const handles = users.map(u => u.handle);

                const res = await MessageService.getMessages({
                    reqUser: reqUser,
                    dest: handles.map(h => '@' + h) 
                })

                checkSuccessCode(res)
                checkPayloadArray(res)

                res.payload.map(m => {
                    expect(m.destUser.some(u => handles.find(h => h === u.handle)))
                        .to.be.true;
                })
            });

            it("Should only return messages destined to the given channel", async function () {

                // Setup
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

                // channels used are all public so
                const rnad = await User.findOne({ handle: UserDispatch.getNext().handle }).orFail();

                // Test
                res = await MessageService.getMessages({ 
                    reqUser: rnad,
                    dest: ['§' + name] 
                });

                checkSuccessCode(res)
                checkPayloadArray(res)

                res.payload.map(m => {
                    expect(m.destChannel, `Expected ${m.destChannel} to include ${name}`)
                        .to.deep.include({ name: name });
                })

                res = await MessageService.getMessages({ reqUser: rnad, dest: ['§' + name, '§' + name2] });

                checkSuccessCode(res)
                checkPayloadArray(res)

                res.payload.map(m => {
                    expect(m.destChannel.some(n => (n.name === name) || (n.name === name2)))
                        .to.be.true;
                })
            });

            
        });

        it("Should not return private messages not addressed to the user or to one of the channels he joined", async function() {
            
            this.timeout(30000)
            let pageNum = 1;

            let res = await MessageService.getMessages({ reqUser: reqUser });
            let jchannels = await Channel.find({ _id: { $in: reqUser.joinedChannels } });

            checkSuccessCode(res);
            checkPayloadArray(res);


            let uselessTest = true;

            while (res.payload.length > 0) {
                res.payload.map(m => {
                    if (!m.publicMessage) {
                        uselessTest = false;

                        expect(
                            (reqUser.handle === m.author.handle) ||
                            (m.destUser.some(u => u.handle === reqUser.handle)) ||
                            (m.destChannel.some(c => jchannels.some(jc => jc.name === c.name)))
                        ).to.be.true
                    }
                })

                pageNum++;
                res = await MessageService.getMessages({ reqUser: reqUser, page: pageNum });
            
                checkSuccessCode(res);
                checkPayloadArray(res, true);
            }

            expect(uselessTest).to.be.false;
            //console.log(pageNum)
        }); 
    });

    describe("getUserMessages Unit Tests", function(){
        
        it("Should only return messages authored by the given user", async function () {

            expect(reqUser).to.not.be.null;

            const res = await MessageService.getUserMessages({ 
                handle: reqUser.handle,
                reqUser: reqUser
            });

            checkSuccessCode(res)
            checkPayloadArray(res)

            res.payload.map(m => {
                expect(m.author).to.deep.equal({ handle: reqUser.handle });
            });
        });

        it("Should return an array of messages", async function () {
            
            expect(reqUser).to.not.be.null;

            const res = await MessageService.getUserMessages({
                handle: reqUser.handle,
                reqUser: reqUser
            });

            checkSuccessCode(res)
            checkPayloadArray(res)

            res.payload.map(m => {

                checkObject(m, [
                    'content',
                    'reactions',
                    'meta',
                    'author',
                    'destChannel',
                    'destUser',
                ])

                checkObject(m.meta, ['created']);
                checkArray(m.destChannel, true);
                checkArray(m.destUser, true);
                checkObject(m.content);
                checkObject(m.reactions, ['positive', 'negative']);
            })
        });

        it(`Should at most return ${config.results_per_page} messages`, async function () {

            expect(reqUser).to.not.be.null;

            const res = await MessageService.getUserMessages({
                handle: reqUser.handle,
                reqUser: reqUser
            });

            const num_messages = await Message.find({ author: reqUser._id }).count();

            //console.log(num_messages);

            checkSuccessCode(res);
            checkPayloadArray(res);

            expect(res.payload).to.have.lengthOf(Math.min(config.results_per_page, num_messages))
        });

        describe("Filters Unit Tests", function () {

            const fames = ['popular', 'unpopular', 'controversial'];
            const timeframes = ['day', 'week', 'month', 'year'];

            fames.map(fame => {
                timeframes.map(timeframe => {
                    it(`Should return only ${fame} messages from this ${timeframe}`, async function () {

                        let params = new Object();

                        expect(reqUser).to.not.be.null;

                        params[fame] = timeframe;
                        params.handle = reqUser.handle;
                        params.reqUser = reqUser;

                        const res = await MessageService.getUserMessages(params);

                        checkSuccessCode(res);
                        checkPayloadArray(res);

                        res.payload.map(m => {
                            expect(checkFame(m.reactions, fame)).to.be.true;
                            expect(dayjs(m.meta.created).isBetween(dayjs(), dayjs().startOf(timeframe)))
                                .to.be.true;
                        })
                    })
                })
            })

            fames.map(fame => {
                it(`Should return only messages that are almost ${fame}`, async function () {

                    let params = new Object();

                    expect(reqUser).to.not.be.null;

                    params.risk = fame;
                    params.handle = reqUser.handle;
                    params.reqUser = reqUser;

                    const res = await MessageService.getUserMessages(params);

                    checkSuccessCode(res);
                    checkPayloadArray(res);

                    res.payload.map(m => {
                        expect(checkRiskOfFame(m.reactions, fame)).to.be.true;
                    })
                })
            })

            it("Should only return messages created before the given date", async function () {
                await Promise.all([
                    dayjs().startOf('week'),
                    dayjs().startOf('month'),
                    dayjs().startOf('year'),
                ].map(async d => {

                    let params = new Object();

                    expect(reqUser).to.not.be.null;

                    params.before = d.toString();
                    params.handle = reqUser.handle;
                    params.reqUser = reqUser;

                    const res = await MessageService.getUserMessages(params);

                    checkSuccessCode(res);
                    checkPayloadArray(res);

                    res.payload.map(m => {
                        expect(dayjs(m.meta.created).isSameOrBefore(d, 'second')).to.be.true;
                    })
                }));
            })

            it("Should only return messages created after the given date", async function () {
                await Promise.all([
                    dayjs().startOf('week'),
                    dayjs().startOf('month'),
                    dayjs().startOf('year'),
                ].map(async d => {

                    let params = new Object();

                    expect(reqUser).to.not.be.null;

                    params.after = d.toString();
                    params.handle = reqUser.handle;
                    params.reqUser = reqUser;

                    const res = await MessageService.getUserMessages(params);

                    checkSuccessCode(res);
                    checkPayloadArray(res);

                    res.payload.map(m => {
                        expect(dayjs(m.meta.created).isSameOrAfter(d, 'second')).to.be.true;
                    })
                }));
            })

            it("Should only return messages destined to the given users", async function () {

                const handles = users.map(u => u.handle);

                let params = new Object();

                expect(reqUser).to.not.be.null;

                params.dest = handles.map(h => '@' + h);
                params.handle = reqUser.handle;
                params.reqUser = reqUser;

                const res = await MessageService.getUserMessages(params);

                checkSuccessCode(res);
                checkPayloadArray(res);

                res.payload.map(m => {
                    expect(m.destUser.some(u => handles.find(h => h === u.handle)))
                        .to.be.true;
                    expect(m.author.handle).to.equal(reqUser.handle);
                })
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

                for (let i = 0; i < users.length; i++) {

                    let urec = await User.findOne({ handle: users[i].handle });

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

                res = await MessageService.getUserMessages({ 
                    reqUser: creatorRec,
                    handle: creator.handle,
                    dest: ['§' + name]
                });

                checkSuccessCode(res);
                checkPayloadArray(res);

                res.payload.map(m => {
                    expect(m.destChannel.some(ch => ch.name === name)).to.be.true;
                    expect(m.author.handle).to.equal(creator.handle)
                })

                res = await MessageService.getUserMessages({
                    reqUser: creatorRec,
                    handle: creator.handle,
                    dest: ['§' + name, '§' + name2]
                });

                checkSuccessCode(res);
                checkPayloadArray(res);

                res.payload.map(m => {
                    expect(m.destChannel.some(ch => (ch.name === name) || (ch.name === name2)))
                        .to.be.true;
                    expect(m.author.handle).to.equal(creator.handle)
                })
            });

        });

        it("Should only return public message if requesting user is not the user", async function(){
            this.timeout(30000)
            let pageNum = 1;

            let res = await MessageService.getUserMessages({ reqUser: reqUser, handle: secondAuthor.handle });

            checkSuccessCode(res);
            checkPayloadArray(res);

            while (res.payload.length > 0) {
                expect(res.payload.every(m => m.publicMessage)).to.be.true;

                pageNum++;
                res = await MessageService.getUserMessages({
                    reqUser: reqUser, handle: secondAuthor.handle,
                    page: pageNum
                });

                checkSuccessCode(res);
                checkPayloadArray(res, true);
            }
        });

        it("Should also return private messages if requesting user is the author", async function () {

            this.timeout(30000)
            let pageNum = 1;

            let res = await MessageService.getUserMessages({ reqUser: reqUser, handle: reqUser.handle });
            
            let check = await Message.find({ author: reqUser._id, publicMessage: false });

            expect(check).to.not.be.empty

            checkSuccessCode(res);
            checkPayloadArray(res);


            let uselessTest = true;

            while (res.payload.length > 0) {
                res.payload.map(m => {
                    if (!m.publicMessage) {
                        uselessTest = false;
                        expect(reqUser.handle === m.author.handle).to.be.true;
                    }
                })

                pageNum++;
                res = await MessageService.getUserMessages({ reqUser: reqUser, handle: reqUser.handle,
                    page: pageNum });

                checkSuccessCode(res);
                checkPayloadArray(res, true);
            }

            expect(uselessTest).to.be.false;
            //console.log(pageNum)
        });
    });

    describe("postUserMessage Unit Tests", async function(){

        it("Should fail if the handle does not exist", async function(){
            
            const u = await User.findOne({ handle: UserDispatch.getNext().handle }).orFail();
            // console.log(u.handle);

            const text = lorem.generateWords(20);

            const res = await MessageService.postUserMessage({ 
                reqUser: u,
                handle: u.handle + 'ckjdfvnkdjfnoafnwjfv sjdfbu3i4ru3904uty2495y9hquvsadjnqa',
                content: {
                    text: text,
                }, 
                dest: users.map(u => '@' + u.handle)
            })

            checkErrorCode(res);

        });

        it("Should allow message creation if the user has enough characters left", async function(){
            
            const u = await User.findOne({ handle: UserDispatch.getNext().handle }).orFail();
            //console.log(u.handle);

            const text = lorem.generateWords(10);
            const cur_chars = JSON.parse(JSON.stringify(u.charLeft));

            expect(Math.min(cur_chars.day, cur_chars.week, cur_chars.month) >= text.length)
                .to.be.true;

            const res = await MessageService.postUserMessage({
                reqUser: u,
                handle: u.handle,
                content: {
                    text: text,
                },
                dest: users.map(u => '@' + u.handle)
            })

            checkSuccessCode(res);
        });

        it("Should adjust the author's remaining characters when creating a public message", async function () {

            const u = UserDispatch.getNext();
            const urecord = await User.findOne({ handle: u.handle });

            const text = lorem.generateWords(10);
            const cur_chars = JSON.parse(JSON.stringify(urecord.charLeft));


            expect(Math.min(cur_chars.day, cur_chars.week, cur_chars.month) >= text.length)
                .to.be.true;

            const res = await MessageService.postUserMessage({
                reqUser: urecord,
                handle: u.handle,
                content: {
                    text: text,
                },
                dest: [UserDispatch.getNext().handle, UserDispatch.getNext().handle]
                    .map(handle => '@' + handle),
                publicMessage: true,
            })

            checkSuccessCode(res);

            const checkUser = await User.findOne({ handle: u.handle });
            expect(checkUser.charLeft.day).to.equal(cur_chars.day - text.length)
            expect(checkUser.charLeft.week).to.equal(cur_chars.week - text.length)
            expect(checkUser.charLeft.month).to.equal(cur_chars.month - text.length)

        });

        it("Should adjust the author's remaining characters when creating a private message addressed to any channel", async function () {

            const u = UserDispatch.getNext();
            let urecord = await User.findOne({ handle: u.handle });

            const text = lorem.generateWords(10);
            const cur_chars = JSON.parse(JSON.stringify(urecord.charLeft));


            expect(Math.min(cur_chars.day, cur_chars.week, cur_chars.month) >= text.length)
                .to.be.true;

            let channel = new Channel({
                name: UserDispatch.getNextChannelName(),
                description: lorem.generateParagraphs(2),
                creator: urecord._id,
                members: [urecord._id],
                publicChannel: false,
            })

            urecord.joinedChannels.push(channel._id);
            
            channel = await channel.save();
            urecord = await urecord.save();

            const res = await MessageService.postUserMessage({
                reqUser: urecord,
                handle: u.handle,
                content: {
                    text: text,
                },
                dest: [UserDispatch.getNext().handle, UserDispatch.getNext().handle]
                    .map(handle => '@' + handle).concat(['§' + channel.name]),
                publicMessage: false,
            })

            checkSuccessCode(res);

            const checkUser = await User.findOne({ handle: u.handle });
            expect(checkUser.charLeft.day).to.equal(cur_chars.day - text.length)
            expect(checkUser.charLeft.week).to.equal(cur_chars.week - text.length)
            expect(checkUser.charLeft.month).to.equal(cur_chars.month - text.length)

        });

        it("Should not adjust the author's remaining characters when creating a private message to users only", async function () {

            const u = UserDispatch.getNext();
            const urecord = await User.findOne({ handle: u.handle });

            const text = lorem.generateWords(10);
            const cur_chars = JSON.parse(JSON.stringify(urecord.charLeft));


            expect(Math.min(cur_chars.day, cur_chars.week, cur_chars.month) >= text.length)
                .to.be.true;

            const res = await MessageService.postUserMessage({
                reqUser: urecord,
                handle: u.handle,
                content: {
                    text: text,
                },
                dest: [UserDispatch.getNext().handle, UserDispatch.getNext().handle]
                    .map(handle => '@' + handle),
                publicMessage: false,
            })

            checkSuccessCode(res);

            const checkUser = await User.findOne({ handle: u.handle });
            expect(checkUser.charLeft.day).to.equal(cur_chars.day)
            expect(checkUser.charLeft.week).to.equal(cur_chars.week)
            expect(checkUser.charLeft.month).to.equal(cur_chars.month)

        });

        await Promise.all(['day', 'month', 'week'].map(async p => {

            it(`Should fail if the user does not have enough ${p}ly characters`, async function(){

                const text = lorem.generateWords(10);
                const dests = [UserDispatch.getNext().handle, UserDispatch.getNext().handle]
                    .map(handle => '@' + handle)
    
                const u = UserDispatch.getNext();
                let urecord = await User.findOne({ handle: u.handle });
                
                urecord.charLeft = {
                    day: text.length * 10,
                    week: text.length * 10,
                    month: text.length * 10,
                }

                urecord.charLeft[p] = text.length - 1;
                urecord = await urecord.save()
    
                const res = await MessageService.postUserMessage({
                    reqUser: urecord,
                    handle: u.handle,
                    content: {
                        text: text,
                    },
                    dest: dests,
                    publicMessage: true,
                })
    
                expect(res).to.be.an('object');
                expect(res).to.have.property('status');
                expect(res.status, res.error.message).to.equal(418);
            })
        }))

        it("Should add the message to the user messages list", async function(){
            
            const u = UserDispatch.getNext();
            let urecord = await User.findOne({ handle: u.handle }).orFail();

            urecord.charLeft = {
                day: 10000,
                week: 10000,
                month: 10000,
            }

            urecord = await urecord.save();

            let res = null;

            const dests = [
                UserDispatch.getNext().handle,
                UserDispatch.getNext().handle,
                UserDispatch.getNext().handle,
                UserDispatch.getNext().handle,
            ].map(h => '@' + h);

            let added = [];

            for (let i = 0; i < 10; i++) {
                res = await MessageService.postUserMessage({
                    reqUser: urecord,
                    handle: u.handle,
                    content: {
                        text: lorem.generateSentences(getRandom(4) + 1),
                    },
                    dest: dests,
                });

                checkSuccessCode(res);
                checkPayloadObject(res, ['_id']);

                added.push(res.payload._id);

                urecord.charLeft = {
                    day: 500,
                    week: 500,
                    month: 500,
                }

                urecord = await urecord.save()
            }

            expect(urecord.toObject().messages).to.be.an('array').that.is.not.empty;

            added.map(id => {
                expect(urecord.toObject().messages.some(m => m.equals(id))).to.be.true
            })
        });

        it("Should parse channel destinations correctly", async function(){

            let u = await User.findOne({ handle: UserDispatch.getNext().handle }).orFail();

            let chdests = await Promise.all(Array.from({length: 10}, (v, i) => {
                const channel = new Channel({
                    name: UserDispatch.getNextChannelName(),
                    creator: u._id
                })

                return channel.save()
            }));

            chdestsNames = chdests.map(c => '§' + c.name);

            u.joinedChannels.push(...chdests.map(c => c._id));

            u = await u.save();

            const res = await MessageService.postUserMessage({
                reqUser: u,
                handle: u.handle,
                content: { text: lorem.generateWords(5) },
                dest: chdestsNames,
            });


            checkSuccessCode(res);
            checkPayloadObject(res, ['destChannel']);
            //console.log(res.status)
            checkArray(res.payload.destChannel);

            expect(res.payload.destChannel.every(cid => chdests.some(c =>  c._id.equals(cid))))
                .to.be.true;
        });

        it("Should parse user destinations correctly", async function () {

            let u = await User.findOne({ handle: UserDispatch.getNext().handle }).orFail();

            let udests = await Promise.all(Array.from({ length: 10 }, (v, i) => {
                return User.findOne({ handle: UserDispatch.getNext().handle }).orFail();
            }));

            udestsHandles = udests.map(c => '@' + c.handle);

            const res = await MessageService.postUserMessage({
                reqUser: u,
                handle: u.handle,
                content: { text: lorem.generateWords(5) },
                dest: udestsHandles,
            });

            checkSuccessCode(res);
            checkPayloadObject(res, ['destUser']);
            checkArray(res.payload.destUser);

            expect(res.payload.destUser.every(uid => udests.some(u => u._id.equals(uid))))
                .to.be.true;
        });
    });

    describe("deleteUserMessages Unit Tests", function(){

        it('Should fail if the handle does not exist', async function(){
            const u = UserDispatch.getNext();

            const urecord = await User.findOne({ handle: u.handle });

            u.handle += 'sjjdhbcskfbveurvbsjdc wjnjuejrvn'
            const res = await MessageService.deleteUserMessages({ reqUser: urecord, handle: u.handle });

            checkErrorCode(res);
        });

        it("Should succeed if the handle exists", async function(){
            
            const u = UserDispatch.getNext();
            const urecord = await User.findOne({ handle: u.handle });

            const res = await MessageService.deleteUserMessages({ reqUser: urecord, handle: u.handle });

            checkSuccessCode(res);
        });

        it('Should actually delete the messages', async function(){
            const u = UserDispatch.getNext();
            const urecord = await User.findOne({ handle: u.handle });

            const dests = [
                UserDispatch.getNext().handle,
                UserDispatch.getNext().handle,
                UserDispatch.getNext().handle,
                UserDispatch.getNext().handle,
            ];

            for (let i = 0; i < 10; i++){
                
                await addMessage(
                    lorem.generateSentences(4),
                    u.handle,
                    dests,
                );
            }
            
            const u1 = await User.findOne({ handle: u.handle });

            const messagesIds = u1.toObject().messages.slice();

            const res = await MessageService.deleteUserMessages({ reqUser: urecord, handle: u.handle });

            checkSuccessCode(res);

            await Promise.all(
                messagesIds.map(async m => {
                    const found = await Message.findById(m);

                    expect(found).to.be.null;
                })
            )
        });

        it("Should empty the author's message list", async function(){
            const u = UserDispatch.getNext();
            const urecord = await User.findOne({ handle: u.handle });

            const dest = [
                UserDispatch.getNext().handle,
                UserDispatch.getNext().handle,
                UserDispatch.getNext().handle,
                UserDispatch.getNext().handle,
            ]

            for (let i = 0; i < 10; i++)
                await addMessage(
                    lorem.generateSentences(4),
                    u.handle,
                    dest
                );

            const res = await MessageService.deleteUserMessages({ reqUser: urecord, handle: u.handle });

            checkSuccessCode(res);

            const u1 = await User.findOne({ handle: u.handle });

            expect(u1?.messages).to.be.an('array').that.is.empty;
        })

    });

    describe("deleteMessage Unit Tests", async function(){
        
        it("Should fail if the id is not valid", async function(){
            const res = await MessageService.deleteMessage({
                id: 'thisisavalididipromise',
            })

            checkErrorCode(res);
        });

        it("Should remove the message", async function(){
            
            const u = UserDispatch.getNext();
            const dests = [UserDispatch.getNext().handle]

            await addMessage(
                    lorem.generateSentences(4),
                    u.handle,
                    dests,
            );

            const urecord = await User.findOne({ handle: u.handle });

            const message = await Message.findOne({ author: urecord._id });

            checkObject(message, ['_id']);

            const id = message._id;

            const res = await MessageService.deleteMessage({
                id: message.toObject()._id,
            })

            checkSuccessCode(res);

            const check = await Message.findById(id);

            expect(check).to.be.null;
        });

        it("Should remove the message from the author's messages list", async function () {

            const u = UserDispatch.getNext();
            const dests = [UserDispatch.getNext().handle]

            await addMessage(
                lorem.generateSentences(4),
                u.handle,
                dests,
            );

            await addMessage(
                lorem.generateSentences(4),
                u.handle,
                dests,
            );

            const urecord = await User.findOne({ handle: u.handle });
            
            expect(urecord?.messages).to.be.an('array').that.is.not.empty;

            const message = await Message.findOne({ author: urecord._id });

            checkObject(message, ['_id']);
            
            const id = message._id;

            const res = await MessageService.deleteMessage({
                id: message.toObject()._id,
            })

            checkSuccessCode(res)

            const check = await await User.findOne({ handle: u.handle });

            checkObject(check, ['messages'])
            checkArray(check.messages, true);

            expect(check.messages.some(mid => mid.equals(id))).to.be.false;
        });

    });

    describe("postMessage Unit Tests", function(){

        it("Should fail if id is not valid", async function(){
            
            const res = await MessageService.postMessage({
                id: 'supervalidId',
                reactions: {
                    positive: 1000000000,
                    negative: 0,
                }
            })

            checkErrorCode(res);
        });

        it("Should fail if reactions is missing", async function(){
            const u = UserDispatch.getNext();
            const dests = [UserDispatch.getNext().handle]

            await addMessage(
                lorem.generateSentences(4),
                u.handle,
                dests,
            );

            const urecord = await User.findOne({ handle: u.handle });

            const message = await Message.findOne({ author: urecord._id });

            const res = await MessageService.postMessage({
                id: message._id,
            })

            checkErrorCode(res);
        });

        it("Should fail if reactions is not in the correct form", async function(){

            const malformed = [
                {
                    positive: 'ehm',
                    negative: 300,
                }, 
                {
                    negative: 'ehm',
                    positive: 300,
                },
                {
                    positive: 300,
                }, 
                {
                    negative: 300,
                },
                {
                    negative: -1000,
                    positive: 69
                },
                {
                    positive: -1000,
                    negative: 69
                },
            ];

            const u = UserDispatch.getNext();
            const dests = [UserDispatch.getNext().handle]

            await Promise.all(malformed.map(async reaction => {

                await addMessage(
                    lorem.generateSentences(4),
                    u.handle,
                    dests,
                );

                const urecord = await User.findOne({ handle: u.handle });

                const message = await Message.findOne({ author: urecord._id });

                const res = await MessageService.postMessage({
                    id: message._id,
                    reactions: reaction
                })

                checkErrorCode(res);
            }))

        });

        it("Should actually change the reaction object", async function(){
            const u = UserDispatch.getNext();
            const dests = [UserDispatch.getNext().handle]

            await addMessage(
                lorem.generateSentences(4),
                u.handle,
                dests,
            );

            let urecord = await User.findOne({ handle: u.handle });
            let message = await Message.findOne({ author: urecord._id });
            
            const reactions = {
                positive: 100000,
                negative: 42069,
            }
            
            const res = await MessageService.postMessage({
                id: message._id,
                reactions: reactions,
            })
            
            checkSuccessCode(res);
            
            urecord = await User.findOne({ handle: u.handle });
            message = await Message.findOne({ author: urecord._id });

            expect(message.toObject().reactions).to.deep.equal(reactions)
        });

    });

    describe("addPositiveReaction Unit Tests", function(){

        it("Should fail if id is not valid", async function () {

            const res = await MessageService.addPositiveReaction({
                id: 'supervalidId',
            })

            checkErrorCode(res);
        });

        it("Should actually change the reaction object", async function () {
            const u = UserDispatch.getNext();
            const dests = [UserDispatch.getNext().handle]

            await addMessage(
                lorem.generateSentences(4),
                u.handle,
                dests,
            );

            let urecord = await User.findOne({ handle: u.handle });
            let message = await Message.findOne({ author: urecord._id });
            
            const old_reactions = JSON.parse(JSON.stringify(message.reactions));

            const res = await MessageService.addPositiveReaction({
                id: message._id,
            })

            checkSuccessCode(res)

            urecord = await User.findOne({ handle: u.handle });
            const check = await Message.findOne({ author: urecord._id });

            expect(old_reactions.negative).to.equal(check.reactions.negative)
            expect(old_reactions.positive + 1).to.equal(check.reactions.positive)
        });

        it("Should change the user's character when getting enough positive reactions if the message is public", async function(){
            
            let user = await User.findOne({ handle: UserDispatch.getNext().handle }).orFail();
            const reciever = await User.findOne({ handle: UserDispatch.getNext().handle }).orFail();

            const text = lorem.generateSentences(getRandom(3) + 1);
            
            // make sure there are chars left
            user.charLeft.day += 10000 - text.length;
            user.charLeft.week += 10000 - text.length;
            user.charLeft.month += 10000 - text.length;

            const charCopy = {...user.toObject().charLeft};

            await user.save();

            let message = new Message({
                content: {
                    text: text,
                },
                author: user._id,
                destUser: [reciever._id],
                reactions: {
                    positive: 0,
                    negative: 0,
                }
            });

            await message.save()
            user.messages.push(message._id);

            user = await user.save()

            // check characters are left unchanged
            const res = await MessageService.addPositiveReaction({ id: message._id });
            
            checkSuccessCode(res)

            user = await User.findOne({ handle: user.handle }).orFail();
            expect(charCopy, 'Changed characters when it shouldnt have')
                .to.deep.equal(user.toObject().charLeft);
            
            // check characters are changed once threshold is reached
            message = await Message.findById(message._id).orFail();
            message.reactions.positive = config.fame_threshold - 1;

            for (let i = 0; i < config.num_messages_reward - 1; i ++) {
                let message1 = new Message({
                    content: {
                        text: text,
                    },
                    author: user._id,
                    destUser: [reciever._id],
                    reactions: {
                        positive: config.fame_threshold + 100,
                        negative: 0,
                    }
                });

                await message1.save()
                user.messages.push(message1._id);

            }
            user = await user.save()

            await message.save();

            const res1 = await MessageService.addPositiveReaction({ id: message._id });

            checkSuccessCode(res1)

            user = await User.findOne({ handle: user.handle }).orFail();

            let newChars = {...charCopy};

            newChars.day += Math.max(1, Math.ceil(config.daily_quote / 100));
            newChars.week += Math.max(1, Math.ceil(config.weekly_quote / 100));
            newChars.month += Math.max(1, Math.ceil(config.monthly_quote / 100));

            expect(newChars, 'Did not characters when it shouldnt have')
                .to.deep.equal(user.toObject().charLeft);
        });

        it("Should change the user's character when getting enough positive reactions if the message is private but destined to at least one channel", async function () {
            // TODO
            const u = UserDispatch.getNext();
            let urecord = await User.findOne({ handle: u.handle }).orFail();

            const cur_chars = JSON.parse(JSON.stringify(urecord.charLeft));

            let channel = new Channel({
                name: UserDispatch.getNextChannelName(),
                description: lorem.generateParagraphs(2),
                creator: urecord._id,
                members: [urecord._id],
                publicChannel: false,
            })

            urecord.joinedChannels.push(channel._id);

            channel = await channel.save();
            urecord = await urecord.save();

            const reciever = await User.findOne({ handle: UserDispatch.getNext().handle }).orFail();

            const text = lorem.generateSentences(getRandom(3) + 1);

            // make sure there are chars left
            urecord.charLeft.day += 10000 - text.length;
            urecord.charLeft.week += 10000 - text.length;
            urecord.charLeft.month += 10000 - text.length;

            const charCopy = { ...urecord.toObject().charLeft };

            let message = new Message({
                content: {
                    text: text,
                },
                author: urecord._id,
                destUser: [reciever._id],
                reactions: {
                    positive: 0,
                    negative: 0,
                }, 
                publicMessage: false,
                destChannel: [channel._id],
            });

            await message.save()

            urecord.messages.push(message._id);
            channel.messages.push(message._id);

            urecord = await urecord.save();
            channel = await channel.save();

            // check characters are left unchanged
            const res = await MessageService.addPositiveReaction({ id: message._id });

            checkSuccessCode(res)

            urecord = await User.findOne({ handle: urecord.handle }).orFail();
            expect(charCopy, 'Changed characters when it shouldnt have')
                .to.deep.equal(urecord.toObject().charLeft);

            // check characters are changed once threshold is reached
            message = await Message.findById(message._id).orFail();
            message.reactions.positive = config.fame_threshold - 1;

            await message.save();

            for (let i = 0; i < config.num_messages_reward - 1; i++) {
                let message1 = new Message({
                    content: {
                        text: text,
                    },
                    author: urecord._id,
                    destUser: [reciever._id],
                    destChannel: [channel._id],
                    reactions: {
                        positive: config.fame_threshold + 100,
                        negative: 0,
                    }
                });

                await message1.save()
                urecord.messages.push(message1._id);
                channel.messages.push(message1._id);

            }
            urecord = await urecord.save();
            channel = await channel.save();

            const res1 = await MessageService.addPositiveReaction({ id: message._id });

            checkSuccessCode(res1)

            urecord = await User.findOne({ handle: urecord.handle }).orFail();

            let newChars = { ...charCopy };

            newChars.day += Math.max(1, Math.ceil(config.daily_quote / 100));
            newChars.week += Math.max(1, Math.ceil(config.weekly_quote / 100));
            newChars.month += Math.max(1, Math.ceil(config.monthly_quote / 100));

            expect(newChars, 'Did not characters when it shouldnt have')
                .to.deep.equal(urecord.toObject().charLeft);
        });

        it("Should not change the user's character when getting enough positive reactions if the message is private and has no dest channels", async function () {

            let user = await User.findOne({ handle: UserDispatch.getNext().handle }).orFail();
            const reciever = await User.findOne({ handle: UserDispatch.getNext().handle }).orFail();

            const text = lorem.generateSentences(getRandom(3) + 1);

            // make sure there are chars left
            user.charLeft.day += 10000 - text.length;
            user.charLeft.week += 10000 - text.length;
            user.charLeft.month += 10000 - text.length;

            const charCopy = { ...user.toObject().charLeft };

            await user.save();

            let message = new Message({
                content: {
                    text: text,
                },
                author: user._id,
                destUser: [reciever._id],
                reactions: {
                    positive: 0,
                    negative: 0,
                },
                publicMessage: false,
            });

            await message.save()
            user.messages.push(message._id);

            user = await user.save()

            // check characters are left unchanged
            const res = await MessageService.addPositiveReaction({ id: message._id });

            checkSuccessCode(res)

            user = await User.findOne({ handle: user.handle }).orFail();
            expect(charCopy, 'Changed characters when it shouldnt have')
                .to.deep.equal(user.toObject().charLeft);

            // check characters are changed once threshold is reached
            message = await Message.findById(message._id).orFail();
            message.reactions.positive = config.fame_threshold - 1;

            for (let i = 0; i < config.num_messages_reward - 1; i++) {
                let message1 = new Message({
                    content: {
                        text: text,
                    },
                    author: user._id,
                    destUser: [reciever._id],
                    reactions: {
                        positive: config.fame_threshold + 100,
                        negative: 0,
                    }
                });

                await message1.save()
                user.messages.push(message1._id);

            }
            user = await user.save()

            await message.save();

            const res1 = await MessageService.addPositiveReaction({ id: message._id });

            checkSuccessCode(res1)

            user = await User.findOne({ handle: user.handle }).orFail();

            expect(charCopy, 'Changed characters when it shouldnt have')
                .to.deep.equal(user.toObject().charLeft);
        });
    })

    describe("addNegativeReaction Unit Tests", function () {

        it("Should fail if id is not valid", async function () {

            const res = await MessageService.addNegativeReaction({
                id: 'supervalidId',
            })

            checkErrorCode(res);
        });

        it("Should change the user's character when getting enough negative reactions if the message is public", async function () {

            let user = await User.findOne({ handle: UserDispatch.getNext().handle }).orFail();
            const reciever = await User.findOne({ handle: UserDispatch.getNext().handle }).orFail();

            const text = lorem.generateSentences(getRandom(3) + 1);

            // make sure there are chars left
            user.charLeft.day += 10000 - text.length;
            user.charLeft.week += 10000 - text.length;
            user.charLeft.month += 10000 - text.length;

            const charCopy = { ...user.toObject().charLeft };

            await user.save();

            let message = new Message({
                content: {
                    text: text,
                },
                author: user._id,
                destUser: [reciever._id],
                reactions: {
                    positive: 0,
                    negative: 0,
                }
            });

            await message.save()
            user.messages.push(message._id);

            user = await user.save()

            // check characters are left unchanged
            const res = await MessageService.addNegativeReaction({ id: message._id });

            checkSuccessCode(res)

            user = await User.findOne({ handle: user.handle }).orFail();
            expect(charCopy, 'Changed characters when it shouldnt have')
                .to.deep.equal(user.toObject().charLeft);

            // check characters are changed once threshold is reached
            message = await Message.findById(message._id).orFail();
            message.reactions.negative = config.fame_threshold - 1;

            for (let i = 0; i < config.num_messages_reward - 1; i++) {
                let message1 = new Message({
                    content: {
                        text: text,
                    },
                    author: user._id,
                    destUser: [reciever._id],
                    reactions: {
                        negative: config.fame_threshold + 100,
                        positive: 0,
                    }
                });

                await message1.save()
                user.messages.push(message1._id);

            }
            user = await user.save()

            await message.save();

            const res1 = await MessageService.addNegativeReaction({ id: message._id });

            checkSuccessCode(res1)

            user = await User.findOne({ handle: user.handle }).orFail();

            let newChars = { ...charCopy };

            newChars.day -= Math.max(1, Math.ceil(config.daily_quote / 100));
            newChars.week -= Math.max(1, Math.ceil(config.weekly_quote / 100));
            newChars.month -= Math.max(1, Math.ceil(config.monthly_quote / 100));

            newChars.day = Math.max(newChars.day, 0);
            newChars.week = Math.max(newChars.week, 0);
            newChars.month = Math.max(newChars.month, 0);

            expect(newChars, 'Did not characters when it shouldnt have')
                .to.deep.equal(user.toObject().charLeft);
        });

        it("Should change the user's character when getting enough positive reactions if the message is private but destined to at least one channel", async function () {
         
            const u = UserDispatch.getNext();
            let urecord = await User.findOne({ handle: u.handle }).orFail();

            let channel = new Channel({
                name: UserDispatch.getNextChannelName(),
                description: lorem.generateParagraphs(2),
                creator: urecord._id,
                members: [urecord._id],
                publicChannel: false,
            })

            urecord.joinedChannels.push(channel._id);

            channel = await channel.save();
            urecord = await urecord.save();

            const reciever = await User.findOne({ handle: UserDispatch.getNext().handle }).orFail();

            const text = lorem.generateSentences(getRandom(3) + 1);

            // make sure there are chars left
            urecord.charLeft.day += 10000 - text.length;
            urecord.charLeft.week += 10000 - text.length;
            urecord.charLeft.month += 10000 - text.length;

            const charCopy = { ...urecord.toObject().charLeft };

            let message = new Message({
                content: {
                    text: text,
                },
                author: urecord._id,
                destUser: [reciever._id],
                reactions: {
                    positive: 0,
                    negative: 0,
                },
                publicMessage: false,
                destChannel: [channel._id],
            });

            await message.save()

            urecord.messages.push(message._id);
            channel.messages.push(message._id);

            urecord = await urecord.save();
            channel = await channel.save();

            // check characters are left unchanged
            const res = await MessageService.addNegativeReaction({ id: message._id });

            checkSuccessCode(res)

            urecord = await User.findOne({ handle: urecord.handle }).orFail();
            expect(charCopy, 'Changed characters when it shouldnt have')
                .to.deep.equal(urecord.toObject().charLeft);

            // check characters are changed once threshold is reached
            message = await Message.findById(message._id).orFail();
            message.reactions.negative = config.fame_threshold - 1;

            await message.save();

            for (let i = 0; i < config.num_messages_reward - 1; i++) {
                let message1 = new Message({
                    content: {
                        text: text,
                    },
                    author: urecord._id,
                    destUser: [reciever._id],
                    destChannel: [channel._id],
                    reactions: {
                        negative: config.fame_threshold + 100,
                        positive: 0,
                    }
                });

                await message1.save()
                urecord.messages.push(message1._id);
                channel.messages.push(message1._id);

            }
            urecord = await urecord.save();
            channel = await channel.save();

            const res1 = await MessageService.addNegativeReaction({ id: message._id });

            checkSuccessCode(res1)

            urecord = await User.findOne({ handle: urecord.handle }).orFail();

            let newChars = { ...charCopy };

            newChars.day -= Math.max(1, Math.ceil(config.daily_quote / 100));
            newChars.week -= Math.max(1, Math.ceil(config.weekly_quote / 100));
            newChars.month -= Math.max(1, Math.ceil(config.monthly_quote / 100));

            newChars.day = Math.max(newChars.day, 0);
            newChars.week = Math.max(newChars.week, 0);
            newChars.month = Math.max(newChars.month, 0);

            expect(newChars, 'Did not characters when it shouldnt have')
                .to.deep.equal(urecord.toObject().charLeft);
        });

        it("Should not change the user's character when getting enough negative reactions if the message is private and has no dest channels", async function () {

            let user = await User.findOne({ handle: UserDispatch.getNext().handle }).orFail();
            const reciever = await User.findOne({ handle: UserDispatch.getNext().handle }).orFail();

            const text = lorem.generateSentences(getRandom(3) + 1);

            // make sure there are chars left
            user.charLeft.day += 10000 - text.length;
            user.charLeft.week += 10000 - text.length;
            user.charLeft.month += 10000 - text.length;

            const charCopy = { ...user.toObject().charLeft };

            await user.save();

            let message = new Message({
                content: {
                    text: text,
                },
                author: user._id,
                destUser: [reciever._id],
                reactions: {
                    positive: 0,
                    negative: 0,
                },
                publicMessage: false,
            });

            await message.save()
            user.messages.push(message._id);

            user = await user.save()

            // check characters are left unchanged
            const res = await MessageService.addNegativeReaction({ id: message._id });

            checkSuccessCode(res)

            user = await User.findOne({ handle: user.handle }).orFail();
            expect(charCopy, 'Changed characters when it shouldnt have')
                .to.deep.equal(user.toObject().charLeft);

            // check characters are changed once threshold is reached
            message = await Message.findById(message._id).orFail();
            message.reactions.negative = config.fame_threshold - 1;

            for (let i = 0; i < config.num_messages_reward - 1; i++) {
                let message1 = new Message({
                    content: {
                        text: text,
                    },
                    author: user._id,
                    destUser: [reciever._id],
                    reactions: {
                        negative: config.fame_threshold + 100,
                        positive: 0,
                    }
                });

                await message1.save()
                user.messages.push(message1._id);

            }
            user = await user.save()

            await message.save();

            const res1 = await MessageService.addNegativeReaction({ id: message._id });

            checkSuccessCode(res1)

            user = await User.findOne({ handle: user.handle }).orFail();

            expect(charCopy, 'Did not characters when it shouldnt have')
                .to.deep.equal(user.toObject().charLeft);
        });
    })

    describe("deleteChannelMessages Unit Tests", function(){

        it("Should fail if there is no channell with the given name", async function(){

            const name = UserDispatch.getNextChannelName();

            res = await MessageService.deleteChannelMessages({ name: name });

            checkErrorCode(res);

        });

        it("Shuld remove the channel from the dest list of all messages", async function () {

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

            let crec = await Channel.findOne({ name: name });
            let crec2 = await Channel.findOne({ name: name2 });

            expect(crec).to.not.be.null;
            expect(crec2).to.not.be.null;

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
                    [name, name2])
            }

            const bf = await Message.find({ destChannel: crec._id });

            expect(bf).to.be.an('array').that.is.not.empty;

            res = await MessageService.deleteChannelMessages({ name: name });

            checkSuccessCode(res);

            const check = await Message.find({ destChannel: crec._id });
            const check2 = await Message.find({ destChannel: crec2._id });

            checkArray(check, true); expect(check).to.be.empty;
            checkArray(check2);
        });

        it("Should delete messages whose sole dest was the channell", async function () {

            const creator = UserDispatch.getNext();
            const locUsers = [UserDispatch.getNext(), UserDispatch.getNext(), UserDispatch.getNext()]
            const description = lorem.generateParagraphs(1);

            const name = UserDispatch.getNextChannelName();


            await createChannel({
                name: name,
                ownerHandle: creator.handle,
                description: description,
            })


            let crec = await Channel.findOne({ name: name });

            expect(crec).to.not.be.null;

            await Promise.all(locUsers.map(async u => {

                let urec = await User.findOne({ handle: u.handle });

                expect(urec).to.not.be.null;

                urec.joinedChannels.push(crec._id);
                return urec.save();
            }))

            for (let i = 0; i < locUsers.length; i++) {

                let urec = await User.findOne({ handle: locUsers[i].handle });

                crec.members.push(urec._id);

                await crec.save()
                crec = await Channel.findOne({ name: name });
            }

            for (let i = 0; i < 10; i++) {

                await addMessage(lorem.generateSentences(2), creator.handle,
                    [],
                    [name])
            }

            const bf = await Message.find({ destChannel: crec._id });

            expect(bf).to.be.an('array').that.is.not.empty;

            res = await MessageService.deleteChannelMessages({ name: name });

            checkSuccessCode(res)

            const check = await Message.find({ destChannel: crec._id });

            expect(check).to.be.an('array').that.is.empty;

            await Promise.all(bf.map(async m => {
                expect(await Message.findById(m._id)).to.be.null;
            }));
        });
    })
})