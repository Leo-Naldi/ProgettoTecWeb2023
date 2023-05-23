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
    checkThreshold,
    isPopular,
    isUnpopular,
    isControversial,
    atRiskOfControversial,
    atRiskOfPopular,
    atRiskOfUnpopular,
    checkFame,
    checkRiskOfFame,
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



describe('Message Service Unit Tests', function () {

    let all = null;
    let author = null;
    let new_author =  null;
    let handleauth1 = null, handleauth2 = null;
    let recievers1 = [], recievers2 = [];

    before(async function () {
        /*
        *  NB this breaks the character limits, messages should be added using the service
        */
        this.timeout(7000)

        let auth1 = await User.findOne({ handle: UserDispatch.getNext().handle }).orFail();
        handleauth1 = auth1.handle;
        
        recrecors1 = [
            await User.findOne({ handle: UserDispatch.getNext().handle }).orFail(), 
            await User.findOne({ handle: UserDispatch.getNext().handle }).orFail()
        ]
        recievers1 = recrecors1.map(u => u.handle);
        
        let auth2 = await User.findOne({ handle: UserDispatch.getNext().handle }).orFail();
        handleauth2 = auth2.handle;
        
        recrecors2 = [
            await User.findOne({ handle: UserDispatch.getNext().handle }).orFail(),
            await User.findOne({ handle: UserDispatch.getNext().handle }).orFail()
        ]
        recievers2 = recrecors2.map(u => u.handle);

        let accounts = [auth1, auth2].concat(recrecors1).concat(recrecors2);

        let messages = [];

        // Random Messages
        for (let i = 0; i < messagesCount; i++) {

            messages.push(new Message({
                content: {
                    text: lorem.generateSentences(getRandom(3) + 1),
                },
                author: auth1._id,
                destUser: [recrecors1[0]._id],
                reactions: {
                    positive: 10,
                    negative: 10,
                }
            }))

            messages.push(new Message({
                content: {
                    text: lorem.generateSentences(getRandom(3) + 1),
                },
                author: auth1._id,
                destUser: [recrecors1[1]._id],
                reactions: {
                    positive: 10,
                    negative: 10,
                }
            }))

            messages.push(new Message({
                content: {
                    text: lorem.generateSentences(getRandom(3) + 1),
                },
                author: auth2._id,
                destUser: [recrecors2[0]._id],
                meta: {
                    created: dayjs().subtract(2, 'day')
                },
                reactions: {
                    positive: getRandom(3000),
                    negative: getRandom(20),
                }
            }))

            messages.push(new Message({
                content: {
                    text: lorem.generateSentences(getRandom(3) + 1),
                },
                author: auth2._id,
                destUser: [recrecors2[1]._id],
                meta: {
                    created: dayjs().subtract(2, 'month'),
                },
                reactions: {
                    positive: getRandom(3000),
                    negative: getRandom(20),
                }
            }))

            messages.push(new Message({
                content: {
                    text: lorem.generateSentences(getRandom(3) + 1),
                },
                author: auth2._id,
                destUser: [recrecors2[1]._id],
                meta: {
                    created: dayjs().subtract(2, 'year'),
                },
                reactions: {
                    positive: getRandom(3000),
                    negative: getRandom(20),
                }
            }))

            messages.push(new Message({
                content: {
                    text: lorem.generateSentences(getRandom(3) + 1),
                },
                author: auth2._id,
                destUser: [recrecors2[1]._id],
                meta: {
                    created: dayjs().subtract(2, 'year'),
                },
                reactions: {
                    positive: getRandom(3000),
                    negative: getRandom(20),
                }
            }))
        }
        // Ensure there are messages for every fame configuration and every time frame
        const getPopular = () => ({
            positive: getRandom(3000) + config.crit_mass,
            negative: getRandom(20),
        });
        const getUnpopular = () => ({
            negative: getRandom(3000) + config.crit_mass,
            positive: getRandom(20),
        });
        const getControversial = () => ({
            negative: getRandom(3000) + config.crit_mass,
            positive: getRandom(3000) + config.crit_mass,
        });
        const getRiskPopular = () => ({
            positive: config.danger_threshold + getRandom(config.fame_threshold - config.danger_threshold),
            negative: getRandom(20),
        });
        const getRiskUnpopular = () => ({
            negative: config.danger_threshold + getRandom(config.fame_threshold - config.danger_threshold),
            positive: getRandom(20),
        });
        const getRiskControversial = () => ({
            negative: config.danger_threshold + getRandom(config.fame_threshold - config.danger_threshold),
            positive: config.danger_threshold + getRandom(config.fame_threshold - config.danger_threshold),
        });
        const periods = ['today', 'week', 'month', 'year'];
        const maxMessages = 20;
        
        periods.map(p => {
            for (let i = 0; i < getRandom(maxMessages) + 1; i++){

                messages.push(new Message({
                    content: {
                        text: lorem.generateSentences(getRandom(3) + 1),
                    },
                    author: auth1._id,
                    destUser: recrecors2.map(u => u._id),
                    meta: {
                        created: getDateWithin(p),
                    },
                    reactions: getPopular()
                }));
        
                messages.push(new Message({
                    content: {
                        text: lorem.generateSentences(getRandom(3) + 1),
                    },
                    author: auth1._id,
                    destUser: recrecors2.map(u => u._id),
                    meta: {
                        created: getDateWithin(p),
                    },
                    reactions: getUnpopular()
                }));
                
                messages.push(new Message({
                    content: {
                        text: lorem.generateSentences(getRandom(3) + 1),
                    },
                    author: auth1._id,
                    destUser: recrecors2.map(u => u._id),
                    meta: {
                        created: getDateWithin(p),
                    },
                    reactions: getControversial()
                }))
                messages.push(new Message({
                    content: {
                        text: lorem.generateSentences(getRandom(3) + 1),
                    },
                    author: auth1._id,
                    destUser: recrecors2.map(u => u._id),
                    meta: {
                        created: getDateWithin(p),
                    },
                    reactions: getRiskPopular()
                }))
                messages.push(new Message({
                    content: {
                        text: lorem.generateSentences(getRandom(3) + 1),
                    },
                    author: auth1._id,
                    destUser: recrecors2.map(u => u._id),
                    meta: {
                        created: getDateWithin(p),
                    },
                    reactions: getRiskUnpopular()
                }))
                messages.push(new Message({
                    content: {
                        text: lorem.generateSentences(getRandom(3) + 1),
                    },
                    author: auth1._id,
                    destUser: recrecors2.map(u => u._id),
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
                author: auth1._id,
                destUser: recrecors2.map(u => u._id),
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
                author: auth1._id,
                destUser: recrecors2.map(u => u._id),
                meta: {
                    created: d.add(1, 'hour'),
                },
                reactions: {
                    positive: 20,
                    negative: 20,
                }
            }))
        })

        await Promise.all(messages.map(m => m.save()));
        messages.map(m => {
            const ind = accounts.findIndex(a => a._id.equals(m.author));
            
            accounts[ind].messages.push(m._id);
        })
        
        //console.log(accounts)
        await Promise.all(accounts.map(async u => u.save()));

        all = await Message.find();
        author = await User.findOne({ handle: handleauth1 });
        new_author = await User.findOne({ handle: UserDispatch.getNext().handle });
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
            const num_messages = await Message.find().count();

            checkSuccessCode(res);
            checkPayloadArray(res);
            
            expect(res.payload).to.have.lengthOf(Math.min(config.results_per_page, num_messages))
        });

        describe("getMessages Filters Unit Tests", function(){
        
            const fames = ['popular', 'unpopular', 'controversial'];
            const timeframes = ['day', 'week', 'month', 'year'];

            fames.map(fame => {
                timeframes.map(timeframe => {
                    it(`Should return only ${fame} messages from this ${timeframe}`, async function(){
                        
                        let params = new Object();

                        params[fame] = timeframe;

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

                    const res = await MessageService.getMessages({ risk: fame });

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

                    const res = await MessageService.getMessages({ before: d.toString() })
                    
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

                    const res = await MessageService.getMessages({ after: d.toString() })

                    checkSuccessCode(res)
                    checkPayloadArray(res)

                    res.payload.map(m => {
                        expect(dayjs(m.meta.created).isSameOrAfter(d, 'second')).to.be.true;
                    })
                }));
            })

            it("Should only return messages destined to the given user", async function(){

                const handles = recievers1;

                const res = await MessageService.getMessages({ dest: handles.map(h => '@' + h) })

                checkSuccessCode(res)
                checkPayloadArray(res)

                res.payload.map(m => {
                    expect(m.destUser.some(u => handles.findIndex(h => h === u.handle) !== -1))
                        .to.be.true;
                })
            });

            it("Should only return messages destined to the given channel", async function () {

                // Setup
                const creator = UserDispatch.getNext();
                const users = [UserDispatch.getNext(), UserDispatch.getNext(), UserDispatch.getNext()]
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

                await Promise.all(users.map(async u => {

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
                        users.map(u => u.handle),
                        [name])

                    await addMessage(lorem.generateSentences(2), creator.handle,
                        users.map(u => u.handle),
                        [name, name2])
                    await addMessage(lorem.generateSentences(2), creator.handle,
                        users.map(u => u.handle),
                        [name2])
                }

                const bf = await Message.find({ destChannel: crec._id });

                expect(bf).to.be.an('array').that.is.not.empty;

                // Test
                res = await MessageService.getMessages({ dest: ['§' + name] });

                checkSuccessCode(res)
                checkPayloadArray(res)

                res.payload.map(m => {
                    expect(m.destChannel, `Expected ${m.destChannel} to include ${name}`)
                        .to.deep.include({ name: name });
                })

                res = await MessageService.getMessages({ dest: ['§' + name, '§' + name2] });

                checkSuccessCode(res)
                checkPayloadArray(res)

                res.payload.map(m => {
                    expect(m.destChannel.some(n => (n.name === name) || (n.name === name2)))
                        .to.be.true;
                })
            });

        });
    });

    describe("getUserMessages Unit Tests", function(){
        
        it("Should only return messages authored by the given user", async function () {

            expect(author).to.not.be.null;

            const res = await MessageService.getUserMessages({ 
                handle: author.handle,
                reqUser: author
            });

            checkSuccessCode(res)
            checkPayloadArray(res)

            res.payload.map(m => {
                expect(m.author).to.deep.equal({ handle: author.handle });
            });
        });

        it("Should return an array of messages", async function () {
            
            expect(author).to.not.be.null;

            const res = await MessageService.getUserMessages({
                handle: author.handle,
                reqUser: author
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

            expect(author).to.not.be.null;

            const res = await MessageService.getUserMessages({
                handle: author.handle,
                reqUser: author
            });

            const num_messages = await Message.find().count();

            //console.log(num_messages);

            checkSuccessCode(res);
            checkPayloadArray(res);

            expect(res.payload).to.have.lengthOf(Math.min(config.results_per_page, num_messages))
        });

        describe("getUserMessages Filters Unit Tests", function () {

            const fames = ['popular', 'unpopular', 'controversial'];
            const timeframes = ['day', 'week', 'month', 'year'];

            fames.map(fame => {
                timeframes.map(timeframe => {
                    it(`Should return only ${fame} messages from this ${timeframe}`, async function () {

                        let params = new Object();

                        expect(author).to.not.be.null;

                        params[fame] = timeframe;
                        params.handle = author.handle;
                        params.reqUser = author;

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

                    expect(author).to.not.be.null;

                    params.risk = fame;
                    params.handle = author.handle;
                    params.reqUser = author;

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

                    expect(author).to.not.be.null;

                    params.before = d.toString();
                    params.handle = author.handle;
                    params.reqUser = author;

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

                    expect(author).to.not.be.null;

                    params.after = d.toString();
                    params.handle = author.handle;
                    params.reqUser = author;

                    const res = await MessageService.getUserMessages(params);

                    checkSuccessCode(res);
                    checkPayloadArray(res);

                    res.payload.map(m => {
                        expect(dayjs(m.meta.created).isSameOrAfter(d, 'second')).to.be.true;
                    })
                }));
            })

            it("Should only return messages destined to the given users", async function () {

                const handles = recievers1;

                let params = new Object();

                expect(author).to.not.be.null;

                params.dest = handles.map(h => '@' + h);
                params.handle = author.handle;
                params.reqUser = author;

                const res = await MessageService.getUserMessages(params);

                checkSuccessCode(res);
                checkPayloadArray(res);

                res.payload.map(m => {
                    expect(m.destUser.some(u => handles.find(h => h === u.handle) !== -1))
                        .to.be.true;
                    expect(m.author.handle).to.equal(author.handle);
                })
            });

            it("Should only return messages destined to the given channels", async function () {

                const creator = UserDispatch.getNext();
                const users = [UserDispatch.getNext(), UserDispatch.getNext(), UserDispatch.getNext()]
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

                await Promise.all(users.map(async u => {

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
                        users.map(u => u.handle),
                        [name])

                    await addMessage(lorem.generateSentences(2), creator.handle,
                        users.map(u => u.handle),
                        [name, name2])
                    await addMessage(lorem.generateSentences(2), creator.handle,
                        users.map(u => u.handle),
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
    });

    describe("postUserMessage Unit Tests", async function(){

        it("Should fail if the handle does not exist", async function(){
            
            const u = UserDispatch.getNext();
            // console.log(u.handle);

            const text = lorem.generateWords(20);

            const res = await MessageService.postUserMessage({ 
                reqUser: new_author,
                handle: new_author.handle + 'ckjdfvnkdjfnoafnwjfv sjdfbu3i4ru3904uty2495y9hquvsadjnqa',
                content: {
                    text: text,
                }, 
                dest: recievers2.map(h => '@' + h)
            })

            checkErrorCode(res);

        });

        it("Should allow message creation if the user has enough characters left", async function(){
            
            const u = UserDispatch.getNext();
            //console.log(u.handle);

            const text = lorem.generateWords(10);
            const cur_chars = JSON.parse(JSON.stringify(new_author.charLeft));

            expect(Math.min(cur_chars.day, cur_chars.week, cur_chars.month) >= text.length)
                .to.be.true;

            const res = await MessageService.postUserMessage({
                reqUser: new_author,
                handle: new_author.handle,
                content: {
                    text: text,
                },
                dest: recievers2.map(handle => '@' + handle)
            })

            checkSuccessCode(res);
        });

        it("Should adjust the author's remaining characters", async function () {

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
                    .map(handle => '@' + handle)
            })

            checkSuccessCode(res);

            const checkUser = await User.findOne({ handle: u.handle });
            expect(checkUser.charLeft.day).to.equal(cur_chars.day - text.length)
            expect(checkUser.charLeft.week).to.equal(cur_chars.week - text.length)
            expect(checkUser.charLeft.month).to.equal(cur_chars.month - text.length)

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
                    dest: dests
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

        it("Should change the user's character when getting enough positive reactions", async function(){
            
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

            // check characters are left unchanged
            const res = await MessageService.addPositiveReaction({ id: message._id });
            
            checkSuccessCode(res)

            user = await User.findOne({ handle: user.handle }).orFail();
            expect(charCopy, 'Changed characters when it shouldnt have')
                .to.deep.equal(user.toObject().charLeft);
            
            // check characters are changed once threshold is reached
            message = await Message.findById(message._id).orFail();
            message.reactions.positive = config.reactions_reward_threshold - 1;

            await message.save();

            const res1 = await MessageService.addPositiveReaction({ id: message._id });

            checkSuccessCode(res1)

            user = await User.findOne({ handle: user.handle }).orFail();

            let newChars = {...charCopy};

            newChars.day += config.reactions_reward_amount;
            newChars.week += config.reactions_reward_amount;
            newChars.month += config.reactions_reward_amount;

            expect(newChars, 'Did not characters when it shouldnt have')
                .to.deep.equal(user.toObject().charLeft);
        })
    })

    describe("addNegativeReaction Unit Tests", function () {

        it("Should fail if id is not valid", async function () {

            const res = await MessageService.addNegativeReaction({
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

            const res = await MessageService.addNegativeReaction({
                id: message._id,
            })

            checkSuccessCode(res);

            urecord = await User.findOne({ handle: u.handle });
            const check = await Message.findOne({ author: urecord._id });

            expect(old_reactions.positive).to.equal(check.reactions.positive)
            expect(old_reactions.negative + 1).to.equal(check.reactions.negative)
        });

        it("Should change the user's character when getting enough negative reactions", async function () {

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

            // check characters are left unchanged
            const res = await MessageService.addNegativeReaction({ id: message._id });

            checkSuccessCode(res)

            user = await User.findOne({ handle: user.handle }).orFail();
            expect(charCopy, 'Changed characters when it shouldnt have')
                .to.deep.equal(user.toObject().charLeft);

            // check characters are changed once threshold is reached
            message = await Message.findById(message._id).orFail();
            message.reactions.negative = config.reactions_reward_threshold - 1;

            await message.save();

            const res1 = await MessageService.addNegativeReaction({ id: message._id });

            checkSuccessCode(res1);

            user = await User.findOne({ handle: user.handle }).orFail();

            let newChars = { ...charCopy };

            newChars.day -= config.reactions_reward_amount;
            newChars.week -= config.reactions_reward_amount;
            newChars.month -= config.reactions_reward_amount;

            expect(newChars, 'Did not characters when it shouldnt have')
                .to.deep.equal(user.toObject().charLeft);
        })
    })

    describe("deleteChannelMessages Unit Tests", function(){

        it("Should fail if there is no channell with the given name", async function(){

            const name = UserDispatch.getNextChannelName();

            res = await MessageService.deleteChannelMessages({ name: name });

            checkErrorCode(res);

        });

        it("Shuld remove the channel from the dest list of all messages", async function () {

            const creator = UserDispatch.getNext();
            const users = [UserDispatch.getNext(), UserDispatch.getNext(), UserDispatch.getNext()]
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

            await Promise.all(users.map(async u => {

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
                    users.map(u => u.handle),
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
            const users = [UserDispatch.getNext(), UserDispatch.getNext(), UserDispatch.getNext()]
            const description = lorem.generateParagraphs(1);

            const name = UserDispatch.getNextChannelName();


            await createChannel({
                name: name,
                ownerHandle: creator.handle,
                description: description,
            })


            let crec = await Channel.findOne({ name: name });

            expect(crec).to.not.be.null;

            await Promise.all(users.map(async u => {

                let urec = await User.findOne({ handle: u.handle });

                expect(urec).to.not.be.null;

                urec.joinedChannels.push(crec._id);
                return urec.save();
            }))

            for (let i = 0; i < users.length; i++) {

                let urec = await User.findOne({ handle: users[i].handle });

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