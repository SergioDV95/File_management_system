const express = require('express');
require('dotenv').config();
const app = express();
const cors = require('cors');
const mongoose = require('mongoose');
const corsOptions = {
   origin: [/localhost/],
   credentials: true,
   methods: 'GET,PATCH,POST,DELETE',
   allowedHeaders: ['Content-Type']
}

mongoose.connect(process.env.CONN, {
   dbName: process.env.DB
}).then(
   () => console.log('MongoDB connected'),
   err => console.log(err)
);

app.use(cors(corsOptions));

app.listen(parseInt(process.env.PORT), () => console.log(`Server running on port ${process.env.PORT}`));