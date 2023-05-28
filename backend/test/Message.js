let expect = require('chai').expect;

const LoremIpsum = require("lorem-ipsum").LoremIpsum;
const dayjs = require('dayjs');
let isBetween = require('dayjs/plugin/isBetween')
dayjs.extend(isBetween)


const Message = require('../models/Message');

const { addMessage, UserDispatch } = require('./hooks');
const { getRandom, getDateWithin } = require('../utils/getDateWithin');
const {
    checkFame,
    checkRiskOfFame,
    getUnpopular,
    getPopular,
    getControversial,
    getRiskPopular,
    getRiskUnpopular,
    getRiskControversial,
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
        this.timeout(7000)  // 37
        const handleauth1 = UserDispatch.getNext().handle;
        //console.log(handleauth1);
        const recievers1 = [UserDispatch.getNext().handle, UserDispatch.getNext().handle]
        const handleauth2 = UserDispatch.getNext().handle;
        const recievers2 = [UserDispatch.getNext().handle, UserDispatch.getNext().handle]
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