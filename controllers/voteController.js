const Vote = require('../models/vote');
const Ballot = require('../models/ballot');
const User = require('../models/user');

exports.castVote = async (req, res) => {
    try {
        const { ballotId, candidate } = req.body;
        const voterId = req.user.id;

        // Check if the voter is eligible to vote
        const voter = await User.findById(voterId);
        if (!voter || voter.role === 'normal') {
            return res.status(403).json({ success: false, message: 'You are not authorized to vote' });
        }

        // Check if the voter has already voted on this ballot
        const existingVote = await Vote.findOne({ voter: voterId, ballot: ballotId });
        if (existingVote) {
            return res.status(400).json({ success: false, message: 'You have already voted on this ballot' });
        }

        // Check if the ballot exists and is within the voting period
        const ballot = await Ballot.findById(ballotId);
        if (!ballot) {
            return res.status(404).json({ success: false, message: 'Ballot not found' });
        }

        const now = new Date();
        if (now < ballot.startTime) {
            return res.status(400).json({ success: false, message: 'Voting has not started yet' });
        }

        if (now > ballot.endTime) {
            return res.status(400).json({ success: false, message: 'Voting time is expired' });
        }

        // Create a new vote
        const newVote = new Vote({
            voter: voterId,
            ballot: ballotId,
            candidate,
        });
        await newVote.save();

        res.status(201).json({ success: true, data: newVote });
    } catch (error) {
        res.status(500).json({ success: false, error })
    }
};
