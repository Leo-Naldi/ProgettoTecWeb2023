let expect = require('chai').expect;

const ValidationError = require('mongoose').Error.ValidationError;

const User = require('../models/User');


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
})