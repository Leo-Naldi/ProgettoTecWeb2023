let expect = require('chai').expect;
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
const Message = require('../models/Message');
const ChannelServices = require('../services/ChannelServices');
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


const messagesCount = 30;

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
                expect(c).to.have.property('privateChannel');
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

        it("Should fail if there is no user with the handle given in member", async function(){
            const u = UserDispatch.getNext();
            const urec = await User.findOne({ handle: u.handle });

            const res = await ChannelServices.getChannels({ 
                reqUser: u, 
                member: u.handle + 'wkjerhfclwrfnqo;wnq;efnvjefvnq;ureubfq;rujbvajefnv' });

            expect(res).to.be.an("object");
            expect(res).to.have.property('status');
            expect(res.status).to.equal(config.default_client_error);
        });

        it("Should only return channels that the given user is a member of", async function(){
            
            const u = UserDispatch.getNext();
            const description = lorem.generateParagraphs(1);

            for (let i = 0; i < 5; i++)
                await createChannel({
                    name: UserDispatch.getNextChannelName(),
                    ownerHandle: u.handle,
                    description: description,
                })

            let urec = await User.findOne({ handle: UserDispatch.getNextAdmin().handle });

            const res = await ChannelServices.getChannels({ 
                reqUser: urec,
                member: u.handle
            });

            const user = await User.findOne({ handle: u.handle });

            expect(res).to.be.an('object');
            expect(res).to.have.property('status');
            expect(res.status).to.equal(config.default_success_code);
            expect(res).to.have.property('payload');
            expect(res.payload).to.be.an('array').that.is.not.empty;
            
            res.payload.map(c => {
                expect(user.joinedChannels.some(id => id.equals(c._id))).to.be.true;
            })

            user.joinedChannels.map(id => {
                expect(res.payload.some(c => id.equals(c._id))).to.be.true;
            })

        });

        it("Should only return channels with the given private setting", async function () {

            const u = UserDispatch.getNext();
            const description = lorem.generateParagraphs(1);

            for (let i = 0; i < 5; i++) {
                await createChannel({
                    name: UserDispatch.getNextChannelName(),
                    ownerHandle: u.handle,
                    description: description,
                    privateChannel: true
                })
                await createChannel({
                    name: UserDispatch.getNextChannelName(),
                    ownerHandle: u.handle,
                    description: description,
                    privateChannel: false
                })
            }

            let urec = await User.findOne({ handle: UserDispatch.getNextAdmin().handle });

            const res = await ChannelServices.getChannels({
                reqUser: urec,
                privateChannel: true
            });

            expect(res).to.be.an('object');
            expect(res).to.have.property('status');
            expect(res.status).to.equal(config.default_success_code);

            res.payload.map(c => {
                expect(c.privateChannel).to.be.true;
            })


            const res2 = await ChannelServices.getChannels({
                reqUser: urec,
                privateChannel: false
            });

            expect(res2).to.be.an('object');
            expect(res2).to.have.property('status');
            expect(res2.status).to.equal(config.default_success_code);

            res2.payload.map(c => {
                expect(c.privateChannel).to.be.false;
            })

        });
    })

    describe("createChannel Unit Tests", function(){

        it("Should fail if the name is already taken", async function(){
            const u = UserDispatch.getNext();
            const description = lorem.generateParagraphs(1);

            const name = UserDispatch.getNextChannelName();

            
            await createChannel({
                name: name,
                ownerHandle: u.handle,
                description: description,
            })

            const urec = await User.findOne({ handle: u.handle });

            res = await ChannelServices.createChannel({ name: name, reqUser: urec });

            expect(res).to.be.an("object");
            expect(res).to.have.property('status');
            expect(res.status).to.equal(config.default_client_error);
        });

        it("Should fail if the description is not a string",async function () {
            
            const u = UserDispatch.getNext();

            const name = UserDispatch.getNextChannelName();

            const urec = await User.findOne({ handle: u.handle });

            res = await ChannelServices.createChannel({ 
                name: name, 
                reqUser: urec,
                description: {
                    secret: 'commencehack.exe'
                }
            });

            expect(res).to.be.an("object");
            expect(res).to.have.property('status');
            expect(res.status).to.equal(config.default_client_error);
        });

        it("Should succeed if the name is available", async function(){
            
            const u = UserDispatch.getNext();
            const name = UserDispatch.getNextChannelName();

            const urec = await User.findOne({ handle: u.handle });

            res = await ChannelServices.createChannel({
                name: name,
                reqUser: urec,
                description: lorem.generateParagraphs(1)
            });

            expect(res).to.be.an("object");
            expect(res).to.have.property('status');
            expect(res.status, res?.error?.message).to.equal(config.default_success_code);
        });

    });

    describe("deleteChannel Unit Tests", function(){
        
        it("Should fail if there is no channel with the given name", async function(){

            const name = UserDispatch.getNextChannelName();


            res = await ChannelServices.deleteChannel({name: name});

            expect(res).to.be.an("object");
            expect(res).to.have.property('status');
            expect(res.status).to.equal(config.default_client_error);
        });

        it('Should delete the channel if it exists', async function(){
            const u = UserDispatch.getNext();
            const description = lorem.generateParagraphs(1);

            const name = UserDispatch.getNextChannelName();


            await createChannel({
                name: name,
                ownerHandle: u.handle,
                description: description,
            })

            res = await ChannelServices.deleteChannel({ name: name });

            expect(res).to.be.an("object");
            expect(res).to.have.property('status');
            expect(res.status).to.equal(config.default_success_code);

            const check = await Channel.findOne({ name: name });

            expect(check).to.be.null
        });

        it("Should remove the channel from all users's joinedChannel", async function(){

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
                return await urec.save();
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

            res = await ChannelServices.deleteChannel({ name: name });

            expect(res).to.be.an("object");
            expect(res).to.have.property('status');
            expect(res.status).to.equal(config.default_success_code);

            await Promise.all(users.map(async u => {

                let urec = await User.findOne({ handle: u.handle });

                expect(urec.joinedChannels.some(id => id.equals(crec._id))).to.be.false;
                
            }))
        });
        
        it("Should remove the channel from all messages's destChannel", async function () {
            
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

            res = await ChannelServices.deleteChannel({ name: name });

            expect(res).to.be.an("object");
            expect(res).to.have.property('status');
            expect(res.status).to.equal(config.default_success_code);

            const check = await Message.find({ destChannel: crec._id });
            const check2 = await Message.find({ destChannel: crec2._id });

            expect(check).to.be.an('array').that.is.empty;
            expect(check2).to.be.an('array').that.is.not.empty;
        })

        it("Should delete all messages whose sole dest was the deleted channel", async function () {

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
                    [],
                    [name])
            }

            const bf = await Message.find({ destChannel: crec._id });

            expect(bf).to.be.an('array').that.is.not.empty;

            res = await ChannelServices.deleteChannel({ name: name });

            expect(res).to.be.an("object");
            expect(res).to.have.property('status');
            expect(res.status).to.equal(config.default_success_code);

            const check = await Message.find({ destChannel: crec._id });

            expect(check).to.be.an('array').that.is.empty;

            await Promise.all(bf.map(async m => {
                expect(await Message.findById(m._id)).to.be.null;
            }));
        });

    })

    describe("writeChannel Unit Tests", function(){

        it("Should fail if there is no channel with the given name", async function(){
            const name = UserDispatch.getNextChannelName();

            res = await ChannelServices.writeChannel({ name: name, newName: 'dcuisdhgfviwufhvpqehfva;' });

            expect(res).to.be.an("object");
            expect(res).to.have.property('status');
            expect(res.status).to.equal(config.default_client_error);
        });

        it("Should fail if no parameters are given", async function(){
            const name = UserDispatch.getNextChannelName();

            res = await ChannelServices.writeChannel({ name: name });

            expect(res).to.be.an("object");
            expect(res).to.have.property('status');
            expect(res.status).to.equal(config.default_client_error);
        });

        it("Should fail if the new name is already taken", async function(){
            const creator = UserDispatch.getNext();
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

            res = await ChannelServices.writeChannel({ name: name, newName: name2 });

            expect(res).to.be.an("object");
            expect(res).to.have.property('status');
            expect(res.status).to.equal(config.default_client_error);
        });

        it("Should fail if the new owner does not exist", async function(){
            const creator = UserDispatch.getNext();
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

            res = await ChannelServices.writeChannel({ 
                name: name, owner: creator.handle + 'kjfcbvwjfvnqjadcna' });

            expect(res).to.be.an("object");
            expect(res).to.have.property('status');
            expect(res.status).to.equal(config.default_client_error);
        });

        it("Should actually change the name if the new name is free", async function(){
            const creator = UserDispatch.getNext();
            const description = lorem.generateParagraphs(1);

            const name = UserDispatch.getNextChannelName();
            const name2 = UserDispatch.getNextChannelName();


            await createChannel({
                name: name,
                ownerHandle: creator.handle,
                description: description,
            })

            const rec = await Channel.findOne({ name: name })
            const rec2 = await Channel.findOne({ name: name2 })

            expect(rec).to.not.be.null;
            expect(rec2).to.be.null;

            res = await ChannelServices.writeChannel({
                name: name, newName: name2,
            });

            expect(res).to.be.an("object");
            expect(res).to.have.property('status');
            expect(res.status, res?.error?.message).to.equal(config.default_success_code);

            const check = await Channel.findOne({ name: name2 });
            const check2 = await Channel.findOne({ name: name });

            expect(check).to.not.be.null;
            expect(check._id.equals(rec._id)).to.be.true;
            expect(check2).to.be.null;
        });

        it("Should actually change the owner if it exists", async function () {
            
            const creator = UserDispatch.getNext();
            const newCreator = UserDispatch.getNext();
            const description = lorem.generateParagraphs(1);

            const name = UserDispatch.getNextChannelName();

            await createChannel({
                name: name,
                ownerHandle: creator.handle,
                description: description,
            })

            const rec = await Channel.findOne({ name: name })

            expect(rec).to.not.be.null;

            res = await ChannelServices.writeChannel({
                name: name, owner: newCreator.handle,
            });

            expect(res).to.be.an("object");
            expect(res).to.have.property('status');
            expect(res.status, res?.error?.message).to.equal(config.default_success_code);

            const check = await Channel.findOne({ name: name });
            const newOwnerRec = await User.findOne({ handle: newCreator.handle });

            expect(check).to.not.be.null;
            expect(newOwnerRec).to.not.be.null;
            expect(check.creator.equals(newOwnerRec._id)).to.be.true;
        });

        it("Should actually change the description", async function () {
            
            const creator = UserDispatch.getNext();
            const description = lorem.generateParagraphs(1);

            const newDescription = lorem.generateSentences(getRandom(10));

            expect(description).to.not.equal(newDescription);

            const name = UserDispatch.getNextChannelName();

            await createChannel({
                name: name,
                ownerHandle: creator.handle,
                description: description,
            })

            const rec = await Channel.findOne({ name: name })

            expect(rec).to.not.be.null;
            expect(rec).to.have.property('description');
            expect(rec.description).to.equal(description)

            res = await ChannelServices.writeChannel({
                name: name, description: newDescription,
            });

            expect(res).to.be.an("object");
            expect(res).to.have.property('status');
            expect(res.status, res?.error?.message).to.equal(config.default_success_code);

            const check = await Channel.findOne({ name: name });

            expect(check).to.not.be.null;
            expect(check).to.have.property('description');
            expect(check.description).to.equal(newDescription)
        });

        it("Should actually change the private field", async function () {

            const creator = UserDispatch.getNext();
            const description = lorem.generateParagraphs(1);

            const name = UserDispatch.getNextChannelName();

            await createChannel({
                name: name,
                ownerHandle: creator.handle,
                description: description,
            })

            const rec = await Channel.findOne({ name: name })

            expect(rec).to.not.be.null;
            expect(rec).to.have.property('privateChannel');
            expect(rec.privateChannel).to.be.false;

            res = await ChannelServices.writeChannel({
                name: name, privateChannel: true,
            });

            expect(res).to.be.an("object");
            expect(res).to.have.property('status');
            expect(res.status, res?.error?.message).to.equal(config.default_success_code);

            const check = await Channel.findOne({ name: name });

            expect(check).to.not.be.null;
            expect(check).to.have.property('privateChannel');
            expect(check.privateChannel).to.be.true;
        });
    })

    describe('checkAvailability Unit Tests', async function () {

        it("Should fail if no name is provided", async function () {
            const res = await ChannelServices.availableChannel({});

            expect(res).to.be.an('object');
            expect(res).to.have.property('status');
            expect(res.status).to.equal(config.default_client_error);
        });

        it("Should return available: true if name is available", async function () {
            const res = await ChannelServices.availableChannel({ name: UserDispatch.getNextChannelName() });

            expect(res).to.be.an('object');
            expect(res).to.have.property('status');
            expect(res.status).to.equal(config.default_success_code);

            expect(res).to.have.property('payload');
            expect(res.payload).to.be.an('object').that.has.property('available');
            expect(res.payload.available).to.be.true;
        })


        it("Should return available: false if name is taken", async function () {
            
            const name = UserDispatch.getNextChannelName();

            await createChannel({
                name: name,
                ownerHandle: UserDispatch.getNext().handle,
                description: lorem.generateParagraphs(1),
            })
            
            const res = await ChannelServices.availableChannel({ name: name });

            expect(res).to.be.an('object');
            expect(res).to.have.property('status');
            expect(res.status).to.equal(config.default_success_code);

            expect(res).to.have.property('payload');
            expect(res.payload).to.be.an('object').that.has.property('available');
            expect(res.payload.available).to.be.false;
        })

    });
});