const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const voteSchema = new Schema({
    voter: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    ballot: {
        type: Schema.Types.ObjectId,
        ref: 'Ballot',
        required: true,
    },
    candidate: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
}, { timestamps: true });

module.exports = mongoose.model('Vote', voteSchema);
