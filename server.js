require('dotenv').config({ path: './backend/.env' });
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const connectDB = require('./backend/config/db');

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('frontend')); // Serve frontend files

// Database Connection
connectDB();

// Routes Placeholder
app.use('/auth', require('./backend/routes/authRoutes'));
app.use('/tasks', require('./backend/routes/taskRoutes'));
app.use('/analytics', require('./backend/routes/analyticsRoutes'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
