let expect = require('chai').expect;

const { UserDispatch } = require('./hooks')
const User = require('../models/User');
const AuthServices = require('../services/AuthServices');
const {
    checkErrorCode,
    checkSuccessCode,
    checkPayloadObject,
} = require('../utils/testingUtils');

describe("AuthServices Unit Tests", function(){

    describe("login Unit Tests", function(){

        it("Should fail if no handle is provided", async function(){
            const res = await AuthServices.login({ password: 'abc123456' });

            checkErrorCode(res);
        });

        it("Should fail if no password is provided", async function () {
            const res = await AuthServices.login({ handle: UserDispatch.getNext().handle });

            checkErrorCode(res);
        });

        it("Should fail if passwords do not match", async function () {
            const res = await AuthServices.login({ 
                handle: UserDispatch.getNext().handle,
                password: 'abc123456notsomuchmatchinghuh',
            });

            checkErrorCode(res);
        });

        it("Should succeed if passwords match", async function () {
            const res = await AuthServices.login({
                handle: UserDispatch.getNext().handle,
                password: 'abc123456',
            });

            checkSuccessCode(res);
        });

        it("Should return the token in the body", async function () {
            const res = await AuthServices.login({
                handle: UserDispatch.getNext().handle,
                password: 'abc123456',
            });

            checkPayloadObject(res, ['token']);
        });

    });

    describe("loginPro Unit Tests", function () {

        it("Should fail if no handle is provided", async function () {
            const res = await AuthServices.loginPro({ password: 'abc123456' });

            checkErrorCode(res);
        });

        it("Should fail if no password is provided", async function () {

            let user = await User.findOne({ handle: UserDispatch.getNext().handle }).orFail();

            user.accountType = 'pro';

            user = await user.save();

            const res = await AuthServices.loginPro({ handle: user.handle });

            checkErrorCode(res);
        });

        it("Should fail if passwords do not match", async function () {

            let user = await User.findOne({ handle: UserDispatch.getNext().handle }).orFail();

            user.accountType = 'pro';

            user = await user.save();

            const res = await AuthServices.loginPro({
                handle: user.handle,
                password: user.password + 'fjwsdnqowdncqernpvnqelkfnv',
            });

            checkErrorCode(res);
        });

        it("Should fail if the user is not a pro user", async function(){
            
            let user = await User.findOne({ handle: UserDispatch.getNext().handle }).orFail();

            const res = await AuthServices.loginPro({
                handle: user.handle,
                password: user.password,
            });

            checkErrorCode(res);
        });

        it("Should succeed if passwords match", async function () {
            
            let user = await User.findOne({ handle: UserDispatch.getNext().handle }).orFail();

            user.accountType = 'pro';

            user = await user.save();
            
            const res = await AuthServices.loginPro({
                handle: user.handle,
                password: user.password,
            });

            checkSuccessCode(res);
        });

        it("Should return the token in the body", async function () {
            let user = await User.findOne({ handle: UserDispatch.getNext().handle }).orFail();

            user.accountType = 'pro';

            user = await user.save();

            const res = await AuthServices.loginPro({
                handle: user.handle,
                password: user.password,
            });

            checkPayloadObject(res, ['token']);
        });
    });

    describe("loginAdmin Unit Tests", function () {

        it("Should fail if no handle is provided", async function () {
            const res = await AuthServices.loginAdmin({ password: 'abc123456' });

            checkErrorCode(res);
        });

        it("Should fail if no password is provided", async function () {

            let user = await User.findOne({ handle: UserDispatch.getNextAdmin().handle }).orFail();

            const res = await AuthServices.loginAdmin({ handle: user.handle });

            checkErrorCode(res);
        });

        it("Should fail if passwords do not match", async function () {

            let user = await User.findOne({ handle: UserDispatch.getNextAdmin().handle }).orFail();

            const res = await AuthServices.loginAdmin({
                handle: user.handle,
                password: user.password + 'fjwsdnqowdncqernpvnqelkfnv',
            });

            checkErrorCode(res);
        });

        it("Should fail if the user is not an admin user", async function () {

            let user = await User.findOne({ handle: UserDispatch.getNext().handle }).orFail();

            const res = await AuthServices.loginAdmin({
                handle: user.handle,
                password: user.password,
            });

            checkErrorCode(res);
        });

        it("Should succeed if passwords match", async function () {

            let user = await User.findOne({ handle: UserDispatch.getNextAdmin().handle }).orFail();

            const res = await AuthServices.loginAdmin({
                handle: user.handle,
                password: user.password,
            });

            checkSuccessCode(res);
        });

        it("Should return the token in the body", async function () {
            let user = await User.findOne({ handle: UserDispatch.getNextAdmin().handle }).orFail();


            const res = await AuthServices.loginAdmin({
                handle: user.handle,
                password: user.password,
            });

            checkPayloadObject(res, ['token']);
        });
    });

});