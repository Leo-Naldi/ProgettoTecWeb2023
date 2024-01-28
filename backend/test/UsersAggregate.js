const { expect } = require("chai");
const User = require("../models/User");
const dayjs = require('dayjs');
const config = require("../config");
const { logger } = require("../config/logging");
const { resetDaily, resetWeekly, resetMonthly, renewSubscriptions } = require("../config/crons");
const MessagesAggregate = require('../utils/MessagesAggregate');
const Message = require("../models/Message");
const _ = require('underscore');
const UsersAggregate = require("../utils/UsersAggregate");
const Reaction = require("../models/Reactions");



describe.only('Users Aggregate Tests', function(){

    describe('Editor Channel Tests', function(){

        it('Should create a editorChannels_docs field', async function(){
            this.timeout(30000);

            let aggr = new UsersAggregate();
            aggr.lookupEditorChannels();

            let res = await aggr.run();

            expect(res).to.be.an('array');
            expect(res).to.not.be.empty;
            res.map(m => {
                expect(m).to.be.an('object');
                expect(m).to.have.property('editorChannels_docs');
                expect(m.editorChannels_docs).to.be.an('array');

                m.editorChannels_docs.map(u => {
                    expect(u).to.be.an('object');
                    expect(u).to.have.property('_id');
                    expect(u).to.have.property('name');
                    expect(u.name).to.be.a('string');
                });
            })

        });

        it('Should retrive all the relevant channels', async function(){
            this.timeout(30000);
            
            let aggr = new UsersAggregate();
            aggr.lookupEditorChannels();

            let res = await aggr.run();

            expect(res).to.not.be.empty;

            res.map(u => {
                expect(u.editorChannels.length).to.equal(u.editorChannels_docs.length);

                u.editorChannels.map(cid => expect(u.editorChannels_docs.some(c => c._id.equals(cid))).to.be.true)
            })
        })

    });

    describe('Joined Channel Tests', function () {

        it('Should create a joinedChannels_docs field', async function () {
            this.timeout(30000);

            let aggr = new UsersAggregate();
            aggr.lookupJoinedChannels();

            let res = await aggr.run();

            expect(res).to.be.an('array');
            expect(res).to.not.be.empty;
            res.map(m => {
                expect(m).to.be.an('object');
                expect(m).to.have.property('joinedChannels_docs');
                expect(m.joinedChannels_docs).to.be.an('array');

                m.joinedChannels_docs.map(u => {
                    expect(u).to.be.an('object');
                    expect(u).to.have.property('_id');
                    expect(u).to.have.property('name');
                    expect(u.name).to.be.a('string');
                });
            })

        });

        it('Should retrive all the relevant channels', async function () {
            this.timeout(30000);

            let aggr = new UsersAggregate();
            aggr.lookupJoinedChannels();

            let res = await aggr.run();

            expect(res).to.not.be.empty;

            res.map(u => {
                expect(u.joinedChannels.length).to.equal(u.joinedChannels_docs.length);

                u.joinedChannels.map(cid => expect(u.joinedChannels_docs.some(c => c._id.equals(cid))).to.be.true)
            })
        })

    });

    describe('Editor Channel Requests Tests', function () {

        it('Should create a editorChannelRequests_docs field', async function () {
            this.timeout(30000);

            let aggr = new UsersAggregate();
            aggr.lookupEditorChannelRequests();

            let res = await aggr.run();

            expect(res).to.be.an('array');
            expect(res).to.not.be.empty;
            res.map(m => {
                expect(m).to.be.an('object');
                expect(m).to.have.property('editorChannelRequests_docs');
                expect(m.editorChannelRequests_docs).to.be.an('array');

                m.editorChannelRequests_docs.map(u => {
                    expect(u).to.be.an('object');
                    expect(u).to.have.property('_id');
                    expect(u).to.have.property('name');
                    expect(u.name).to.be.a('string');
                });
            })

        });

        it('Should retrive all the relevant channels', async function () {
            this.timeout(30000);

            let aggr = new UsersAggregate();
            aggr.lookupEditorChannelRequests();

            let res = await aggr.run();

            expect(res).to.not.be.empty;

            res.map(u => {
                expect(u.editorChannelRequests.length).to.equal(u.editorChannelRequests_docs.length);

                u.editorChannelRequests.map(cid => expect(u.editorChannelRequests_docs.some(c => c._id.equals(cid))).to.be.true)
            })
        })

    });

    describe('Join Channel Requests Tests', function () {

        it('Should create a joinChannelsRequests_docs field', async function () {
            this.timeout(30000);

            let aggr = new UsersAggregate();
            aggr.lookupJoinedChannelRequests();

            let res = await aggr.run();

            expect(res).to.be.an('array');
            expect(res).to.not.be.empty;
            res.map(m => {
                expect(m).to.be.an('object');
                expect(m).to.have.property('joinChannelRequests_docs');
                expect(m.joinChannelRequests_docs).to.be.an('array');

                m.joinChannelRequests_docs.map(u => {
                    expect(u).to.be.an('object');
                    expect(u).to.have.property('_id');
                    expect(u).to.have.property('name');
                    expect(u.name).to.be.a('string');
                });
            })

        });

        it('Should retrive all the relevant channels', async function () {
            this.timeout(30000);

            let aggr = new UsersAggregate();
            aggr.lookupJoinedChannelRequests();

            let res = await aggr.run();

            expect(res).to.not.be.empty;

            res.map(u => {
                expect(u.joinChannelRequests.length).to.equal(u.joinChannelRequests_docs.length);

                u.joinChannelRequests.map(cid => expect(u.joinChannelRequests_docs.some(c => c._id.equals(cid))).to.be.true)
            })
        })

    });

    describe('Smm Tests', function(){
        it("Should create an smm_doc field", async function(){
            let aggr = new UsersAggregate();
            aggr.lookupSmm();

            let res = await aggr.run();


            expect(res).to.be.an('array');
            expect(res).to.not.be.empty;
            res.map(m => {
                expect(m).to.be.an('object');
                expect(m).to.have.property('smm_doc');
                expect(m.smm_doc).to.be.an('object');

                expect(m.smm_doc).to.have.property('_id');
                expect(m.smm_doc).to.have.property('handle');
                expect(m.smm_doc.handle).to.be.a('string');
            })
        })

        it("Should retrive the correct user", async function(){
            let aggr = new UsersAggregate();
            aggr.lookupSmm();

            let res = await aggr.run();

            expect(res).to.be.an('array');
            expect(res).to.not.be.empty;
            res.map(m => {
                expect(m).to.be.an('object');
                expect(m).to.have.property('smm_doc');
                expect(m.smm_doc).to.be.an('object');

                expect(m.smm_doc).to.have.property('_id');
                expect(m.smm_doc._id.equals(m.smm)).to.be.true;
            })
        })
    })

    describe('Managed Tests', function () {
        it("Should create an managed_docs field", async function () {
            let aggr = new UsersAggregate();
            aggr.lookupManaged();

            let res = await aggr.run();


            expect(res).to.be.an('array');
            expect(res).to.not.be.empty;
            res.map(m => {
                expect(m).to.be.an('object');
                expect(m).to.have.property('managed_docs');
                expect(m.managed_docs).to.be.an('array');

                m.managed_docs.map(u => {
                    expect(u).to.have.property('_id');
                    expect(u).to.have.property('handle');
                    expect(u.handle).to.be.a('string');
                })

            })
        })

        it("Should retrive the correct user", async function () {
            let aggr = new UsersAggregate();
            aggr.lookupManaged();

            let res = await aggr.run();

            expect(res).to.be.an('array');
            expect(res).to.not.be.empty;
            res.map(m => {
                expect(m).to.be.an('object');
                expect(m).to.have.property('managed_docs');
                expect(m.managed_docs).to.be.an('array');

                m.managed_docs.map(u => {
                    expect(m._id.equals(u.smm)).to.be.true;
                })

            })
        })
    })

    describe('Liked Tests', function () {
        it("Should create a liked_docs field", async function () {
            let aggr = new UsersAggregate();
            aggr.lookupLiked();

            let res = await aggr.run();


            expect(res).to.be.an('array');
            expect(res).to.not.be.empty;
            res.map(m => {
                expect(m).to.be.an('object');
                expect(m).to.have.property('liked_docs');
                expect(m.liked_docs).to.be.an('array');

                m.liked_docs.map(u => {
                    expect(u).to.have.property('message');
                })

            })
        })

        it("Should retrive the correct messages", async function () {
            let aggr = new UsersAggregate();
            aggr.lookupLiked();

            let res = await aggr.run();

            expect(res).to.be.an('array');
            expect(res).to.not.be.empty;
            await Promise.all(res.map(async u => {
                
                let messages = await Reaction.find({ user: u._id, type: 'positive' });

                u.liked_docs.map(l => 
                    expect(messages.some(m => m.message.equals(l.message))).to.be.true);

                expect(messages.length).to.equal(u.liked_docs.length)
            }))
        })
    })

    describe('Disliked Tests', function () {
        it("Should create a disliked_docs field", async function () {
            let aggr = new UsersAggregate();
            aggr.lookupDisiked();

            let res = await aggr.run();


            expect(res).to.be.an('array');
            expect(res).to.not.be.empty;
            res.map(m => {
                expect(m).to.be.an('object');
                expect(m).to.have.property('disliked_docs');
                expect(m.disliked_docs).to.be.an('array');

                m.disliked_docs.map(u => {
                    expect(u).to.have.property('message');
                })

            })
        })

        it("Should retrive the correct messages", async function () {
            let aggr = new UsersAggregate();
            aggr.lookupDisiked();

            let res = await aggr.run();

            expect(res).to.be.an('array');
            expect(res).to.not.be.empty;
            await Promise.all(res.map(async u => {

                let messages = await Reaction.find({ user: u._id, type: 'negative' });

                u.disliked_docs.map(l =>
                    expect(messages.some(m => m.message.equals(l.message))).to.be.true);

                expect(messages.length).to.equal(u.disliked_docs.length)
            }))
        })
    })

    describe("Match filters tests", function(){
        it("Should return users whose name contains the given handle", async function(){
            let aggr = new UsersAggregate();
            aggr.matchFields({ handle: 'fv' });

            let res = await aggr.run();
            expect(res).to.be.an('array');
            expect(res).to.not.be.empty;
            res.map(m => {
                expect(m).to.be.an('object');
                expect(m).to.have.property('handle');
                expect(m.handle).to.be.an('string');

                expect(m.handle.includes('fv')).to.be.true;

            })
        })

        it("Should return pro users only", async function () {
            let aggr = new UsersAggregate();
            aggr.matchFields({ accountType: 'pro' });

            let res = await aggr.run();
            expect(res).to.be.an('array');
            expect(res).to.not.be.empty;
            res.map(m => {
                expect(m).to.be.an('object');
                expect(m).to.have.property('accountType');
                expect(m.accountType).to.be.an('string');

                expect(m.accountType).to.equal('pro');

            })
        })

        it("Should return users only", async function () {
            let aggr = new UsersAggregate();
            aggr.matchFields({ accountType: 'user' });

            let res = await aggr.run();
            expect(res).to.be.an('array');
            expect(res).to.not.be.empty;
            res.map(m => {
                expect(m).to.be.an('object');
                expect(m).to.have.property('accountType');
                expect(m.accountType).to.be.an('string');

                expect(m.accountType).to.equal('user');

            })
        })

        it("Should return admins only", async function () {
            let aggr = new UsersAggregate();
            aggr.matchFields({ admin: true });

            let res = await aggr.run();
            expect(res).to.be.an('array');
            expect(res).to.not.be.empty;
            res.map(m => {
                expect(m).to.be.an('object');
                expect(m).to.have.property('admin');
                expect(m.admin).to.be.an('boolean');

                expect(m.admin).to.be.true;

            })
        })

        it("Should return non admins only", async function () {
            let aggr = new UsersAggregate();
            aggr.matchFields({ admin: false });

            let res = await aggr.run();
            expect(res).to.be.an('array');
            expect(res).to.not.be.empty;
            res.map(m => {
                expect(m).to.be.an('object');
                expect(m).to.have.property('admin');
                expect(m.admin).to.be.an('boolean');

                expect(m.admin).to.be.false;

            })
        })
    })


    describe("Get Reaction Counts Tests", function(){
        it("Should create a positive_count field", async function(){
            let aggr = new UsersAggregate();
            aggr.lookupReactionCounts();

            let res = await aggr.run();
            expect(res).to.be.an('array');
            expect(res).to.not.be.empty;
            res.map(m => {
                expect(m).to.be.an('object');
                expect(m).to.have.property('positive_count');
                expect(m.positive_count).to.be.a('number');
                expect(m.positive_count).to.greaterThan(0);
            })
        })

        it("Should create a negative_count field", async function () {
            let aggr = new UsersAggregate();
            aggr.lookupReactionCounts();

            let res = await aggr.run();
            expect(res).to.be.an('array');
            expect(res).to.not.be.empty;
            res.map(m => {
                expect(m).to.be.an('object');
                expect(m).to.have.property('negative_count');
                expect(m.negative_count).to.be.a('number');
                expect(m.negative_count).to.greaterThan(0);
            })
        })

        it("Should return the correct number of likes", async function () {
            this.timeout(30000)

            let aggr = new UsersAggregate();
            aggr.lookupReactionCounts();

            let res = await aggr.run();
            expect(res).to.be.an('array');
            expect(res).to.not.be.empty;
            await Promise.all(res.map(async m => {

                let messages = await Message.find({ author: m._id })

                if (m.positive_count > 0) expect(messages).to.not.be.empty;

                let tot = messages.reduce((acc, val) => acc + val.reactions.positive, 0);

                expect(m.positive_count).to.equal(tot);
            }))
        })

        it("Should return the correct number of dislikes", async function () {
            this.timeout(30000)
            let aggr = new UsersAggregate();
            aggr.lookupReactionCounts();

            let res = await aggr.run();
            expect(res).to.be.an('array');
            expect(res).to.not.be.empty;
            await Promise.all(res.map(async m => {

                let messages = await Message.find({ author: m._id })

                if (m.positive_count > 0) expect(messages).to.not.be.empty;

                let tot = messages.reduce((acc, val) => acc + val.reactions.negative, 0);

                expect(m.negative_count).to.equal(tot);
            }))
        })
    })

})