let expect = require('chai').expect;

const config = require('../config/index');

function checkObject(o, properties=[]) {
    expect(o).to.not.be.null;
    expect(o).to.be.an('object');
    properties.map(p => expect(o).to.have.property(p));
}

function checkArray(a, allowEmpty=false) {
    
    expect(a).to.be.an('array');

    if (!allowEmpty) expect(a).to.not.be.empty;
}

function checkSuccessCode(res){
    
    checkObject(res, ['status']);
    //expect(res).to.not.be.null;
    //expect(res).to.be.an("object");
    //expect(res).to.have.property('status');
    expect(res.status).to.equal(config.default_success_code);
}

function checkErrorCode(res) { 
    expect(res).to.not.be.null;
    expect(res).to.be.an("object");
    expect(res).to.have.property('status');
    expect(res.status).to.equal(config.default_client_error);
}

function checkPayloadArray(res, allowEmpty=false){
    
    expect(res).to.have.property('payload');
    
    checkArray(res.payload, allowEmpty);
}

function checkPayloadObject(res, properties=[]) {
    expect(res).to.have.property('payload');
    
    checkObject(res.payload, properties);
}

module.exports = {
    checkErrorCode,
    checkSuccessCode,
    checkPayloadArray,
    checkPayloadObject,
    checkObject,
    checkArray,
}