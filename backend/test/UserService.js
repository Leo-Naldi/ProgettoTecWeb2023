let expect = require('chai').expect;


const config = require('../config');
const User = require('../models/User');
const UserService = require('../services/UserServices');
const { testUser } = require('./hooks');

describe('User Service Unit Tests', function () {

    describe('getUsers Unit Tests', function () { 
        
        it('Should Return an array of Users', async function() {
            const res = await UserService.getUsers();

            expect(res).to.be.an('object');
            expect(res).to.have.property('status');
            expect(res.status).to.equal(200);
            expect(res).to.have.property('payload');
            expect(res.payload).to.be.an('array').that.is.not.empty;
        })

    });
    
    describe('getUser Unit Tests', function () { 

        it('Should return the user', async function(){
            
            const res = await UserService.getUser({
                handle: testUser(1).handle,
            });

            expect(res).to.be.an('object');
            expect(res).to.have.property('status');
            expect(res.status).to.equal(200);
            expect(res).to.have.property('payload');
            expect(res.payload).to.be.an.instanceOf(User);
            expect(res.payload).to.have.property('handle');
            expect(res.payload.handle).to.be.a('string');
            expect(res.payload.handle).to.equal(testUser(1).handle);
        })

        
    });

    describe('createUser Unit Tests', function () { 

        it('Should be able to create a new user', async function() {
            
            // make sure user can be created
            await User.deleteOne({ handle: testUser(10).handle })
            const res = await UserService.createUser(testUser(10));

            const found = await User.findOne({ handle: testUser(10).handle });

            expect(res).to.be.an('object');
            expect(res).to.have.property('status');
            expect(res.status).to.equal(200);
            expect(found).to.be.an.instanceOf(User);
            expect(found).to.have.property('handle');
            expect(found.handle).to.be.a('string');
            expect(found.handle).to.equal(testUser(10).handle);

            await User.deleteOne({ handle: testUser(10).handle })
        });

        it('Should fail if handle is taken', async function(){
            
            const res = await UserService.createUser(testUser(1));

            expect(res).to.be.an('object');
            expect(res).to.have.property('status');
            expect(res.status).to.equal(config.default_client_error);
        });

        it('Should fail if email is taken', async function () {

            let tu = testUser(1);
            tu.handle += "ckjhfvnwhebrfwienidcnq;kvrnfgjwbcker";
            
            // Should still fail since email was not changed
            const res = await UserService.createUser(tu);

            expect(res).to.be.an('object');
            expect(res).to.have.property('status');
            expect(res.status).to.equal(config.default_client_error);
        });

     });

    describe('deleteUser Unit Tests', function () { 

        it('Should delete the user if the handle exists', async function(){
            const res = await UserService.deleteUser({ handle: testUser(2).handle });

            expect(res).to.be.an('object');
            expect(res).to.have.property('status');
            expect(res.status).to.equal(config.default_success_code);

            const found = await User.findOne({ handle: testUser(2).handle })

            expect(found).to.be.null;
        });

        it('Should fail if the handle does not exist', async function() {
            const h = testUser(100000).handle + 'kjhwbfvwohrfbwoierbufwiernqpiwdunv';

            const res = await UserService.deleteUser({ handle: h });

            expect(res).to.be.an('object');
            expect(res).to.have.property('status');
            expect(res.status).to.equal(config.default_client_error);
        });

    });

    describe('writeUser Unit Tests', function () { 
        it('Should actually write the specified fields', async function(){
            
            const values = {
                handle: testUser(4).handle,
                username: 'DonDiegoDelaVega',
                name: 'carlo',
                lastName: 'maroni',
                email: 'nuovamail.bella@mannaggiaazucc.comnwjfvbmowerfboqiwerfvbwoefvbqn',
                phone: '3334445555',
                gender: 'apache',
                password: 'ahyesthisissafe5',
                accountType: 'pro',
                blocked: true,
                charLeft: {
                    day: 0,
                    month: 10,
                    week: 5,
                }
            };

            const res = await UserService.writeUser(values);

            expect(res).to.be.an('object');
            expect(res).to.have.property('status');
            expect(res.status).to.equal(config.default_success_code);

            // Check it actually wrote

            const u = await User.findOne({ handle: values.handle });

            expect(u).to.not.be.null;
            expect(u).to.be.an('object');

            expect(u.toObject()).to.have.deep.include(values)
        })
    });

    describe('grantAdmin Unit Tests', function () { 
        it('Should make a user into an admin', async function(){
            
            const res = await UserService.grantAdmin({ handle: testUser(3).handle });

            expect(res).to.be.an('object');
            expect(res).to.have.property('status');
            expect(res.status).to.equal(config.default_success_code);

            const u = await User.findOne({ handle: testUser(3).handle });

            expect(u.admin).to.be.true;
        })
     });

    describe('revokeAdmin Unit Tests', async function () { 
        const res = await UserService.revokeAdmin({ handle: testUser('ad1').handle });

        expect(res).to.be.an('object');
        expect(res).to.have.property('status');
        expect(res.status).to.equal(config.default_success_code);

        const u = await User.findOne({ handle: testUser('ad1').handle });

        expect(u.admin).to.be.false;
    });
        
})