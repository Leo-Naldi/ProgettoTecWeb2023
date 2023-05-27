const mongoose = require('mongoose'); 
const dayjs = require('dayjs');

const config = require('../config/index');

const ExtraCharactersSchema = new mongoose.Schema({
    day: {
        type: Number,
        default: 0,
        minimum: 0,
        required: true,
    },
    week: {
        type: Number,
        default: 0,
        minimum: 0,
        required: true,
    },
    month: {
        type: Number,
        default: 0,
        minimum: 0,
        required: true,
    }
}, { _id: false })


const PlanSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true, 
        unique: true 
    },
    price: {
        type: Number,
        min: 0,
        required: true,
    },
    period: {
        type: String,
        enum: ['montly', 'yearly', 'oneTime'],
        default: 'montly',
        required: true,
    },
    extraCharacters: {
        type: ExtraCharactersSchema,
        required: true,
        default: () => ({}),
    },
    pro: {
        type: Boolean,
        required: true,
        default: true,
    }
})

const Plan = mongoose.model('Plan', PlanSchema);

module.exports = Plan;