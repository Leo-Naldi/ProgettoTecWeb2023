const dayjs = require('dayjs');
const User = require('../models/User');

/**
 * Renews expired subscriptions if autoRenew is true, 
 * cancels them where autoRenew is false.
 */
async function renewSubscriptions() {
    
    const uquery = User.find()
        .where('subscription').ne(null)
        .where('subscription.expires').lte(new Date())
        .populate('subscription.proPlan');

    const users = await uquery;

    await Promise.all(users.map(u => {
       
        if (u.autoRenew) {
            u.subscription.expires = (new dayjs()).add(1, u.subscription.proPlan.period).toDate();
            u.subscription.proPlan = u.subscription.proPlan._id;
        } else {
            u.subscription = null;
            u.accountType = 'user';
        }

        return u.save();
    }))
}

module.exports = renewSubscriptions;