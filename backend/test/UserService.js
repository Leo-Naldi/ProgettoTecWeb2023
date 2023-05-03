let expect = require('chai').expect;


const User = require('../models/User');
const UserService = require('../services/UserServices');
const { testUser } = require('./hooks');

describe('User Service Unit Tests', function () {

    describe('getUsers Unit Tests', function () { 
        
        it('Should Return an array of Users', async function() {
            const res = await UserService.getUsers({});

            expect(res).to.be.an('object');
            expect(res).to.have.property('status');
            expect(res.status).to.equal(200);
            expect(res).to.have.property('payload');
            expect(res.payload).to.be.an('array');
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

        it('Should be able to create a new user');

        it('Should fail if handle is taken');

        it('Should fail if email is taken');

     });

    describe('deleteUser Unit Tests', function () { 

        it('Should delete the user if the handle exists');

        it('Should fail if the handle does not exist');

    });

    describe('writeUser Unit Tests', function () { });

    describe('grantAdmin Unit Tests', function () { 
        
     });

    describe('revokeAdmin Unit Tests', function () { });
        
})