let expect = require('chai').expect;

const ValidationError = require('mongoose').Error.ValidationError;
const LoremIpsum = require("lorem-ipsum").LoremIpsum;
const dayjs = require('dayjs');
let isBetween = require('dayjs/plugin/isBetween')
dayjs.extend(isBetween)

const config = require('../config');
const Message = require('../models/Message');
const User = require('../models/User');
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

const messagesCount = 10;


describe('Message Model Unit Tests', function(){

    let all = null;

    before(async function () {
        /*
        *  NB this breaks the character limits, messages should be added using the service
        */
        this.timeout(7000)
        const handleauth1 = testUser(37).handle;
        const recievers1 = [testUser(38).handle, testUser(39).handle]
        const handleauth2 = testUser(40).handle;
        const recievers2 = [testUser(41).handle, testUser(42).handle]
        // Random Messages
        for (let i = 0; i < messagesCount; i++) {
            await addMessage(
                lorem.generateSentences(getRandom(3) + 1),
                handleauth1,
                [recievers1[0]],
            )
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
    })

    describe("Query Helpers Unit Tests", function(){

        describe("byPopularity Unit Tests", function(){

            ['popular', 'unpopular', 'controversial'].map(fame => {
                
                it(`Should return all and only ${fame} messages`, async function(){
                    expect(all).to.be.an('array').that.is.not.empty;
                    
                    const res = await Message.find().byPopularity(fame);
                    expect(res).to.be.an('array').that.is.not.empty;
                    res.map(m => {
                        expect(m).to.be.an('object').that.has.property('reactions');
                        expect(m.reactions).to.be.an('object').that.has.property('positive');
                        expect(m.reactions).to.be.an('object').that.has.property('negative');
                        expect(checkFame(m.reactions, fame)).to.be.true;
                    })
                    // check it returned all popular messages
                    all.map(m => {
                        if (checkFame(m.reactions, fame)) {
                            expect(res.some(pm => pm._id.equals(m._id)));
                        }
                    })
                });
            })
           
        });

        describe("byRisk Unit Tests", function () {
            
            ['popular', 'unpopular', 'controversial'].map(fame => {
            
                it(`Should return all and only messages at risk of being ${fame}`, async function () {
                    expect(all).to.be.an('array').that.is.not.empty;
                    const res = await Message.find().byRisk(fame);
                    expect(res).to.be.an('array').that.is.not.empty;
                    res.map(m => {
                        expect(m).to.be.an('object').that.has.property('reactions');
                        expect(m.reactions).to.be.an('object').that.has.property('positive');
                        expect(m.reactions).to.be.an('object').that.has.property('negative');
                        expect(checkRiskOfFame(m.reactions, fame)).to.be.true;
                    })
                    // check it returned all popular messages
                    all.map(m => {
                        if (checkRiskOfFame(m.reactions, fame)) {
                            expect(res.some(pm => pm._id.equals(m._id)));
                        }
                    })
                });
            })
            
        });

        describe("byTimeFrame Unit Tests", function(){
          
            ['day', 'week', 'month', 'year'].map(period => {
              
                it(`Should only return messages from this ${period}`, async function(){
                    
                    expect(all).to.not.be.null;
                    expect(all).to.be.an('array').that.is.not.empty;
                    
                    const res = await Message.find().byTimeFrame(period);
                    
                    expect(res).to.be.an('array').that.is.not.empty;
                    res.map(m => {
                        expect(m).to.be.an('object').that.has.property('meta');
                        expect(m.meta).to.be.an('object').that.has.property('created');
                        
                        const created = dayjs(m.meta.created);
                        expect(created.isBetween(dayjs(), dayjs().startOf(period)))
                            .to.be.true;
                    })
                    // check it returned all popular messages
                    all.map(m => {
                        const created = dayjs(m.meta.created);
                        if (created.isBetween(dayjs(), dayjs().startOf(period))) {
                            expect(res.some(pm => pm._id.equals(m._id)));
                        }
                    })
                })
            })
        });

    })
})