const express = require("express");
require("dotenv").config();
const app = express();
const cors = require("cors");
const mongoose = require("mongoose");
const filesRouter = require("./Routes/Files");
const authenticate = require("./Controllers/Authenticate");

mongoose
  .connect(process.env.CONN, {
    dbName: process.env.DB,
  })
  .then(
    () => console.log("MongoDB connected"),
    (err) => console.log(err)
  );

// Permitir solicitudes CORS desde un origen específico con credenciales
const corsOptions = {
  origin: "http://localhost:5173",
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  preflightContinue: false,
  optionsSuccessStatus: 204,
  allowedHeaders: ["Content-Type", "Authorization", "parameter"],
  credentials: true,
};

app.use(cors(corsOptions));
app.use(authenticate);

app.use(express.json());
app.use("/uploads", express.static("uploads"));
app.use("/files", filesRouter);

app.listen(parseInt(process.env.PORT), () =>
  console.log(`Server running on port ${process.env.PORT}`)
);

app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});
