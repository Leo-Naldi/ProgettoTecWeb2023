let expect = require('chai').expect;

const ValidationError = require('mongoose').Error.ValidationError;

const User = require('../models/User');
const { testUser, UserDispatch } = require('./hooks');


describe('User Model Unit Tests', function(){

    describe('Social Media Manager Coherency Tests', function(){

        it('Should add the user to the managed list when setting its smm', async function (){
            const user1 = await User.findOne({ handle: UserDispatch.getNext().handle });
            const user2 = await User.findOne({ handle: UserDispatch.getNext().handle });
            const user3 = await User.findOne({ handle: UserDispatch.getNext().handle });

            expect(user1).to.not.be.null;
            expect(user2).to.not.be.null;
            expect(user3).to.not.be.null;

            user2.smm = user1._id;
            user3.smm = user1._id;
            await user2.save();
            await user3.save();

            const managed = await User.findManaged(user1._id);

            expect(managed).to.be.an('array').that.is.not.empty;
            expect(managed).to.have.a.lengthOf(2);

            expect([user2.id, user3.id]).to.have.members(managed.map(m => m.id))
        });

        it('Should unset all of the users smm field when the smm user is deleted', async function(){
            const user1 = await User.findOne({ handle: UserDispatch.getNext().handle });
            const user2 = await User.findOne({ handle: UserDispatch.getNext().handle });
            const user3 = await User.findOne({ handle: UserDispatch.getNext().handle });

            expect(user1).to.not.be.null;
            expect(user2).to.not.be.null;
            expect(user3).to.not.be.null;

            user2.smm = user1._id;
            user3.smm = user1._id;
            await user2.save();
            await user3.save();

            await user1.deleteOne()

            const u = await User.findOne({ handle: user2.handle });
            const u2 = await User.findOne({ handle: user3.handle });

            expect(u.smm).to.be.null;
            expect(u2.smm).to.be.null;
        });
    })
})