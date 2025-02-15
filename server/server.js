require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');


const taskRoutes = require('./routes/task');
const userRoutes = require('./routes/user');

// Express app
const app = express();

/*const allowedOrigins = [
  'https://quibly.net', // No trailing slash
  'https://quibly.net/register',
  'https://quibly.net/login',
  'http://localhost:3000',
  // other domains...
];*/

// CORS configuration
// CORS configuration: allow all origins by reflecting the request's origin
app.use(cors({
    origin: true,        // Reflect the request's origin
    credentials: true,   // Allow credentials
}));

// Explicitly handle all OPTIONS requests
app.options('*', (req, res) => {
    // console.log('Received OPTIONS request:', req.path);
    res.header("Access-Control-Allow-Origin", req.headers.origin || "*");
    res.header("Access-Control-Allow-Credentials", "true");
    res.header("Access-Control-Allow-Methods", "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    res.sendStatus(200);
  });
  
  

// Middleware
app.use(express.json());

app.use((req, res, next) => {
    // console.log(`Incoming request: ${req.method} ${req.path}`);
    // console.log(`Incoming request: ${req.method} ${req.path}, Body:`, req.body);
    next();
});
// Routes
app.use('/api/tasks', taskRoutes);
app.use('/api/user', userRoutes);


// Connect to DB and start server
mongoose.connect(process.env.MONG_URI)
    .then(() => {
        // console.log('Connected to MongoDB');
        app.listen(process.env.PORT, () => {
            // console.log(`Server running on port ${process.env.PORT}`);
        });
    })
    .catch((error) => {
        console.error('MongoDB connection error:', error.message);
    });
