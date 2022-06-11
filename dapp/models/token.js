const mongoose = require('mongoose'),
    Schema = mongoose.Schema;


const TokenSchema = new Schema({
    tokenName: {
        type: String,
        unique: true,
        // lowercase: true,
        trim: true,
        required: true
    },
    symbol: {
        type: String,
        unique: true,
        trim: true,
        required: true
    },
    address: {
        type: String,
        trim: true,
        required: true
    },
    image: {
        type: String,
        required: true,
    },
    created: {
        type: Date,
        default: Date.now
    }
});


mongoose.model('Token', TokenSchema);