let expect = require('chai').expect;

const ValidationError = require('mongoose').Error.ValidationError;

const User = require('../models/User');
const { testUser } = require('./hooks');


describe('User Model Unit Tests', function(){
    
    describe('Default values test', function(){
        
        let def_test_user, def_test_user2;

        before(function(){
            def_test_user = new User({
                handle: 'testuser123',
                email: 'mail@mail.com',
                password: 'abc123456',
            })
            def_test_user2 = new User();
        });


        it('Should correctly initialize with default values', function(){
            
            expect(def_test_user).to.have.property('_id');
            expect(def_test_user).to.have.property('username');
            expect(def_test_user).to.have.property('blocked');
            expect(def_test_user).to.have.property('accountType');
            expect(def_test_user).to.have.property('charLeft');
            expect(def_test_user).to.have.property('meta');
            expect(def_test_user.charLeft).to.have.property('day');
            expect(def_test_user.charLeft).to.have.property('week');
            expect(def_test_user.charLeft).to.have.property('month');
            expect(def_test_user.meta).to.have.property('created');

        });

        it('Should not add _id fields to non-ref subdocuments', function(){

            expect(def_test_user.charLeft).to.not.have.property('_id');
            expect(def_test_user.meta).to.not.have.property('_id');

        });

        it('Should validate on default values', function(){
            const err = def_test_user.validateSync();

            expect(err).to.be.undefined;
        })

        it('Should not validate on wrong values', async function(){
            
            let save_err = null;
            try {
                await def_test_user2.save()
            } catch (err) {
                save_err = err;
            }
            
            expect(save_err).to.not.be.null;
            expect(save_err).to.be.instanceOf(ValidationError);
        })
    })

    describe('Social Media Manager Coherency Tests', function(){

        it('Should add the user to the managed list when setting its smm', async function (){
            const user1 = await User.findOne({ handle: testUser(11).handle });
            const user2 = await User.findOne({ handle: testUser(12).handle });
            const user3 = await User.findOne({ handle: testUser(13).handle });

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
            const user1 = await User.findOne({ handle: testUser(14).handle });
            const user2 = await User.findOne({ handle: testUser(15).handle });
            const user3 = await User.findOne({ handle: testUser(16).handle });

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