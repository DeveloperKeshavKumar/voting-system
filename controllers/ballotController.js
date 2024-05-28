const User = require('../models/user');
const Ballot = require('../models/ballot');
const upload = require('../utils/multer');

// Function to validate candidates
const validateCandidates = async (candidates, reqFiles) => {
    const validCandidates = [];
    const errors = [];

    for (let i = 0; i < candidates.length; i++) {
        const candidate = candidates[i];
        const politician = await User.findOne({ name: candidate.name, role: 'politician' });

        if (!politician) {
            errors.push(`Candidate ${candidate.name} is not a registered politician.`);
            continue;
        }

        // Assign the uploaded symbol path to the candidate
        if (reqFiles && reqFiles[i]) {
            candidate.symbol = reqFiles[i].path;
        }

        validCandidates.push(candidate);
    }

    return { validCandidates, errors };
};

// Function to create a new ballot
exports.createBallot = (req, res) => {
    upload(req, res, async (err) => {
        if (err) {
            return res.status(400).json({ success: false, message: err });
        }

        try {
            const { electionName, candidates, startTime, endTime } = req.body;
            const createdBy = req.user.id;

            if (!electionName || !candidates || !startTime || !endTime) {
                return res.status(400).json({ success: false, message: 'All fields are required.' });
            }

            let candidatesArray = JSON.parse(candidates);

            // Parse and validate dates
            const parsedStartTime = new Date(startTime);
            const parsedEndTime = new Date(endTime);

            if (isNaN(parsedStartTime.getTime()) || isNaN(parsedEndTime.getTime())) {
                return res.status(400).json({ success: false, message: 'Invalid date format.' });
            }

            // Validate candidates
            const { validCandidates, errors } = await validateCandidates(candidatesArray, req.files);

            if (validCandidates.length === 0) {
                return res.status(400).json({ success: false, message: 'No valid candidates provided.', errors });
            }

            // Check for existing candidates in ballots
            const existingCandidates = await Ballot.find({electionName, 'candidates.name': { $in: validCandidates.map(candidate => candidate.name) } });
            if (existingCandidates.length > 0) {
                const duplicateCandidates = validCandidates.filter(candidate => existingCandidates.some(existingCandidate => existingCandidate.candidates.some(c => c.name === candidate.name)));
                const errorMessage = duplicateCandidates.map(candidate => `Candidate ${candidate.name} already exists in ${electionName} ballot.`);
                return res.status(400).json({ success: false, message: errorMessage, errors });
            }

            // Create the new ballot with valid candidates
            const newBallot = new Ballot({ electionName, candidates: validCandidates, startTime: parsedStartTime, endTime: parsedEndTime, createdBy });
            await newBallot.save();

            res.status(201).json({ success: true, data: newBallot, errors });
        } catch (error) {
            console.error('Error:', error);
            res.status(500).json({ success: false, error: 'Internal server error' });
        }
    });
};

// Get all ballots
exports.getBallots = async (req, res) => {
    try {
        const ballots = await Ballot.find();
        res.status(200).json({ success: true, data: ballots });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
};

// Get a ballot by ID
exports.getBallotById = async (req, res) => {
    try {
        const ballot = await Ballot.findById(req.params.id);
        if (!ballot) {
            return res.status(404).json({ success: false, error: 'Ballot not found' });
        }
        res.status(200).json({ success: true, data: ballot });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
};

// Update a ballot by ID
exports.updateBallot = (req, res) => {
    upload(req, res, async (err) => {
        if (err) {
            return res.status(400).json({ success: false, message: err });
        }

        try {
            const ballotId  = req.params.id;
            console.log("BallotID: ",req.params.id);
            const { electionName, candidates, startTime, endTime } = req.body;
            const updatedBy = req.user.id;

            if (!electionName || !candidates || !startTime || !endTime) {
                return res.status(400).json({ success: false, message: 'All fields are required.' });
            }

            let candidatesArray = JSON.parse(candidates);

            // Parse and validate dates
            const parsedStartTime = new Date(startTime);
            const parsedEndTime = new Date(endTime);

            if (isNaN(parsedStartTime.getTime()) || isNaN(parsedEndTime.getTime())) {
                return res.status(400).json({ success: false, message: 'Invalid date format.' });
            }

            // Validate candidates
            const { validCandidates, errors } = await validateCandidates(candidatesArray, req.files);

            // Check for existing candidates in the same election, excluding the current ballot
            const existingCandidates = await Ballot.find({ _id: { $ne: ballotId }, electionName, 'candidates.name': { $in: validCandidates.map(candidate => candidate.name) } });
            if (existingCandidates.length > 0) {
                const duplicateCandidates = validCandidates.filter(candidate => existingCandidates.some(existingCandidate => existingCandidate.candidates.some(c => c.name === candidate.name)));
                duplicateCandidates.forEach(candidate => {
                    const errorMessage = `Candidate ${candidate.name} already exists in the ballot for this election.`;
                    errors.push(errorMessage);
                });

                if (errors.length > 0) {
                    return res.status(400).json({ success: false, message: 'Duplicate candidates found.', errors });
                }
            }

            if (validCandidates.length === 0) {
                return res.status(400).json({ success: false, message: 'No valid candidates provided.', errors });
            }

            // Update the ballot with valid candidates
            const updatedBallot = await Ballot.findByIdAndUpdate(ballotId, { electionName, candidates: validCandidates, startTime: parsedStartTime, endTime: parsedEndTime, updatedBy }, { new: true });

            if (!updatedBallot) {
                return res.status(404).json({ success: false, message: 'Ballot not found.' });
            }

            res.status(200).json({ success: true, data: updatedBallot, errors });
        } catch (error) {
            console.error('Error:', error);
            res.status(500).json({ success: false, error: 'Internal server error' });
        }
    });
};

// Delete a ballot by ID
exports.deleteBallot = async (req, res) => {
    try {
        const ballot = await Ballot.findById(req.params.id);

        if (!ballot) {
            return res.status(404).json({ success: false, error: 'Ballot not found' });
        }

        await ballot.deleteOne(); // Use deleteOne instead of remove
        res.status(200).json({ success: true, message: 'Ballot removed' });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
};

