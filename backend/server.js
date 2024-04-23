require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Task = require('./models/taskModel');

const scheduleRoutes = require('./routes/schedule');
const taskRoutes = require('./routes/task');
const userRoutes = require('./routes/user');
const noteRoutes = require('./routes/note');

// Express app
const app = express();

const allowedOrigins = [
  'https://quibly.net', // No trailing slash
  'http://localhost:3000',
  // other domains...
];


// CORS configuration
app.use(cors({
  origin: '*', // Allow all origins
  credentials: true, // Allow credentials
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
app.use('/api/notes', noteRoutes);

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
