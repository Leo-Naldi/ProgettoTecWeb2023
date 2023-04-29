const mongoose = require('mongoose');

const config = require('../config/index');

before(async function() {
    await mongoose.connect(config.db_url);
    
});

after(async function(){
    await mongoose.disconnect();
    
})