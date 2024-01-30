const { expect } = require("chai");
const User = require("../models/User");
const dayjs = require('dayjs');
const config = require("../config");
const { logger } = require("../config/logging");
const { resetDaily, resetWeekly, resetMonthly, renewSubscriptions } = require("../config/crons");

describe("Crons Tests", function() {

    before(async function() {
        let users = await User.find();

        await Promise.all(users.map(u => {
            u.charLeft = {
                day: 0,
                week: 0,
                month: 0,
            }

            if (u.subscription) {
                u.subscription.expires = (new dayjs()).subtract(1, 'year').toDate();
            }

            return u.save();
        }));
    })

    describe("Renew Characters", function(){
        
        let users;

        before(async function(){

            await resetDaily();
            await resetWeekly();
            await resetMonthly();

            users = await User.find().populate('subscription.proPlan');
        });

        it("Should renew the daily characters", async function(){
            expect(users).to.not.be.empty;

            users.map(u => {
                if (!['__cron', 'fvPro', 'Nome Buffo1', 'Nome Buffo2'].find(h => h === u.handle)){
                    expect(u.charLeft.day)
                    .to.equal(config.daily_quote 
                        + (u.subscription?.proPlan.extraCharacters.day || 0))
                }
            });
        });

        it("Should renew the weekly characters", async function () {
            expect(users).to.not.be.empty;

            users.map(u => {
                if (u.handle !== '__cron') {
                    expect(u.charLeft.week)
                        .to.equal(config.weekly_quote
                            + (u.subscription?.proPlan.extraCharacters.week || 0))
                } else {
                    expect(u.charLeft.week).to.equal(999999999);
                }
            });
        });
        
        it("Should renew the monthly characters", async function () {
            expect(users).to.not.be.empty;

            users.map(u => {
                if (u.handle !== '__cron') {
                    expect(u.charLeft.month)
                        .to.equal(config.monthly_quote
                            + (u.subscription?.proPlan.extraCharacters.month || 0))
                } else {
                    expect(u.charLeft.month).to.equal(999999999);
                }
            });
        });

    });

    describe("Renew Subscription", function () {

        let users, no_renew_users, pro_users;

        before(async function () {

            no_renew_users = (await User.find({
                subscription: { $ne: null }
            }).populate('subscription.proPlan'))
                .filter(u => ((u.subscription !== null) && (!u.subscription?.autoRenew)))
            
            no_renew_users.map(u => expect(u.subscription).to.not.be.null);
            no_renew_users = no_renew_users.map(u => u.handle);

            await renewSubscriptions();

            users = await User.find().populate('subscription.proPlan');
            no_renew_users = await User.find({
                handle: { $in: no_renew_users }
            }).populate('subscription.proPlan');

            pro_users = await User.find({ accountType: 'pro' });
        });

        it("Should refresh the expiration date when autorenew is true", function(){
            
            let now = new dayjs();

            let renewed = users.filter(u => u.subscription);

            expect(renewed).to.not.be.empty;

            renewed.map(u => {
                let exp = new dayjs(u.subscription.expires);
                expect(exp.isAfter(now)).to.be.true;
            });
        });

        it("Should remove the subscription when autoRenew is false", function () {
            no_renew_users.map(u => {
                expect(u.subscription).to.be.null;
            })
        });
        
        it("Should set the account type of non subscribed users to user", function(){
            users.filter(u => !u.subscription).map(u => expect(u.accountType).to.equal('user'))
        });

        it("Should leave the account type unchanged for renewed users", function(){
            let renewed = users.filter(u => u.subscription);

            expect(renewed).to.not.be.empty;

            renewed.map(u => {  
                if (u.subscription.proPlan.pro) {
                    expect(u.accountType).to.equal('pro');
                } else {
                    expect(u.accountType).to.equal('user'); 
                }
            });
        })

    });
})