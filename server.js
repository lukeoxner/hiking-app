// Initial server file
const express = require('express');
const connectDB = require('./config/db');

// Initialize instance of express
const app = express();

// Connect to the Atlas cloud database
connectDB();

// Test API route
app.get('/', (req, res) => res.send('API Running'));

const PORT = process.env.PORT || 6000;

app.listen(PORT, () => console.log(`Server spooled up on port ${PORT}`));
