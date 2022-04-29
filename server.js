// Initial server file
const express = require('express');
const connectDB = require('./config/db');

// Initialize instance of express
const app = express();

// Connect to the Atlas cloud database
connectDB();

// Initialize middleware
app.use(express.json({ extended: false }));

// Define Routes
app.use('/api/users', require('./routes/api/users'));
app.use('/api/trails', require('./routes/api/trails'));
app.use('/api/auth', require('./routes/api/auth'));

const PORT = process.env.PORT || 6000;

app.listen(PORT, () => console.log(`(1/2) Server spooled up on port ${PORT}`));
