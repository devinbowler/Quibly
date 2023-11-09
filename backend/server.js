require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors');
const Task = require('./models/taskModel');

const scheduleRoutes = require('./routes/schedule')
const taskRoutes = require('./routes/task')
const userRoutes = require('./routes/user')

// Express app
const app = express();

// Allowed origins
const allowedOrigins = [
  'https://your-frontend-domain.netlify.app',
  'http://localhost:3000', // Add your local development origin here
  // ... any other domains you want to whitelist
];

// CORS configuration
app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      var msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true,
}));

// Middleware
app.use(express.json())

app.use((req, res, next) => {
    console.log(req.path, req.method)
    next()
})

// Routes
app.use('/api/schedule', scheduleRoutes)
app.use('/api/tasks', taskRoutes)
app.use('/api/user', userRoutes)

// connect to db and start server
mongoose.connect(process.env.MONG_URI)
    .then(() => {
        // listen for requests
        app.listen(process.env.PORT, () => {
            console.log('Connected to DB & Listening on port', process.env.PORT)
        })
    })
    .catch((error) => {
        console.log(error)
    })
