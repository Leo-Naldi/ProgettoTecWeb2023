const User = require('../models/User');

async function makeDefaultUsers() {
    const pw = '12345678';

    const user1 = new User({
        handle: 'fv',
        username: 'fv',
        email: 'mail@mail.com',
        password: pw,
    });

    const user2 = new User({
        handle: 'fvPro',
        username: 'fvPro',
        email: 'mail@mail.com',
        password: pw,
    });

    const user3 = new User({
        handle: 'fvSMM',
        username: 'fvSMM',
        email: 'mail@mail.com',
        password: 'abc123456',
    });

    const user4 = new User({
        handle: 'fvMod',
        username: 'fvMod',
        email: 'mail@mail.com',
        password: pw,
    });

}