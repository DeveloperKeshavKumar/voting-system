const User = require('../models/user');

const verifyUsersForRole = async (role, req, res) => {
    try {
        const users = await User.find({ role });

        // Array to store verification results for each user
        const verificationResults = [];

        for (const user of users) {
            if (user.verification === 'in-process') {
                const docsVerified = req.body[user._id]?.documentsVerified;
                const verification = docsVerified ? 'success' : 'failed';

                // Update verification status in the database
                await User.findByIdAndUpdate(user._id, { verification });

                // Create notification
                const notification = {
                    title: 'Verification Status Updated',
                    message: `Your verification status has been updated to: ${verification}`,
                    type: 'verification',
                    timestamp: new Date(),
                };

                // Add notification to user's notifications
                user.notifications.push(notification);
                await user.save();

                // Store verification result
                verificationResults.push({ user: user.name, verification });
            }
        }

        // Send response after processing all users
        res.status(200).json({ success: true, verificationResults });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
}

exports.verifyVoters = async (req, res) => {
    await verifyUsersForRole('voter', req, res);
}

exports.verifyPoliticians = async (req, res) => {
    await verifyUsersForRole('politician', req, res);
}

exports.verifyElectoralHead = async (req, res) => {
    await verifyUsersForRole('electoral_head', req, res);
}
