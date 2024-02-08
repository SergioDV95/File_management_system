const express = require('express');
require('dotenv').config();
const app = express();
const cors = require('cors');
const mongoose = require('mongoose');
const filesRouter = require('./Routes/Files');
//agregar el array de IPs permitidas
const corsOptions = {
   origin: [/localhost/],
   credentials: true,
   methods: 'GET,PATCH,POST,DELETE',
   allowedHeaders: ['Content-Type', 'Authorization']
}

mongoose.connect(process.env.CONN, {
   dbName: process.env.DB
}).then(
   () => console.log('MongoDB connected'),
   err => console.log(err)
);

app.use(cors(corsOptions));

app.use(express.json());
app.use("/uploads", express.static("uploads"));
app.use("/files", filesRouter);

app.listen(parseInt(process.env.PORT), () => console.log(`Server running on port ${process.env.PORT}`));