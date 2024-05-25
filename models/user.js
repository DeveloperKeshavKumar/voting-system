const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Define the notification schema
const notificationSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  read: {
    type: Boolean,
    default: false,
  },
});

// Define the user schema
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['normal', 'voter', 'politician', 'electoral_head'],
    default: 'normal',
  },
  verification: {
    type: String,
    enum: ['in-process', 'success', 'failed'],
    default: 'in-process'
  },
  dateOfBirth: {
    type: Date,
    required: true,
  },
  age: {
    type: Number,
  },
  criminalRecords: [
    {
      status: {
        type: String,
        enum: ['ongoing', 'ended'],
        required: function () {
          return this.role === 'politician' || this.role === 'electoral_head';
        }
      }
    }
  ],
  assets: {
    type: Number,
    required: function () {
      return this.role === 'politician' || this.role === 'electoral_head';
    }
  },
  education: {
    type: String,
    required: function () {
      return this.role === 'politician' || this.role === 'electoral_head';
    }
  },
  photoUrl: {
    type: String,
    required: true,
  },
  personalDocUrl: {
    type: String,
    required: function () {
      return this.role === 'voter' || this.role === 'politician' || this.role === 'electoral_head';
    },
  },
  incomeDocUrl: {
    type: String,
    required: function () {
      return this.role === 'politician' || this.role === 'electoral_head';
    }
  },
  affidavitforcrimesUrl: {
    type: String,
    required: function () {
      return this.role === 'politician' || this.role === 'electoral_head';
    }
  },
  educationDocUrl: {
    type: String,
    required: function () {
      return this.role === 'politician' || this.role === 'electoral_head';
    }
  },
  partyName: {
    type: String,
    required: function () {
      return this.role === 'politician';
    }
  },
  partySymbol: {
    type: String,
    required: function () {
      return this.role === 'politician';
    }
  },
  notifications: [notificationSchema],
}, { timestamps: true });


// Pre-save hook to hash the password before saving the user
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Calculate age before saving the user
userSchema.pre('save', function (next) {
  const dob = this.dateOfBirth;
  const ageDifMs = Date.now() - dob.getTime();
  const ageDate = new Date(ageDifMs);
  this.age = Math.abs(ageDate.getUTCFullYear() - 1970);
  next();
});

module.exports = mongoose.model('User', userSchema);
