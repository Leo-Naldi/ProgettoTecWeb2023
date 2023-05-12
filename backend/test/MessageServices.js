let expect = require('chai').expect;
const LoremIpsum = require("lorem-ipsum").LoremIpsum;
const dayjs = require('dayjs');

const config = require('../config');
const User = require('../models/User');
const Message = require('../models/Message');
const MessageService = require('../services/MessageServices');
const { testUser, addMessage } = require('./hooks');

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

function getRandom(maximum){

    // Random int between 0 and max, 0 included max excluded,
    return Math.floor(Math.random() * maximum);
}

function getDateWithin(timeperiod) {

    let baseRes = dayjs().startOf('day')
        
    switch (timeperiod) {
        case 'today':
            
            break;  // Base res is fine

        case 'week':

            // Return a random date within the past week
            baseRes = baseRes.startOf('week').add(getRandom(8), 'day')
            break;

        case 'month':
            // Return a random date within the past month
            baseRes = baseRes.startOf('month')
                .add(getRandom(dayjs().date() + 1), 'day')
            break;

        case 'year': 

            baseRes = baseRes.startOf('year')
                .add(getRandom(dayjs().month() + 1), 'month');  // months are 0 indexed
            baseRes = baseRes.add(getRandom(baseRes.daysInMonth() + 1), 'day');

            break;
        default:
            throw Error(`getDateWithin unknown time period: ${timeperiod}`);
    }

    baseRes = baseRes.add(getRandom(24), 'hour')
        .add(getRandom(60), 'minute')
        .add(getRandom(60), 'second');

    // Since we added random hour/min/secs we could end up with a date in the future
    if (baseRes.isAfter(dayjs(), 'second'))
        baseRes = dayjs();

    return baseRes;
}

function checkThreshold(x) {
    return x >= config.crit_mass * config.impression_step;
}

describe('Message Service Unit Tests', function () {

    describe.skip("getMessages Unit Tests", function(){
       
        before(async function(){
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
            }

            // Ensure there is at least one popular message, one unpopular and 
            // one controversial for each time frame

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
            })

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
                        recievers1,
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
                        recievers1,
                        [],
                        getDateWithin(p),
                        getControversial(),
                    )
            }))

        })

        it("Should return an array of messages", async function(){
            const res = await MessageService.getMessages();

            expect(res).to.be.an('object');
            expect(res).to.have.property('status');
            expect(res.status).to.equal(config.default_success_code);
            expect(res).to.have.property('payload');
            expect(res.payload).to.be.an('array').that.is.not.empty;
            expect(res.payload[0]).to.be.an('object');
            expect(res.payload[0]).to.have.property('content');
            expect(res.payload[0]).to.have.property('reactions');
            expect(res.payload[0]).to.have.property('meta');
        });

        it("Should respect the given filters", async function(){
            
            const upper_bound = Math.floor(config.impression_step * config.crit_mass);
            const m = await Message.find().and([
                {
                    'reactions.positive': {
                        '$gte': upper_bound
                    }
                },
                {
                    'reactions.positive': {
                        '$lt': upper_bound
                    }
                }
            ]);

            console.log(m)
            
            // Popular Filter
            //const popMessagesReply = await MessageService.getMessages({ popular: 'today' });
//
            //expect(popMessagesReply).to.be.an('object');
            //expect(popMessagesReply).to.have.property('status');
            //expect(popMessagesReply.status).to.equal(config.default_success_code);
            //expect(popMessagesReply).to.have.property('payload');
            //expect(popMessagesReply.payload).to.be.an('array').that.is.not.empty;
//
            //popMessagesReply.payload.map(m => { 
            //    
            //    expect(m).to.be.an('object').that.has.property('reactions');
            //    expect(m.reactions).to.be.an('object').that.has.property('positive');
            //    expect(m.reactions).to.be.an('object').that.has.property('negative');
            //    expect(m.reactions.positive).to.be.a('number');
            //    expect(m.reactions.negative).to.be.a('number');
            //    expect(checkThreshold(m.reactions.positive)).to.be.true;
            //    expect(checkThreshold(m.reactions.negative)).to.be.false;
            //})            

            // Unpopular Filter

            // Controversial Filter

            // Risk Filter

            // Before Filter

            // After filter

            // dest filter
        });

        it(`Should at most return ${config.results_per_page} messages`);
    });

    describe.skip("getUserMessages Unit Tests");

    describe.skip("postUserMessage Unit Tests");

    describe.skip("deletrUserMessages Unit Tests");

    describe.skip("deleteMessage Unit Tests");

    describe.skip("postMessage Unit Tests");
})