const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const xss = require('xss-clean');
const mongoSanitize = require('express-mongo-sanitize');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const authRoutes = require('./routes/authRoutes');
const verifyRoles = require("./routes/verifyRoles");
const { errorHandler } = require('./middlewares/errorMiddleware');
const ballotRoutes = require('./routes/ballotRoutes');

// Load environment variables
require('dotenv').config();

// Database connection
require("./config/db").connectDB();

// Initialize express app
const app = express();

// Middleware setup
app.use(express.json());
app.use(helmet());
app.use(morgan('common'));
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 })); // 15 minutes, 100 requests
app.use(xss());
app.use(mongoSanitize());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

if (process.env.NODE_ENV === 'production') {
    app.set('trust proxy', 1); // trust first proxy
}

// Routes
app.use('/api/auth', authRoutes);
app.use('/api', verifyRoles);
app.use('/api/ballots', ballotRoutes);

// Error handler middleware
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
