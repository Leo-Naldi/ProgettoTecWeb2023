let expect = require('chai').expect;


const config = require('../config');
const User = require('../models/User');
const Message = require('../models/Message');
const Channel = require('../models/Channel');
const UserService = require('../services/UserServices');
const { testUser, UserDispatch, lorem, createChannel } = require('./hooks');

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

        it('Should only return users with the given handle', async function(){
            const user = await User.findOne({ handle: UserDispatch.getNext().handle }).orFail();

            const res = await UserService.getUsers({ handle: user.handle });

            expect(res).to.be.an('object');
            expect(res).to.have.property('status');
            expect(res.status).to.equal(config.default_success_code);
            expect(res).to.have.property('payload');
            expect(res.payload).to.be.an('array').that.has.lengthOf(1);
            expect(res.payload[0]).to.deep.equal(user.toObject());
        });

        it('Should only return admin users', async function(){
            const res = await UserService.getUsers({ admin: true });

            expect(res).to.be.an('object');
            expect(res).to.have.property('status');
            expect(res.status).to.equal(config.default_success_code);
            expect(res).to.have.property('payload');
            expect(res.payload).to.be.an('array').that.is.not.empty;
            expect(res.payload.every(u => u.admin)).to.be.true;
        });

        ['pro', 'user'].map(t => {

            it(`Should only return accounts of the given type (${t})`, async function(){
                const res = await UserService.getUsers({ accountType: t });

                expect(res).to.be.an('object');
                expect(res).to.have.property('status');
                expect(res.status).to.equal(config.default_success_code);
                expect(res).to.have.property('payload');
                expect(res.payload).to.be.an('array').that.is.not.empty;
                expect(res.payload.every(u => u.accountType === t)).to.be.true;
            });
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

        it('Should fail when the user does not exist', async function(){
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
            expect(res.status, res?.error?.message)
                .to.equal(config.default_success_code);
            expect(found).to.not.be.null;
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

        it("Should add the channels to the users joinedChannel list", async function(){
            const creator = UserDispatch.getNext();
            const user = UserDispatch.getNext();
            const description = lorem.generateParagraphs(1);

            const name = UserDispatch.getNextChannelName();
            const name2 = UserDispatch.getNextChannelName();


            await createChannel({
                name: name,
                ownerHandle: creator.handle,
                description: description,
            })

            await createChannel({
                name: name2,
                ownerHandle: creator.handle,
                description: description,
            })

            let crec = await Channel.findOne({ name: name });
            let crec2 = await Channel.findOne({ name: name2 });

            expect(crec).to.not.be.null;
            expect(crec2).to.not.be.null;

            const res = await UserService.writeUser({
                handle: user.handle,
                addJoinedChannels: [name, name2],
            })

            expect(res).to.be.an('object');
            expect(res).to.have.property('status');
            expect(res.status).to.equal(config.default_success_code);

            const userCheck = await User.findOne({ handle: user.handle });

            expect(userCheck).to.not.be.null;
            expect(userCheck).to.have.property('joinedChannels');
            expect(userCheck.joinedChannels).to.be.an('array').that.is.not.empty;
            expect(userCheck.joinedChannels.some(cid => cid.equals(crec._id)))
                .to.be.true;
            expect(userCheck.joinedChannels.some(cid => cid.equals(crec2._id)))
                .to.be.true;
        })

        it('Should remove the channels from the users joinedChannel list', async function () {
            const creator = UserDispatch.getNext();
            const user = UserDispatch.getNext();
            const description = lorem.generateParagraphs(1);

            const name = UserDispatch.getNextChannelName();
            const name2 = UserDispatch.getNextChannelName();


            await createChannel({
                name: name,
                ownerHandle: creator.handle,
                description: description,
            })

            await createChannel({
                name: name2,
                ownerHandle: creator.handle,
                description: description,
            })

            let crec = await Channel.findOne({ name: name });
            let crec2 = await Channel.findOne({ name: name2 });

            expect(crec).to.not.be.null;
            expect(crec2).to.not.be.null;

            let urec = await User.findOne({ handle: user.handle });

            expect(urec).to.not.be.null;

            urec.joinedChannels.push(crec._id);
            urec.joinedChannels.push(crec2._id);
            
            await urec.save();
           
            crec.members.push(urec._id);
            crec2.members.push(urec._id);

            await crec.save()
            await crec2.save()
            crec = await Channel.findOne({ name: name });
            crec2 = await Channel.findOne({ name: name2 });

            const res = await UserService.writeUser({
                handle: user.handle,
                removeJoinedChannels: [name],
            })

            expect(res).to.be.an('object');
            expect(res).to.have.property('status');
            expect(res.status).to.equal(config.default_success_code);

            const userCheck = await User.findOne({ handle: user.handle });

            expect(userCheck).to.not.be.null;
            expect(userCheck).to.have.property('joinedChannels');
            expect(userCheck.joinedChannels).to.be.an('array').that.is.not.empty;
            expect(userCheck.joinedChannels.some(cid => cid.equals(crec._id)))
                .to.be.false;
            expect(userCheck.joinedChannels.some(cid => cid.equals(crec2._id)))
                .to.be.true;
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

    describe('changeManaged Unit Tests', function(){
        it("Should fail if provided handle does not exist", async function(){

            const user = UserDispatch.getNext();
            const urec = await User.findOne({ handle: user.handle });

            const res = await UserService.changeManaged({
                handle: 'kjfbpqwjnqm',
                reqUser: urec,
                users: [UserDispatch.getNext(), UserDispatch.getNext()]
            })

            expect(res).to.be.an('object');
            expect(res).to.have.property('status');
            expect(res.status).to.equal(config.default_client_error);

        });

        it("Should remove the given accounts", async function(){
            
            const user = UserDispatch.getNext();
            let urec = await User.findOne({ handle: user.handle });

            urec.accountType = 'pro'

            await urec.save()
            urec = await User.findOne({ handle: user.handle });

            let managed = [
                UserDispatch.getNext(), 
                UserDispatch.getNext(),
                UserDispatch.getNext(),
                UserDispatch.getNext(),
            ]


            for (let i = 0; i < managed.length; i++) {
                let u = await User.findOne({ handle: managed[i].handle });

                u.accountType = 'pro'
                u.smm = urec._id;

                await u.save()
            }

            const bfCheck = await User.find({ smm: urec._id });

            expect(bfCheck).to.be.an('array').that.is.not.empty;

            bfCheck.map(u => {
                expect(managed.some(uac => uac.handle === u.handle))
            })

            const res = await UserService.changeManaged({
                handle: urec.handle,
                reqUser: urec,
                users: [managed[0].handle, managed[2].handle]
            })

            expect(res).to.be.an('object');
            expect(res).to.have.property('status');
            expect(res.status).to.equal(config.default_success_code);

            urec = await User.findOne({ handle: user.handle });

            const check = await User.find({ smm: urec._id });

            expect(check).to.be.an('array').that.is.not.empty;
            
            check.map(m => {
                expect([managed[0].handle, managed[2].handle].some(h => h === m.handle))
                    .to.be.false;
                expect([managed[1].handle, managed[3].handle].some(h => h === m.handle))
                    .to.be.true;
            })
        });

        it("Should ignore not managed accounts", async function () {

            const user = UserDispatch.getNext();
            let urec = await User.findOne({ handle: user.handle });

            urec.accountType = 'pro'

            await urec.save()
            urec = await User.findOne({ handle: user.handle });

            let managed = [
                UserDispatch.getNext(),
                UserDispatch.getNext(),
                UserDispatch.getNext(),
                UserDispatch.getNext(),
            ]


            for (let i = 0; i < managed.length; i++) {
                let u = await User.findOne({ handle: managed[i].handle });

                u.accountType = 'pro'
                u.smm = urec._id;

                await u.save()
            }

            const innocents = [
                UserDispatch.getNext(),
                UserDispatch.getNext(),
            ]

            let i0 = await User.findOne({ handle: innocents[0].handle })
            let i1 = await User.findOne({ handle: innocents[1].handle })

            i1.smm = i0._id;

            await i1.save();

            const bfCheck = await User.find({ smm: urec._id });

            expect(bfCheck).to.be.an('array').that.is.not.empty;

            bfCheck.map(u => {
                expect(managed.some(uac => uac.handle === u.handle))
            })

            const res = await UserService.changeManaged({
                handle: urec.handle,
                reqUser: urec,
                users: [
                    managed[0].handle, 
                    managed[2].handle,
                    innocents[0].handle,
                    innocents[1].handle,
                ]
            })

            expect(res).to.be.an('object');
            expect(res).to.have.property('status');
            expect(res.status).to.equal(config.default_success_code);

            urec = await User.findOne({ handle: user.handle });

            const check = await User.find({ smm: urec._id });

            expect(check).to.be.an('array').that.is.not.empty;

            check.map(m => {
                expect([managed[0].handle, managed[2].handle].some(h => h === m.handle))
                    .to.be.false;
                expect([managed[1].handle, managed[3].handle].some(h => h === m.handle))
                    .to.be.true;
            })

            i0 = await User.findOne({ handle: innocents[0].handle })
            i1 = await User.findOne({ handle: innocents[1].handle })

            expect(i1?.smm).to.not.be.null;

            expect(i1.smm.equals(i0._id)).to.be.true;
        })
    })

    describe('checkAvailability Unit Tests', async function () {

        it("Should fail if you provide neither email nor handle", async function(){
            const res = await UserService.checkAvailability({});

            expect(res).to.be.an('object');
            expect(res).to.have.property('status');
            expect(res.status).to.equal(config.default_client_error);
        });

        it("Should return handle: true if handle is available", async function () {
            const res = await UserService.checkAvailability({ handle: testUser(100000000).handle });

            expect(res).to.be.an('object');
            expect(res).to.have.property('status');
            expect(res.status).to.equal(config.default_success_code);

            expect(res).to.have.property('payload');
            expect(res.payload).to.be.an('object').that.has.property('handle');
            expect(res.payload.handle).to.be.true;
        })

        it("Should return email: true if email is available", async function () {
            const res = await UserService.checkAvailability({ email: testUser(100000000).email });

            expect(res).to.be.an('object');
            expect(res).to.have.property('status');
            expect(res.status).to.equal(config.default_success_code);

            expect(res).to.have.property('payload');
            expect(res.payload).to.be.an('object').that.has.property('email');
            expect(res.payload.email).to.be.true;
        })

        it("Should return email, handle: true if email and handle are available", async function () {
            
            const res = await UserService.checkAvailability({ 
                handle: testUser(100000000).handle, 
                email: testUser(100000000).email 
            });

            expect(res).to.be.an('object');
            expect(res).to.have.property('status');
            expect(res.status).to.equal(config.default_success_code);

            expect(res).to.have.property('payload');
            expect(res.payload).to.be.an('object').that.has.property('email');
            expect(res.payload.email).to.be.true;
            expect(res.payload).to.have.property('handle');
            expect(res.payload.handle).to.be.true;
        });

        it("Should return handle: false if handle is taken", async function () {
            const res = await UserService.checkAvailability({ 
                handle: UserDispatch.getNext().handle
            });

            expect(res).to.be.an('object');
            expect(res).to.have.property('status');
            expect(res.status).to.equal(config.default_success_code);

            expect(res).to.have.property('payload');
            expect(res.payload).to.be.an('object').that.has.property('handle');
            expect(res.payload.handle).to.be.false;
        })

        it("Should return email: false if email is taken", async function () {
            const res = await UserService.checkAvailability({
                email: UserDispatch.getNext().email
            });

            expect(res).to.be.an('object');
            expect(res).to.have.property('status');
            expect(res.status).to.equal(config.default_success_code);

            expect(res).to.have.property('payload');
            expect(res.payload).to.be.an('object').that.has.property('email');
            expect(res.payload.email).to.be.false;
        })

        it("Should return email, handle: false if neither are available", async function () {
            
            const u = UserDispatch.getNext();
            const res = await UserService.checkAvailability({
                handle: u.handle,
                email: u.email
            });

            expect(res).to.be.an('object');
            expect(res).to.have.property('status');
            expect(res.status).to.equal(config.default_success_code);

            expect(res).to.have.property('payload');
            expect(res.payload).to.be.an('object').that.has.property('email');
            expect(res.payload.email).to.be.false;
            expect(res.payload).to.have.property('handle');
            expect(res.payload.handle).to.be.false;
        });


    });

    describe("General User Services Unit Tests", function(){

        it("Should add the user to the managed field returned by getUser after calling changeSmm",
        async function(){
            const handle1 = UserDispatch.getNext().handle, 
                handle2 = UserDispatch.getNext().handle;

            
            let u1 = await User.findOne({ handle: handle1 }).orFail();
            let u2 = await User.findOne({ handle: handle2 }).orFail();

            u1.accountType = 'pro';
            u2.accountType = 'pro';

            u1 = await u1.save();
            u2 = await u2.save();

            // make sure u1 did not already manage u2
            expect(u1).to.be.an('object');
            expect(u1._id.equals(u2.smm)).to.be.false;

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