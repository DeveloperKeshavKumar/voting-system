// Voter validation function
function validateVoter(user) {;
    const age = calculateAge(user.dateOfBirth);
    return age >= 18;
}

// Politician validation function
function validatePolitician(user) {
    const age = calculateAge((user.dateOfBirth));
    const ongoingCriminalRecords = JSON.parse(user.criminalRecords).filter(record => record.status === 'ongoing').length;
    const endedCriminalRecords = JSON.parse(user.criminalRecords).filter(record => record.status === 'ended').length;
    console.log(age>=30, age)
    return age >= 30 && ongoingCriminalRecords + endedCriminalRecords > 0 && user.assets > 0 && user.education;
}

// Electoral Head validation function
function validateElectoralHead(user) {
    const age = calculateAge(user.dateOfBirth);
    const ongoingCriminalRecords = JSON.parse(user.criminalRecords).filter(record => record.status === 'ongoing').length;
    const endedCriminalRecords = JSON.parse(user.criminalRecords).filter(record => record.status === 'ended').length;
    return age >= 45 && ongoingCriminalRecords === 0 && endedCriminalRecords <= 5 && user.assets > 0 && user.education;
}

// Helper function to calculate age from date of birth
function calculateAge(dateOfBirth) {
    const today = new Date();
    const birthDate = new Date(dateOfBirth.trim());
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
}

// Export validation functions
module.exports = {
    validateVoter,
    validatePolitician,
    validateElectoralHead
};