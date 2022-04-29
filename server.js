// Initial server file
const express = require('express');
// const connectDB = require('./config/db');

const app = express();

app.get('/', (req, res) => res.send('API Running'));

const PORT = process.env.PORT || 6000;

app.listen(PORT, () => console.log(`Server spooled up on port ${PORT}`));
