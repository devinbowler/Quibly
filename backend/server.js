require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const Task = require('./models/taskModel'); 

const scheduleRoutes = require('./routes/schedule')
const taskRoutes = require('./routes/task')
const userRoutes = require('./routes/user')


// Express app
const app = express();

// Miiddleware
app.use(express.json())

app.use((req, res, next) => {
    console.log(req.path, req.method)
    next()
})

// Routes
app.use('/api/schedule', scheduleRoutes)
app.use('/api/tasks', taskRoutes)
app.use('/api/user', userRoutes)

// connect to db
mongoose.connect(process.env.MONG_URI)
    .then(() => {
        // listen for requests
        app.listen(process.env.PORT, () => {
            console.log('Connected to DB: Port', process.env.PORT)
    })
    })
    .catch((error) => {
        console.log(error)
    })