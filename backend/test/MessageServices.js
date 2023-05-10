let expect = require('chai').expect;
const LoremIpsum = require("lorem-ipsum").LoremIpsum;


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
    return Math.floor(Math.random() * maximum);
}

describe('Message Service Unit Tests', function () {

    describe.only("getMessages Unit Tests", function(){
       
        before(async function(){
            /*
            *  NB this breaks the character limits, messages should be added using the service
            */

            this.timeout(5000)

            const handleauth1 = testUser(31).handle;
            const recievers1 = [testUser(32).handle, testUser(33).handle]
            const handleauth2 = testUser(34).handle;
            const recievers2 = [testUser(35).handle, testUser(36).handle]

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
            }

            const u1 = await User.findOne({ handle: handleauth1 });
            //console.log(u1.messages.length);

            const u2 = await User.findOne({ handle: recievers1[0] });
            //console.log(u2._id)
            const m2 = await Message.find({ destUser: u2._id }).exec();
            //console.log(m2.length);
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

        it("Should respect the given filters");

        it(`Should at most return ${config.results_per_page} messages`);
    });

    describe.skip("getUserMessages Unit Tests");

    describe.skip("postUserMessage Unit Tests");

    describe.skip("deletrUserMessages Unit Tests");

    describe.skip("deleteMessage Unit Tests");

    describe.skip("postMessage Unit Tests");
})