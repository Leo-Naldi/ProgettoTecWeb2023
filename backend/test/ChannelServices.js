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
const Channel = require('../models/Channel');
const ChannelServices = require('../services/ChannelServices');
const { testUser, addMessage, UserDispatch } = require('./hooks');
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

async function createChannel({ name, ownerHandle, description }) {

    const u = await User.findOne({ handle: ownerHandle });
    const channel = new Channel({
        name: name,
        creator: u._id,
    })

    if (description) channel.description = description;

    
    await channel.save();

    u.joinedChannels.push(channel._id);

    await u.save();

}

describe("ChannelService Unit Tests", function(){

    describe("getChannels Unit Tests", async function(){

        it('Should return an array of channels', async function(){

            const u = UserDispatch.getNext();
            const description = lorem.generateParagraphs(1);

            for (let i = 0; i < 5; i++)
                await createChannel({ 
                    name: UserDispatch.getNextChannelName(),
                    ownerHandle: u.handle,
                    description: description,
                 })

            const res = await ChannelServices.getChannels();

            expect(res).to.be.an('object');
            expect(res).to.have.property('status');
            expect(res.status).to.equal(config.default_success_code);
            expect(res).to.have.property('payload');
            expect(res.payload).to.be.an('array').that.is.not.empty;

            res.payload.map(c => {
                expect(c).to.be.an('object')
                expect(c).to.have.property('_id');
                expect(c).to.have.property('name');
                expect(c).to.have.property('messages');
                expect(c).to.have.property('creator');
                expect(c).to.have.property('members');
                expect(c).to.have.property('private');
                expect(c).to.have.property('official');
                expect(c).to.have.property('created');
            })

        });

        it('Should return an empty array if the onwer does not exist', async function(){
            
            const res = await ChannelServices.getChannels({ owner: 'ascadcafvhbsdfbv sldfv' });

            expect(res).to.be.an('object');
            expect(res).to.have.property('status');
            expect(res.status).to.equal(config.default_success_code);
            expect(res).to.have.property('payload');
            expect(res.payload).to.be.an('array').that.is.empty;
        });

        it('Should return channels owned by the given user', async function(){

            const u = UserDispatch.getNext();
            const description = lorem.generateParagraphs(1);

            for (let i = 0; i < 5; i++)
                await createChannel({
                    name: UserDispatch.getNextChannelName(),
                    ownerHandle: u.handle,
                    description: description,
                })
            
            const u2 = UserDispatch.getNext();
            const description2 = lorem.generateParagraphs(1);

            for (let i = 10; i < 20; i++)
                await createChannel({
                    name: UserDispatch.getNextChannelName(),
                    ownerHandle: u2.handle,
                    description: description2,
                })

            const res = await ChannelServices.getChannels({
                owner: u.handle,
            });

            expect(res).to.be.an('object');
            expect(res).to.have.property('status');
            expect(res.status).to.equal(config.default_success_code);
            expect(res).to.have.property('payload');
            expect(res.payload).to.be.an('array').that.is.not.empty;

            res.payload.map(c => {
                expect(c).to.be.an('object')
                expect(c).to.have.property('_id');
                expect(c).to.have.property('creator');
                expect(c.creator).to.deep.include({ handle: u.handle })
            })

        });

        it('Should return channels with the given number of messages', async function(){
            const u = UserDispatch.getNext();
            const description = lorem.generateParagraphs(1);

            const name1 = UserDispatch.getNextChannelName();
            
            await createChannel({
                name: name1,
                ownerHandle: u.handle,
                description: description,
            })

            const u2 = UserDispatch.getNext();
            const description2 = lorem.generateParagraphs(1);

            const name2 = UserDispatch.getNextChannelName();

            await createChannel({
                name: name2,
                ownerHandle: u2.handle,
                description: description2,
            })
            
            for(let i = 0; i < 20; i++) {
                await addMessage(
                    lorem.generateSentences(2),
                    u.handle,
                    [],
                    [name1]
                )
            }
            for (let i = 0; i < 10; i++) {
                await addMessage(
                    lorem.generateSentences(2),
                    u2.handle,
                    [],
                    [name2]
                )
            }

            const limit = 11

            const res = await ChannelServices.getChannels({
                postCount: limit
            });

            expect(res).to.be.an('object');
            expect(res).to.have.property('status');
            expect(res.status).to.equal(config.default_success_code);
            expect(res).to.have.property('payload');
            expect(res.payload).to.be.an('array').that.is.not.empty;

            res.payload.map(c => {
                expect(c).to.be.an('object')
                expect(c).to.have.property('messages');
                expect(c.messages.length >= limit).to.be.true;
            })

        });
    })

});