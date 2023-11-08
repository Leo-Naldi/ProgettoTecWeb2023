const { expect } = require("chai");
const User = require("../models/User");
const dayjs = require('dayjs')

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
                u.subscription.expires = (new dayjs()).subtract(1, 'year').toISOString();
            }

            return u.save();
        }));
    })

    describe("Renew Characters")

})