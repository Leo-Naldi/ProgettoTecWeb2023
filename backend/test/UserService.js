let expect = require('chai').expect;


const config = require('../config');
const User = require('../models/User');
const UserService = require('../services/UserServices');
const { testUser, UserDispatch } = require('./hooks');

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
            
            const handle = UserDispatch.getNext().handle

            const res = await UserService.getUser({
                handle: handle,
            });

            expect(res).to.be.an('object');
            expect(res).to.have.property('status');
            expect(res.status).to.equal(config.default_success_code);
            expect(res).to.have.property('payload');
            expect(res.payload).to.have.property('handle');
            expect(res.payload.handle).to.be.a('string');
            expect(res.payload.handle).to.equal(handle);

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
            const u = UserDispatch.getNext();

            await User.deleteOne({ handle: u.handle })
            const res = await UserService.createUser(u);

            const found = await User.findOne({ handle: u.handle });

            expect(res).to.be.an('object');
            expect(res).to.have.property('status');
            expect(res.status).to.equal(config.default_success_code);
            expect(found).to.be.an.instanceOf(User);
            expect(found).to.have.property('handle');
            expect(found.handle).to.be.a('string');
            expect(found.handle).to.equal(u.handle);
        });

        it('Should fail if handle is taken', async function(){
            
            const u = UserDispatch.getNext();

            const found = await User.findOne({ handle: u.handle });

            expect(found).to.not.be.null;

            const res = await UserService.createUser(u.handle);

            expect(res).to.be.an('object');
            expect(res).to.have.property('status');
            expect(res.status).to.equal(config.default_client_error);
        });

        it('Should fail if email is taken', async function () {

            let tu = UserDispatch.getNext();

            const found = await User.findOne({ handle: tu.handle });

            expect(found).to.not.be.null;

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

            const handle = UserDispatch.getNext().handle;

            const res = await UserService.deleteUser({ handle: handle });

            expect(res).to.be.an('object');
            expect(res).to.have.property('status');
            expect(res.status).to.equal(config.default_success_code);

            const found = await User.findOne({ handle: handle })

            expect(found).to.be.null;
        });

        it('Should fail if the handle does not exist', async function() {
            const h = UserDispatch.getNext().handle + 'kjhwbfvwohrfbwoierbufwiernqpiwdunv';

            const res = await UserService.deleteUser({ handle: h });

            expect(res).to.be.an('object');
            expect(res).to.have.property('status');
            expect(res.status).to.equal(config.default_client_error);
        });

    });

    describe('writeUser Unit Tests', function () { 
        it('Should actually write the specified fields', async function(){
            
            const values = {
                handle: UserDispatch.getNext().handle,
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
            
            const handle = UserDispatch.getNext().handle
            const res = await UserService.grantAdmin({ handle: handle });

            expect(res).to.be.an('object');
            expect(res).to.have.property('status');
            expect(res.status).to.equal(config.default_success_code);

            const u = await User.findOne({ handle: handle });

            expect(u.admin).to.be.true;
        })
     });

    describe('revokeAdmin Unit Tests', async function () { 
        
        it('Should actually revoke admin priviledges', async function(){

            const handle = UserDispatch.getNextAdmin().handle;
            const res = await UserService.revokeAdmin({ handle: handle });
    
            expect(res).to.be.an('object');
            expect(res).to.have.property('status');
            expect(res.status).to.equal(config.default_success_code);
    
            const u = await User.findOne({ handle: handle });
    
            expect(u.admin).to.be.false;
        })
    });

    describe('changeSmm Unit Tests', async function(){
        it("Should fail if operation is neither 'remove' nor 'change'", async function(){
            
            const u = UserDispatch.getNext();

            const res = await UserService.changeSmm({ 
                handle: u.handle,
                operation: 'secret third option',
                email: u.email,
            })

            expect(res).to.be.an('object');
            expect(res).to.have.property('status');
            expect(res.status).to.equal(config.default_client_error);
        });
        
        it("Should remove the smm if the user exists", async function(){

            const handle1 = UserDispatch.getNext().handle, 
                handle2 = UserDispatch.getNext().handle;

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
            const handle1 = UserDispatch.getNext().handle, 
                handle2 = UserDispatch.getNext().handle;

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
            const res = await UserService.checkAvailability({ handle: UserDispatch.getNext().handle, email: testUser(100000000).email });

            const u = UserDispatch.getNext();

            expect(res).to.be.an('object');
            expect(res).to.have.property('status');
            expect(res.status).to.equal(config.default_success_code);

            expect(res).to.have.property('payload');
            expect(res.payload).to.be.an('object').that.has.property('available');
            expect(res.payload.available).to.be.false;

            const res2 = await UserService.checkAvailability({ handle: testUser(100000000).handle, email: u.email });

            expect(res2).to.be.an('object');
            expect(res2).to.have.property('status');
            expect(res2.status).to.equal(config.default_success_code);

            expect(res2).to.have.property('payload');
            expect(res2.payload).to.be.an('object').that.has.property('available');
            expect(res2.payload.available).to.be.false;

            const res3 = await UserService.checkAvailability({ email: u.email });

            expect(res3).to.be.an('object');
            expect(res3).to.have.property('status');
            expect(res3.status).to.equal(config.default_success_code);

            expect(res3).to.have.property('payload');
            expect(res3.payload).to.be.an('object').that.has.property('available');
            expect(res3.payload.available).to.be.false;

            const res4 = await UserService.checkAvailability({ handle: u.handle });

            expect(res4).to.be.an('object');
            expect(res4).to.have.property('status');
            expect(res4.status).to.equal(config.default_success_code);

            expect(res4).to.have.property('payload');
            expect(res4.payload).to.be.an('object').that.has.property('available');
            expect(res4.payload.available).to.be.false;
        })

     });

     describe("General User Services Unit Tests", function(){

        it("Should add the user to the managed field returned by getUser after calling changeSmm",
        async function(){
            const handle1 = UserDispatch.getNext().handle, 
                handle2 = UserDispatch.getNext().handle;

            const u1 = await UserService.getUser({ handle: handle1 });

            let u2 = await User.findOne({ handle: handle2 }).orFail();

            // make sure u1 did not already manage u2
            expect(u1).to.be.an('object');
            expect(u1).to.have.property('status');
            expect(u1.status).to.equal(config.default_success_code);
            expect(u1).to.have.property('payload');
            expect(u1.payload).to.be.an('object');
            expect(u1.payload).to.have.property('managed');
            expect(u1.payload.managed).to.be.an('array');
            expect(u1.payload.managed).to.not.have.deep.members([u2.toObject()]);

            const res = await UserService.changeSmm({
                handle: handle2, 
                operation: 'change',
                smm: handle1,
            })

            expect(res).to.be.an('object');
            expect(res).to.have.property('status');
            expect(res.status).to.equal(config.default_success_code);

            const getRes = await UserService.getUser({ handle: handle1 });

            expect(getRes).to.be.an('object');
            expect(getRes).to.have.property('status');
            expect(getRes.status).to.equal(config.default_success_code);
            expect(getRes).to.have.property('payload');
            expect(getRes.payload).to.be.an('object');
            expect(getRes.payload).to.have.property('managed');
            expect(getRes.payload.managed).to.be.an('array');

            expect(getRes.payload.managed).to.have.deep.members([handle2]);
        });

     })
        
})