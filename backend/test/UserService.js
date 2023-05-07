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
            expect(res.status).to.equal(config.default_success_code);
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
            expect(res.status).to.equal(config.default_success_code);
            expect(res).to.have.property('payload');
            expect(res.payload).to.have.property('handle');
            expect(res.payload.handle).to.be.a('string');
            expect(res.payload.handle).to.equal(testUser(1).handle);

            //console.log(res.payload)
        })

        it('Should not return anything when the user does not exist', async function(){
            const res = await UserService.getUser({
                handle: 'bwernfwebgwohpeqcrbwo4gqnbdcohfb2oirfoi3urhf8745237hjdcnscjdn',
            });

            expect(res).to.be.an('object');
            expect(res).to.have.property('status');
            expect(res.status).to.equal(config.default_client_error);
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
            expect(res.status).to.equal(config.default_success_code);
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

            expect(u.toObject()).to.deep.include(values)
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
        
        it('Should actually revoke admin priviledges', async function(){

            const res = await UserService.revokeAdmin({ handle: testUser('ad2').handle });
    
            expect(res).to.be.an('object');
            expect(res).to.have.property('status');
            expect(res.status).to.equal(config.default_success_code);
    
            const u = await User.findOne({ handle: testUser('ad2').handle });
    
            expect(u.admin).to.be.false;
        })
    });

    describe('changeSmm Unit Tests', async function(){
        it("Should fail if operation is neither 'remove' nor 'change'", async function(){
            const res = await UserService.changeSmm({ 
                handle: testUser(21).handle,
                operation: 'secret third option',
                email: testUser(21).email,
            })

            expect(res).to.be.an('object');
            expect(res).to.have.property('status');
            expect(res.status).to.equal(config.default_client_error);
        });
        
        it("Should remove the smm if the user exists", async function(){

            const handle1 = testUser(22).handle, handle2 = testUser(23).handle;

            const user1 = await User.findOne({ handle: handle1 });
            const user2 = await User.findOne({ handle: handle2 });

            expect(user1).to.not.be.null;
            expect(user2).to.not.be.null;

            user2.smm = user1._id;

            await user2.save();

            const res = await UserService.changeSmm({
                handle: handle2,
                operation: 'remove',
            });

            expect(res).to.be.an('object');
            expect(res).to.have.property('status');
            expect(res.status).to.equal(config.default_success_code);

            const u = await User.findOne({ handle: handle2 });

            expect(u).to.not.be.null;
            expect(u.smm).to.be.null;
        });
        
        it("Should change the smm field to the new smm's _id if both exist", async function(){
            const handle1 = testUser(24).handle, handle2 = testUser(25).handle;

            const user1 = await User.findOne({ handle: handle1 });
            const user2 = await User.findOne({ handle: handle2 });

            expect(user1).to.not.be.null;
            expect(user2).to.not.be.null;

            const res = await UserService.changeSmm({
                handle: handle2,
                operation: 'change',
                smm: handle1
            });

            expect(res).to.be.an('object');
            expect(res).to.have.property('status');
            expect(res.status).to.equal(config.default_success_code);

            const u = await User.findOne({ handle: handle2 });

            expect(u).to.not.be.null;
            expect(u.smm).to.not.be.null;
            expect(u.smm.equals(user1._id)).to.be.true;
        })
    });

    describe('checkAvailability Unit Tests', async function () {

        it("Should fail if you provide neither email nor handle", async function(){
            const res = await UserService.checkAvailability({});

            expect(res).to.be.an('object');
            expect(res).to.have.property('status');
            expect(res.status).to.equal(config.default_client_error);
        });

        it("Should return available: true if handle is available", async function () {
            const res = await UserService.checkAvailability({ handle: testUser(100000000).handle });

            expect(res).to.be.an('object');
            expect(res).to.have.property('status');
            expect(res.status).to.equal(config.default_success_code);

            expect(res).to.have.property('payload');
            expect(res.payload).to.be.an('object').that.has.property('available');
            expect(res.payload.available).to.be.true;
        })

        it("Should return available: true if email is available", async function () {
            const res = await UserService.checkAvailability({ email: testUser(100000000).email });

            expect(res).to.be.an('object');
            expect(res).to.have.property('status');
            expect(res.status).to.equal(config.default_success_code);

            expect(res).to.have.property('payload');
            expect(res.payload).to.be.an('object').that.has.property('available');
            expect(res.payload.available).to.be.true;
        })

        it("Should return available: true if email and handle are available", async function () {
            const res = await UserService.checkAvailability({ handle: testUser(100000000).handle, email: testUser(100000000).email });

            expect(res).to.be.an('object');
            expect(res).to.have.property('status');
            expect(res.status).to.equal(config.default_success_code);

            expect(res).to.have.property('payload');
            expect(res.payload).to.be.an('object').that.has.property('available');
            expect(res.payload.available).to.be.true;
        })

        it("Should return available: false if email or handle are taken", async function () {
            const res = await UserService.checkAvailability({ handle: testUser(1).handle, email: testUser(100000000).email });

            expect(res).to.be.an('object');
            expect(res).to.have.property('status');
            expect(res.status).to.equal(config.default_success_code);

            expect(res).to.have.property('payload');
            expect(res.payload).to.be.an('object').that.has.property('available');
            expect(res.payload.available).to.be.false;

            const res2 = await UserService.checkAvailability({ handle: testUser(100000000).handle, email: testUser(1).email });

            expect(res2).to.be.an('object');
            expect(res2).to.have.property('status');
            expect(res2.status).to.equal(config.default_success_code);

            expect(res2).to.have.property('payload');
            expect(res2.payload).to.be.an('object').that.has.property('available');
            expect(res2.payload.available).to.be.false;

            const res3 = await UserService.checkAvailability({ email: testUser(1).email });

            expect(res3).to.be.an('object');
            expect(res3).to.have.property('status');
            expect(res3.status).to.equal(config.default_success_code);

            expect(res3).to.have.property('payload');
            expect(res3.payload).to.be.an('object').that.has.property('available');
            expect(res3.payload.available).to.be.false;

            const res4 = await UserService.checkAvailability({ handle: testUser(1).handle });

            expect(res4).to.be.an('object');
            expect(res4).to.have.property('status');
            expect(res4.status).to.equal(config.default_success_code);

            expect(res4).to.have.property('payload');
            expect(res4.payload).to.be.an('object').that.has.property('available');
            expect(res4.payload.available).to.be.false;
        })

     });

    describe.skip('removeManaged Unit Tests', async function () { });
        
})