const dayjs = require('dayjs');
const User = require('../models/User');

/**
 * Renews expired subscriptions if autoRenew is true, 
 * cancels them where autoRenew is false.
 */
async function renewSubscriptions() {
    // users with a montly pro plan
    const monthly_u = User.find().populate('subscription.proPlan')
        .where('subscription.proPlan.period').equals('month')
        .where('subscription.expires').gte(new Date()).exec();

    // users with a yearly pro plan
    const yearly_u = User.find().populate('subscription.proPlan')
        .where('subscription.proPlan.period').equals('year')
        .where('subscription.expires').gte(new Date()).exec();

    const queries = await Promise.all([monthly_u, yearly_u]);

    // update promises
    const monthly_updates = queries[0].map(async u => {
        
        if (u.subscription.autoRenew) {
            u.subscription.expires = (new dayjs(u.subscription.expires)).add(1, 'month').toDate();
            u.depopulate('subscription.proPlan');
        } else {
            u.subscription = null;
        }

        return await u.save();
    });

    const yearly_updates = queries[1].map(async u => {
        
        if (u.subscription.autoRenew) {
            u.subscription.expires = (new dayjs(u.subscription.expires)).add(1, 'year').toDate();
            u.depopulate('subscription.proPlan');
        } else {
            u.subscription = null;
        }

        return await u.save();
    });
    
    await Promise.all([...monthly_updates, ...yearly_updates]);
}

module.exports = renewSubscriptions;