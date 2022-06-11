const mongoose = require('mongoose'),
    Schema = mongoose.Schema;

const TokenTradePairSchema = new Schema({
    owner: {
        type: String,
        unique: true,
        trim: true,
        required: true
    },
    typeTrade: {
        type: Boolean,
        required: true
    },
    info: {
        type: Object,
        required: true
    },
    created: {
        type: Date,
        default: Date.now
    },
});

mongoose.model('TokenTradePair', TokenTradePairSchema);