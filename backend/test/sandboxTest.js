const mongoose = require('mongoose');
let expect = require('chai').expect;

const TestSchema = new mongoose.Schema(
    {
       arrField: {
            type: Array,
            items: String,
       },
    }
);

const Test = new mongoose.model('Test', TestSchema);

describe.skip('Prove a caso', async function(){


    before(async function(){

        let items = [
            new Test({
                arrField: ['ciao', 'hello', 'bonjour', 'hallo']
            }),
            new Test({
                arrField: ['hello', 'bonjour', 'hallo']
            }),
            new Test({
                arrField: ['ciao', 'bonjour', 'hallo']
            }),
            new Test({
                arrField: ['ciao', 'hello', 'hallo']
            }),
            new Test({
                arrField: ['ciao', 'hello', 'bonjour']
            }),
            new Test({
                arrField: ['bonjour', 'hallo']
            }),
            new Test({
                arrField: ['ciao', 'hello']
            }),
            new Test({
                arrField: ['ciao', 'hallo']
            }),
            new Test({
                arrField: ['ciao', 'bonjour']
            }),
            new Test({
                arrField: ['hello', 'hallo']
            }),
            new Test({
                arrField: ['ciao']
            }),
            new Test({
                arrField: ['hello']
            }),
            new Test({
                arrField: ['bonjour']
            }),
            new Test({
                arrField: ['hallo']
            }),
        ]

        await Promise.all(items.map(p => p.save()));

    })
    after(async function(){
        await Test.deleteMany({})
    })

    it('Should only return items containing ciao and one of hello or bonjour', async function(){

        const testfilter = {
            $and: [
                { arrField: 'ciao' },
                { arrField: { $in: ['bonjour', 'hallo'] } }
            ]
        }

        const res = await Test.find(testfilter);

        expect(res).to.be.an('array').that.is.not.empty;
        res.map(value => {
            expect(value.arrField).to.include('ciao');
            expect(['bonjour', 'hallo'].some(v => value.arrField.find(i => i === v))).to.be.true;
        })
    })

})