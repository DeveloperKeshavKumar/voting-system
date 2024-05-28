const mongoose = require('mongoose');
const { ObjectId } = mongoose.Types;

const Vote = require('../models/vote');
const Ballot = require('../models/ballot');
const User = require('../models/user'); // Import the User model

exports.getResults = async (req, res) => {
  try {
    const { ballotId } = req.params;

    // Check if the ballot exists
    const ballot = await Ballot.findById(ballotId);
    if (!ballot) {
      return res.status(404).json({ success: false, message: 'Ballot not found' });
    }

    // Get the total number of eligible voters (users with roles other than 'normal')
    const totalVoters = await User.countDocuments({ role: { $ne: 'normal' } });

    // Aggregate the votes for the given ballot
    const voteCounts = await Vote.aggregate([
      { $match: { ballot: mongoose.Types.ObjectId.createFromHexString(ballotId)  } },
      { $group: { _id: '$candidate', count: { $sum: 1 } } },
      { $sort: { count: -1 } } // Sort by the number of votes in descending order
    ]);

    // Calculate total number of votes
    const totalVotes = voteCounts.reduce((total, vote) => total + vote.count, 0);

    // Calculate results by number of votes for table display
    const resultsByCount = voteCounts.map(vote => ({
      candidate: vote._id,
      count: vote.count,
      percentage: (vote.count / totalVotes) * 100
    }));

    // Calculate results by percentage for pie chart display
    const resultsByPercentage = voteCounts.map(vote => ({
      candidate: vote._id,
      count: vote.count,
      percentage: (vote.count / totalVotes) * 100
    }));

    // Calculate the number of users who did not vote
    const votersWhoDidNotVote = totalVoters - totalVotes;

    res.status(200).json({ 
      success: true, 
      totalVotes: totalVotes,
      totalVoters: totalVoters,
      votersWhoDidNotVote: votersWhoDidNotVote,
      resultsByCount: resultsByCount, 
      resultsByPercentage: resultsByPercentage 
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};
