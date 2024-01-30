const { expect } = require("chai");
const User = require("../models/User");
const dayjs = require('dayjs');
const config = require("../config");
const { logger } = require("../config/logging");
const { resetDaily, resetWeekly, resetMonthly, renewSubscriptions } = require("../config/crons");
const Message = require("../models/Message");
const _ = require('underscore');
const ChannelsAggregate = require("../utils/ChannelsAggregate");



describe('Channels Aggregate Tests', function () {

    describe('Lookup Member Tests', function(){
        it("Should create a member_docs field", async function(){
            let aggr = new ChannelsAggregate();
            aggr.lookupMembers();

            let res = await aggr.run();

            expect(res).to.be.an('array');
            expect(res).to.not.be.empty;

            res.map(c => {
                expect(c).to.be.an('object');
                expect(c).to.have.property('member_docs');
                expect(c.member_docs).to.be.an('array');
                expect(c.member_docs).to.not.be.empty;

                c.member_docs.map(u => {
                    expect(u).to.be.an('object');
                    expect(u).to.have.property('handle');
                    expect(u).to.have.property('_id');
                    expect(u.handle).to.be.a('string');
                })
            })
        })

        it("Should contain the creator in the member_docs field", async function () {
            let aggr = new ChannelsAggregate();
            aggr.lookupMembers();

            let res = await aggr.run();

            expect(res).to.be.an('array');
            expect(res).to.not.be.empty;

            res.map(c => {
                expect(c.member_docs.some(u => u._id.equals(c.creator))).to.be.true;
            })
        })

        it("Should contain the appropriate users", async function () {
            let aggr = new ChannelsAggregate();
            aggr.lookupMembers();

            let res = await aggr.run();

            expect(res).to.be.an('array');
            expect(res).to.not.be.empty;

            await Promise.all(res.map(async c => {

                let users = await User.find({ joinedChannels: c._id });

                users.map(u => 
                    expect(c.member_docs.some(us => us._id.equals(u._id))).to.be.true)

                expect(users.length).to.equal(c.member_docs.length);
                
            }))
        })
    })
    
    describe('Lookup Editors Tests', function () {
        it("Should create a editor_docs field", async function () {
            let aggr = new ChannelsAggregate();
            aggr.lookupEditors();

            let res = await aggr.run();

            expect(res).to.be.an('array');
            expect(res).to.not.be.empty;

            res.map(c => {
                expect(c).to.be.an('object');
                expect(c).to.have.property('editor_docs');
                expect(c.editor_docs).to.be.an('array');
                expect(c.editor_docs).to.not.be.empty;

                c.editor_docs.map(u => {
                    expect(u).to.be.an('object');
                    expect(u).to.have.property('handle');
                    expect(u).to.have.property('_id');
                    expect(u.handle).to.be.a('string');
                })
            })
        })

        it("Should contain the creator in the editor_docs field", async function () {
            let aggr = new ChannelsAggregate();
            aggr.lookupEditors();

            let res = await aggr.run();

            expect(res).to.be.an('array');
            expect(res).to.not.be.empty;

            res.map(c => {
                expect(c.editor_docs.some(u => u._id.equals(c.creator))).to.be.true;
            })
        })

        it("Should contain the appropriate users", async function () {
            let aggr = new ChannelsAggregate();
            aggr.lookupEditors();

            let res = await aggr.run();

            expect(res).to.be.an('array');
            expect(res).to.not.be.empty;

            await Promise.all(res.map(async c => {

                let users = await User.find({ editorChannels: c._id });

                users.map(u =>
                    expect(c.editor_docs.some(us => us._id.equals(u._id))).to.be.true)

                expect(users.length).to.equal(c.editor_docs.length);

            }))
        })
    })

    describe('Lookup Member Requests Tests', function () {
        it("Should create a member_request_docs field", async function () {
            let aggr = new ChannelsAggregate();
            aggr.lookupMemberRequests();

            let res = await aggr.run();

            expect(res).to.be.an('array');
            expect(res).to.not.be.empty;

            res.map(c => {
                expect(c).to.be.an('object');
                expect(c).to.have.property('member_request_docs');
                expect(c.member_request_docs).to.be.an('array');

                c.member_request_docs.map(u => {
                    expect(u).to.be.an('object');
                    expect(u).to.have.property('handle');
                    expect(u).to.have.property('_id');
                    expect(u.handle).to.be.a('string');
                })
            })
        })

        it("Should contain the appropriate users", async function () {
            let aggr = new ChannelsAggregate();
            aggr.lookupMemberRequests();

            let res = await aggr.run();

            expect(res).to.be.an('array');
            expect(res).to.not.be.empty;

            await Promise.all(res.map(async c => {

                let users = await User.find({ joinChannelRequests: c._id });

                users.map(u =>
                    expect(c.member_request_docs.some(us => us._id.equals(u._id))).to.be.true)

                expect(users.length).to.equal(c.member_request_docs.length);

            }))
        })
    })

    describe('Lookup Editor Requests Tests', function () {
        it("Should create a editor_requests_docs field", async function () {
            let aggr = new ChannelsAggregate();
            aggr.lookupEditorRequests();

            let res = await aggr.run();

            expect(res).to.be.an('array');
            expect(res).to.not.be.empty;

            res.map(c => {
                expect(c).to.be.an('object');
                expect(c).to.have.property('editor_request_docs');
                expect(c.editor_request_docs).to.be.an('array');

                c.editor_request_docs.map(u => {
                    expect(u).to.be.an('object');
                    expect(u).to.have.property('handle');
                    expect(u).to.have.property('_id');
                    expect(u.handle).to.be.a('string');
                })
            })
        })

        it("Should contain the appropriate users", async function () {
            let aggr = new ChannelsAggregate();
            aggr.lookupEditorRequests();

            let res = await aggr.run();

            expect(res).to.be.an('array');
            expect(res).to.not.be.empty;

            await Promise.all(res.map(async c => {

                let users = await User.find({ editorChannelRequests: c._id });

                users.map(u =>
                    expect(c.editor_request_docs.some(us => us._id.equals(u._id))).to.be.true)

                expect(users.length).to.equal(c.editor_request_docs.length);

            }))
        })
    })

    describe("Lookup Creator Tests", function(){
        it("Should create a creator_doc field", async function(){
            let aggr = new ChannelsAggregate();
            aggr.lookupCreator();

            let res = await aggr.run();

            expect(res).to.be.an('array');
            expect(res).to.not.be.empty;

            res.map(c => {
                expect(c).to.be.an('object');
                expect(c).to.have.property('creator_doc');

                expect(c.creator_doc).to.be.an('object');
                expect(c.creator_doc).to.have.property('handle');
                expect(c.creator_doc).to.have.property('_id');
                expect(c.creator_doc.handle).to.be.a('string');
            })
        });

        it("Should find the correct document", async function () {
            let aggr = new ChannelsAggregate();
            aggr.lookupCreator();

            let res = await aggr.run();

            expect(res).to.be.an('array');
            expect(res).to.not.be.empty;

            res.map(c => {
                expect(c.creator_doc._id.equals(c.creator)).to.be.true;
            })
        });
    })

    describe("Match Tests", function(){
        describe("official tests", function(){
            it("Should only return official channels", async function(){
                let aggr = new ChannelsAggregate();
                aggr.matchFields({ official: true });

                let res = await aggr.run();

                expect(res).to.be.an('array');
                expect(res).to.not.be.empty;

                res.map(c => {
                    expect(c).to.be.an('object');
                    expect(c).to.have.property('official');
                    expect(c.official).to.be.a('boolean');
                    expect(c.official).to.be.true;
                })
            })

            it("Should only return non-official channels", async function () {
                let aggr = new ChannelsAggregate();
                aggr.matchFields({ official: false });

                let res = await aggr.run();

                expect(res).to.be.an('array');
                expect(res).to.not.be.empty;

                res.map(c => {
                    expect(c).to.be.an('object');
                    expect(c).to.have.property('official');
                    expect(c.official).to.be.a('boolean');
                    expect(c.official).to.be.false;
                })
            })
        })

        describe("publicChannel tests", function () {
            it("Should only return public channels", async function () {
                let aggr = new ChannelsAggregate();
                aggr.matchFields({ publicChannel: true });

                let res = await aggr.run();

                expect(res).to.be.an('array');
                expect(res).to.not.be.empty;

                res.map(c => {
                    expect(c).to.be.an('object');
                    expect(c).to.have.property('publicChannel');
                    expect(c.publicChannel).to.be.a('boolean');
                    expect(c.publicChannel).to.be.true;
                })
            })

            it("Should only return private channels", async function () {
                let aggr = new ChannelsAggregate();
                aggr.matchFields({ publicChannel: false });

                let res = await aggr.run();

                expect(res).to.be.an('array');
                expect(res).to.not.be.empty;

                res.map(c => {
                    expect(c).to.be.an('object');
                    expect(c).to.have.property('publicChannel');
                    expect(c.publicChannel).to.be.a('boolean');
                    expect(c.publicChannel).to.be.false;
                })
            })
        })

        describe("name tests", function () {
            it("Should only return channels containing the given name", async function () {
                let aggr = new ChannelsAggregate();
                aggr.matchFields({ name: 'test' });

                let res = await aggr.run();

                expect(res).to.be.an('array');
                expect(res).to.not.be.empty;

                res.map(c => {
                    expect(c).to.be.an('object');
                    expect(c).to.have.property('name');
                    expect(c.name).to.be.a('string');
                    expect(c.name.toLowerCase().includes('test'), c.name).to.be.true;
                })
            })
        })

        describe("member tests", function(){
            it("Should only return channels with the given member", async function(){
                let aggr = new ChannelsAggregate();
                aggr.lookupMembers();
                aggr.matchFields({ member: 'fv' });

                let res = await aggr.run();

                expect(res).to.be.an('array');
                expect(res).to.not.be.empty;

                res.map(c => {
                    expect(c.member_docs.some(u => u.handle === 'fv')).to.be.true;
                })
            })
        })

        describe("owner tests", function(){
            it("Should only return channels owned by the given user", async function () {
                let aggr = new ChannelsAggregate();
                aggr.lookupCreator();
                aggr.matchFields({ owner: 'fv' });

                let res = await aggr.run();

                expect(res).to.be.an('array');
                expect(res).to.not.be.empty;

                res.map(c => {
                    expect(c.creator_doc.handle).to.equal('fv');
                })
            })
        })
    })
})