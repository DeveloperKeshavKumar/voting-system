const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ballotSchema = new Schema({
    electionName: {
        type: String,
        required: true,
    },
    candidates: [
        {
            name: {
                type: String,
                required: true,
            },
            party: {
                type: String,
                required: true,
            },
            symbol: {
                type: String,
                required: true,
            }
        },
    ],
    startTime: {
        type: Date,
        required: true,
    },
    endTime: {
        type: Date,
        required: true,
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
}, { timestamps: true });

module.exports = mongoose.model('Ballot', ballotSchema);
