const { expect } = require("chai");
const User = require("../models/User");
const dayjs = require('dayjs');
const config = require("../config");
const { logger } = require("../config/logging");
const { resetDaily, resetWeekly, resetMonthly, renewSubscriptions } = require("../config/crons");
const Message = require("../models/Message");
const _ = require('underscore');
const MessagesAggregate = require("../utils/MessagesAggregate");



describe('Messages Aggregate Tests', function(){

    describe('Dest Channel Members Tests', function(){

        it('Should create a dest_channel_members_docs field', async function(){
            this.timeout(30000);

            let aggr = new MessagesAggregate();
            aggr.lookupDestChannelMembers();

            let res = await aggr.run();

            expect(res).to.not.be.empty;
            res.map(m => {
                expect(m).to.be.an('object');
                expect(m).to.have.property('dest_channel_members_docs');
                expect(m.dest_channel_members_docs).to.be.an('array');

                m.dest_channel_members_docs.map(u => {
                    expect(u).to.be.an('object');
                    expect(u).to.have.property('_id');
                    expect(u).to.have.property('handle');
                    expect(u.handle).to.be.a('string');
                });
                if (m.destChannel.length) 
                    expect(m.dest_channel_members_docs.length).to.be.greaterThan(m.destChannel.length - 1);

            })

        });

        it('Should contain at least a message with a non-empty destChannel', async function(){
            this.timeout(30000);
            
            let aggr = new MessagesAggregate();
            aggr.lookupDestChannel();
            aggr.lookupDestChannelMembers();

            let res = await aggr.run();

            expect(res.some(m => m.destChannel.length > 0)).to.be.true;
        })

    });

    describe('Dest Channel Tests', function(){
        it('Should Retrieve a channel document for each id in destChannel', async function(){
            
            this.timeout(30000);

            let aggr = new MessagesAggregate();

            aggr.lookupDestChannel();

            let res = await aggr.run();

            res.map(m => {
                expect(m).to.be.an('object');
                expect(m).to.have.property('destChannel_docs');
                expect(m.destChannel_docs).to.be.an('array');
                expect(m.destChannel_docs.length).to.equal(m.destChannel.length);
                
                m.destChannel_docs.map(c => {
                    expect(c).to.be.an('object');
                    expect(c).to.have.property('_id');
                    expect(c).to.have.property('name');
                    expect(c.name).to.be.a('string');
                })

                m.destChannel.map(cid => 
                    expect(m.destChannel_docs.some(c => cid.equals(c._id))).to.be.true);
            })
        });
    });

    describe('Dest Users Tests', function () {
        it('Should Retrieve a user document for each id in destUser', async function () {

            this.timeout(30000);

            let aggr = new MessagesAggregate();

            aggr.lookupDestUser();

            let res = await aggr.run();

            expect(res).to.not.be.empty;
            res.map(m => {
                expect(m).to.be.an('object');
                expect(m).to.have.property('destUser_docs');
                expect(m.destUser_docs).to.be.an('array');
                expect(m.destUser_docs.length).to.equal(m.destUser.length);

                m.destUser_docs.map(u => {
                    expect(u).to.be.an('object');
                    expect(u).to.have.property('_id');
                    expect(u).to.have.property('handle');
                    expect(u.handle).to.be.a('string');
                })

                m.destUser.map(cid => {
                    expect(m.destUser_docs.some(c => cid.equals(c._id))).to.be.true
                });
            })
        });
    });

    describe('Answering Tests', function () {
        it('Should retrive the answering document correctly', async function () {

            this.timeout(30000);

            let aggr = new MessagesAggregate();

            aggr.lookupAnsweringWithAuthor();

            let res = await aggr.run();

            expect(res).to.not.be.empty
            res.map(m => {
                expect(m).to.be.an('object');
                if (m.answering) {
                    expect(m).to.have.property('answering_doc');
                    
                    expect(m.answering_doc).to.be.an('object');
                    expect(m.answering_doc).to.have.property('_id');
                    expect(m.answering_doc._id.equals(m.answering)).to.be.true;
                }
            })
        });

        it('Should retrive the answer\'s author correctly', async function () {

            this.timeout(30000);

            let aggr = new MessagesAggregate();

            aggr.lookupAnsweringWithAuthor();

            let res = await aggr.run();
            expect(res).to.not.be.empty

            res.map(m => {
                expect(m).to.be.an('object');
                if (m.answering) {
                    expect(m).to.have.property('answering_author_doc');
                    expect(m).to.have.property('answering_doc');
    
                    expect(m.answering_doc).to.be.an('object');
                    expect(m.answering_doc).to.have.property('_id');
    
                    expect(m.answering_author_doc).to.be.an('object');
                    expect(m.answering_author_doc).to.have.property('_id');
                    expect(m.answering_author_doc).to.have.property('handle');
                    expect(m.answering_author_doc, JSON.stringify(m.answering_author_doc)).to.have.property('smm');
    
                    expect(m.answering_author_doc.handle).to.be.a('string');
    
                    expect(m.answering_author_doc._id.equals(m.answering_doc.author)).to.be.true;
                }
            })
        });

        it('Should retrive the answer\'s author\'s smm correctly', async function () {

            this.timeout(30000);

            let aggr = new MessagesAggregate();

            aggr.lookupAnsweringWithAuthor();

            let res = await aggr.run();
            expect(res).to.not.be.empty

            res.map(m => {
                expect(m).to.be.an('object');
                if (m.answering) {
                    expect(m).to.have.property('answering_author_doc');
    
                    expect(m.answering_author_doc).to.be.an('object');
                    expect(m.answering_author_doc).to.have.property('_id');
                    expect(m.answering_author_doc).to.have.property('handle');
    
                    if (m.answering_author_doc.smm) {
                        expect(m).to.have.property('answering_author_smm_doc');

                        expect(m.answering_author_smm_doc).to.be.an('object');
                        expect(m.answering_author_smm_doc).to.have.property('_id');
                        expect(m.answering_author_smm_doc).to.have.property('handle');
                        expect(m.answering_author_smm_doc._id.equals(m.answering_author_doc.smm)).to.be.true;
                    }
                }

            })
        });
    });

    describe('Author Tests', function() {
        it('Should retrieve the message\'s author document', async function(){
            this.timeout(30000);
            
            let aggr = new MessagesAggregate();
            aggr.lookupAuthor();

            let res = await aggr.run();

            expect(res).to.be.an('array');
            expect(res).to.not.be.empty;

            res.map(m => {
                expect(m).to.be.an('object');
                expect(m).to.have.property('author_doc');
                expect(m.author_doc).to.be.an('object');
                expect(m.author_doc).to.have.property('handle');
                expect(m.author_doc).to.have.property('_id');
                expect(m.author_doc.handle).to.be.a('string');
            })
        });

        it('Should retrive the message\'s author\'s smm', async function(){
            this.timeout(30000)
            
            let aggr = new MessagesAggregate();
            
            aggr.lookupAuthor();
            aggr.lookupAuthorSmm();

            let res = await aggr.run();

            expect(res).to.be.an('array');
            expect(res).to.not.be.empty;
            res.map(m => {
                expect(m).to.be.an('object');
                expect(m).to.have.property('author_doc');
                if (m.author_doc.smm) {
                    expect(m).to.have.property('author_smm_doc');
                    expect(m.author_smm_doc).to.be.an('object');
                    expect(m.author_smm_doc).to.have.property('handle');
                    expect(m.author_smm_doc).to.have.property('_id');
                    expect(m.author_smm_doc.handle).to.be.a('string');
                    expect(m.author_smm_doc._id.equals(m.author_doc.smm)).to.be.true;
                }
            })
        });

        it('Should retrive the correct author', async function(){
            this.timeout(30000);

            let aggr = new MessagesAggregate();
            aggr.lookupAuthor();

            let res = await aggr.run();

            expect(res).to.be.an('array');
            expect(res).to.not.be.empty;

            res.map(m => {
                expect(m.author_doc._id.equals(m.author)).to.be.true;
            })
        });

        it('Should return at least one message where the author has an smmm', async function(){
            this.timeout(30000)

            let aggr = new MessagesAggregate();

            aggr.lookupAuthor();
            aggr.lookupAuthorSmm();

            let res = await aggr.run();

            expect(res).to.be.an('array');
            expect(res).to.not.be.empty;
            expect(
                res.some(m => m.author_doc.smm)
            ).to.be.true;
        })
    })

    describe("Generic Tests", function () {
        it("Should return all messages with page 0", async function () {
            this.timeout(30000)
            let aggr = new MessagesAggregate();
            //aggr.lookup();
            //aggr.countAndSlice(0, 100);

            let res = await aggr.run();

            let messages = await Message.find();

            expect(res.length).to.equal(messages.length);
        })

        it("Should return all messages with page 0 and lookup", async function () {
            this.timeout(30000)

            let aggr = new MessagesAggregate();
            aggr.lookup();
            //aggr.countAndSlice(0, 100);

            let res = await aggr.run();

            let messages = await Message.find();

            expect(res.length).to.equal(messages.length);
        })

        it("Should return all messages with page 0, lookup and counting", async function () {
            this.timeout(30000)

            let aggr = new MessagesAggregate();
            aggr.lookup();
            aggr.countAndSlice(0, 100);

            let res = MessagesAggregate.parsePaginatedResults(await aggr.run(), 0, 100);

            let messages = await Message.find();

            expect(res.results.length).to.equal(messages.length);
            expect(res.pages).to.equal(1);
        })

        it.only("Should work properly and not explode", async function () {
            this.timeout(30000)

            let aggr = new MessagesAggregate();
            aggr.lookup();
            aggr.countAndSlice(1, 10);

            let res = MessagesAggregate.parsePaginatedResults(await aggr.run(), 1, 10);

            expect(res.results.length).to.be.lessThan(11);
            expect(res.pages).to.not.be.null;
            expect(res.pages).to.be.a('number');
            expect(res.pages).to.be.greaterThan(0);
        })
    })


})