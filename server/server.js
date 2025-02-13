require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');


const taskRoutes = require('./routes/task');
const userRoutes = require('./routes/user');

// Express app
const app = express();

const allowedOrigins = [
  'https://quibly.net', // No trailing slash
  'http://localhost:3000',
  // other domains...
];


// CORS configuration
app.use(cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, origin);
      } else {
        return callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  }));

// Middleware
app.use(express.json());

app.use((req, res, next) => {
    // console.log(`Incoming request: ${req.method} ${req.path}`);
    console.log(`Incoming request: ${req.method} ${req.path}, Body:`, req.body);
    next();
});
// Routes
app.use('/api/tasks', taskRoutes);
app.use('/api/user', userRoutes);


// Connect to DB and start server
mongoose.connect(process.env.MONG_URI)
    .then(() => {
        console.log('Connected to MongoDB');
        app.listen(process.env.PORT, () => {
            console.log(`Server running on port ${process.env.PORT}`);
        });
    })
    .catch((error) => {
        console.error('MongoDB connection error:', error.message);
    });
