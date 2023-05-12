let expect = require('chai').expect;
const LoremIpsum = require("lorem-ipsum").LoremIpsum;
const mongoose = require('mongoose');
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
const MessageService = require('../services/MessageServices');
const { testUser, addMessage } = require('./hooks');
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


const messagesCount = 30;

const lorem = new LoremIpsum({
    sentencesPerParagraph: {
        max: 8,
        min: 4
    },
    wordsPerSentence: {
        max: 20,
        min: 4
    }
});


describe('Message Service Unit Tests', function () {

    let all = null;
    let author = null;
    let new_author =  null;

    before(async function () {
        /*
        *  NB this breaks the character limits, messages should be added using the service
        */
        this.timeout(7000)
        const handleauth1 = testUser(31).handle;
        const recievers1 = [testUser(32).handle, testUser(33).handle]
        const handleauth2 = testUser(34).handle;
        const recievers2 = [testUser(35).handle, testUser(36).handle]
        // Random Messages
        for (let i = 0; i < messagesCount; i++) {
            await addMessage(
                lorem.generateSentences(getRandom(3) + 1),
                handleauth1,
                [recievers1[0]],
            );
            await addMessage(
                lorem.generateSentences(getRandom(3) + 1),
                handleauth1,
                [recievers1[1]],
            )
            await addMessage(
                lorem.generateSentences(getRandom(3) + 1),
                handleauth2,
                [recievers2[0]],
                [],
                dayjs().subtract(2, 'day'),
                {
                    positive: getRandom(3000),
                    negative: getRandom(20),
                }
            )
            await addMessage(
                lorem.generateSentences(getRandom(3) + 1),
                handleauth2,
                [recievers2[1]],
                [],
                dayjs().subtract(2, 'month'),
                {
                    negative: getRandom(3000),
                    positive: getRandom(20),
                }
            )
            await addMessage(
                lorem.generateSentences(getRandom(3) + 1),
                handleauth2,
                [recievers2[1]],
                [],
                dayjs().subtract(2, 'year'),
                {
                    negative: getRandom(3000),
                    positive: getRandom(20),
                }
            )
            await addMessage(
                lorem.generateSentences(getRandom(3) + 1),
                handleauth1,
                [recievers2[1]],
                [],
                dayjs().subtract(2, 'year'),
                {
                    negative: getRandom(3000),
                    positive: getRandom(20),
                }
            )
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
        await Promise.all(periods.map(async p => {
            for (let i = 0; i < getRandom(maxMessages) + 1; i++)
                await addMessage(
                    lorem.generateSentences(getRandom(3) + 1),
                    handleauth1,
                    recievers2,
                    [],
                    getDateWithin(p),
                    getPopular(),
                )
        }))
        await Promise.all(periods.map(async p => {
            for (let i = 0; i < getRandom(maxMessages) + 1; i++)
                await addMessage(
                    lorem.generateSentences(getRandom(3) + 1),
                    handleauth1,
                    recievers2,
                    [],
                    getDateWithin(p),
                    getUnpopular(),
                )
        }))
        await Promise.all(periods.map(async p => {
            for (let i = 0; i < getRandom(maxMessages) + 1; i++)
                await addMessage(
                    lorem.generateSentences(getRandom(3) + 1),
                    handleauth1,
                    recievers2,
                    [],
                    getDateWithin(p),
                    getControversial(),
                )
        }))
        await Promise.all(periods.map(async p => {
            for (let i = 0; i < getRandom(maxMessages) + 1; i++)
                await addMessage(
                    lorem.generateSentences(getRandom(3) + 1),
                    handleauth1,
                    recievers2,
                    [],
                    getDateWithin(p),
                    getRiskPopular(),
                )
        }))
        await Promise.all(periods.map(async p => {
            for (let i = 0; i < getRandom(maxMessages) + 1; i++)
                await addMessage(
                    lorem.generateSentences(getRandom(3) + 1),
                    handleauth1,
                    recievers2,
                    [],
                    getDateWithin(p),
                    getRiskUnpopular(),
                )
        }))
        await Promise.all(periods.map(async p => {
            for (let i = 0; i < getRandom(maxMessages) + 1; i++)
                await addMessage(
                    lorem.generateSentences(getRandom(3) + 1),
                    handleauth1,
                    recievers2,
                    [],
                    getDateWithin(p),
                    getRiskControversial(),
                )
        }))

        all = await Message.find();
        author = await User.findOne({ handle: handleauth1 });
        new_author = await User.findOne({ handle: testUser(43).handle });
    })

    describe("getMessages Unit Tests", function(){

        it("Should return an array of messages", async function(){
            const res = await MessageService.getMessages();

            expect(res).to.be.an('object');
            expect(res).to.have.property('status');
            expect(res.status).to.equal(config.default_success_code);
            expect(res).to.have.property('payload');
            expect(res.payload).to.be.an('array').that.is.not.empty;

            res.payload.map(m => {
                expect(m).to.be.an('object');
                expect(m).to.have.property('content');
                expect(m).to.have.property('reactions');
                expect(m).to.have.property('meta');
                expect(m.meta).to.be.an('object').that.has.property('created');
                expect(m).to.have.property('author');
                expect(m).to.have.property('destChannel');
                expect(m.destChannel).to.be.an('array');
                expect(m).to.have.property('destUser');
                expect(m.destChannel).to.be.an('array');
            })
        });

        it(`Should at most return ${config.results_per_page} messages`, async function(){
            
            const res = await MessageService.getMessages();
            const num_messages = await Message.find().count();

            //console.log(num_messages);

            expect(res).to.be.an('object');
            expect(res).to.have.property('status');
            expect(res.status).to.equal(config.default_success_code);
            expect(res).to.have.property('payload');
            expect(res.payload).to.be.an('array').that.is.not.empty;
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

                        expect(res).to.be.an('object');
                        expect(res).to.have.property('status');
                        expect(res.status).to.equal(config.default_success_code);
                        expect(res).to.have.property('payload');
                        expect(res.payload).to.be.an('array').that.is.not.empty;

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

                    expect(res).to.be.an('object');
                    expect(res).to.have.property('status');
                    expect(res.status).to.equal(config.default_success_code);
                    expect(res).to.have.property('payload');
                    expect(res.payload).to.be.an('array').that.is.not.empty;

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
                    
                    expect(res).to.be.an('object');
                    expect(res).to.have.property('status');
                    expect(res.status).to.equal(config.default_success_code);
                    expect(res).to.have.property('payload');
                    expect(res.payload).to.be.an('array').that.is.not.empty;

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

                    expect(res).to.be.an('object');
                    expect(res).to.have.property('status');
                    expect(res.status).to.equal(config.default_success_code);
                    expect(res).to.have.property('payload');
                    expect(res.payload).to.be.an('array').that.is.not.empty;

                    res.payload.map(m => {
                        expect(dayjs(m.meta.created).isSameOrAfter(d, 'second')).to.be.true;
                    })
                }));
            })

            it("Should only return messages destined to the given user", async function(){

                const handle = testUser(32).handle;

                const res = await MessageService.getMessages({ dest: '@' + handle })

                expect(res).to.be.an('object');
                expect(res).to.have.property('status');
                expect(res.status).to.equal(config.default_success_code);
                expect(res).to.have.property('payload');
                expect(res.payload).to.be.an('array').that.is.not.empty;

                res.payload.map(m => {
                    expect(m.destUser, `Expected ${m.destUser} to include ${handle}`)
                        .to.deep.include({ handle: handle });
                })
            });

            it("Should only return messages destined to the given channel");

        });

    });

    describe("getUserMessages Unit Tests", function(){
        
        it("Should only return messages authored by the given user", async function () {

            expect(author).to.not.be.null;

            const res = await MessageService.getUserMessages({ 
                handle: author.handle,
                reqUser: author
            });

            expect(res).to.be.an('object');
            expect(res).to.have.property('status');
            expect(res.status).to.equal(config.default_success_code);
            expect(res).to.have.property('payload');
            expect(res.payload).to.be.an('array').that.is.not.empty;

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

            expect(res).to.be.an('object');
            expect(res).to.have.property('status');
            expect(res.status).to.equal(config.default_success_code);
            expect(res).to.have.property('payload');
            expect(res.payload).to.be.an('array').that.is.not.empty;

            res.payload.map(m => {
                expect(m).to.be.an('object');
                expect(m).to.have.property('content');
                expect(m).to.have.property('reactions');
                expect(m).to.have.property('meta');
                expect(m.meta).to.be.an('object').that.has.property('created');
                expect(m).to.have.property('author');
                expect(m).to.have.property('destChannel');
                expect(m.destChannel).to.be.an('array');
                expect(m).to.have.property('destUser');
                expect(m.destChannel).to.be.an('array');
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

            expect(res).to.be.an('object');
            expect(res).to.have.property('status');
            expect(res.status).to.equal(config.default_success_code);
            expect(res).to.have.property('payload');
            expect(res.payload).to.be.an('array').that.is.not.empty;
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

                        expect(res).to.be.an('object');
                        expect(res).to.have.property('status');
                        expect(res.status).to.equal(config.default_success_code);
                        expect(res).to.have.property('payload');
                        expect(res.payload).to.be.an('array').that.is.not.empty;

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

                    expect(res).to.be.an('object');
                    expect(res).to.have.property('status');
                    expect(res.status).to.equal(config.default_success_code);
                    expect(res).to.have.property('payload');
                    expect(res.payload).to.be.an('array').that.is.not.empty;

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

                    expect(res).to.be.an('object');
                    expect(res).to.have.property('status');
                    expect(res.status).to.equal(config.default_success_code);
                    expect(res).to.have.property('payload');
                    expect(res.payload).to.be.an('array').that.is.not.empty;

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

                    expect(res).to.be.an('object');
                    expect(res).to.have.property('status');
                    expect(res.status).to.equal(config.default_success_code);
                    expect(res).to.have.property('payload');
                    expect(res.payload).to.be.an('array').that.is.not.empty;

                    res.payload.map(m => {
                        expect(dayjs(m.meta.created).isSameOrAfter(d, 'second')).to.be.true;
                    })
                }));
            })

            it("Should only return messages destined to the given user", async function () {

                const handle = testUser(32).handle;

                let params = new Object();

                expect(author).to.not.be.null;

                params.dest = '@' + handle;
                params.handle = author.handle;
                params.reqUser = author;

                const res = await MessageService.getUserMessages(params);

                expect(res).to.be.an('object');
                expect(res).to.have.property('status');
                expect(res.status).to.equal(config.default_success_code);
                expect(res).to.have.property('payload');
                expect(res.payload).to.be.an('array').that.is.not.empty;

                res.payload.map(m => {
                    expect(m.destUser, `Expected ${m.destUser} to include ${handle}`)
                        .to.deep.include({ handle: handle });
                })
            });

            it("Should only return messages destined to the given channel");

        });
    });

    describe("postUserMessage Unit Tests", function(){

        it("Should fail if the handle does not exist", async function(){

            const text = lorem.generateWords(20);

            const res = await MessageService.postUserMessage({ 
                reqUser: new_author,
                handle: new_author.handle + 'ckjdfvnkdjfnoafnwjfv sjdfbu3i4ru3904uty2495y9hquvsadjnqa',
                content: {
                    text: text,
                }, 
                dest: ['@' + testUser(35).handle, '@' + testUser(36).handle]
            })

            expect(res).to.be.an('object');
            expect(res).to.have.property('status');
            expect(res.status).to.equal(config.default_client_error);

        });

        it("Should allow message creation if the user has enough characters left", async function(){
            
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
                dest: ['@' + testUser(35).handle, '@' + testUser(36).handle]
            })

            expect(res).to.be.an('object');
            expect(res).to.have.property('status');
            expect(res.status).to.equal(config.default_success_code);

            const checkUser = await User.findOne({ handle: new_author.handle });
            expect(checkUser.charLeft.day).to.equal(cur_chars.day - text.length)
            expect(checkUser.charLeft.week).to.equal(cur_chars.week - text.length)
            expect(checkUser.charLeft.month).to.equal(cur_chars.month - text.length)
        });

        it("Should adjust the author's remaining characters");

        it("Should fail if the user does not have enough daily characters");

        it("Should fail if the user does not have enough weekly characters");

        it("Should fail if the user does not have enough monthly characters");

    });

    describe.skip("deletrUserMessages Unit Tests");

    describe.skip("deleteMessage Unit Tests");

    describe.skip("postMessage Unit Tests");
})