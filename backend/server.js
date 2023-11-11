require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Task = require('./models/taskModel');

const scheduleRoutes = require('./routes/schedule');
const taskRoutes = require('./routes/task');
const userRoutes = require('./routes/user');

// Express app
const app = express();

// Allowed origins for CORS
const allowedOrigins = [
  'https://quantumix.net', // Your Netlify domain
  'http://localhost:3000', // Your local development domain
  // You can add any other domains you want to whitelist here
];

// CORS configuration
app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true); // Allow requests with no origin (like mobile apps, curl, etc.)
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true, // Allow sending credentials like cookies and HTTP authentication
}));

// Middleware
app.use(express.json());

app.use((req, res, next) => {
    // console.log(`Incoming request: ${req.method} ${req.path}`);
    console.log(`Incoming request: ${req.method} ${req.path}, Body:`, req.body);
    next();
});
// Routes
app.use('/api/schedule', scheduleRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/user', userRoutes);

// Connect to DB and start server
mongoose.connect(process.env.MONG_URI)
    .then(() => {
        app.listen(process.env.PORT, () => {
            // console.log('Connected to DB & Listening on port', process.env.PORT);
        })
    })
    .catch((error) => {
        console.error('Connection to DB failed:', error);
    });
