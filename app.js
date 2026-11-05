const express = require("express");
const app = express();
const authRoute = require("./routes/authRouter");
const mongoose = require("mongoose");
require("dotenv").config();
const User = require("./models/user");
const cookieParser = require("cookie-parser");
app.use(express.json());

app.use(cookieParser());

app.use("/api/auth", authRoute);

mongoose
  .connect(process.env.MONGODB_URL)
  .then((result) => {
    app.listen(process.env.MONGODB_PORT, () => {
      console.log(`Listening on port ${process.env.MONGODB_PORT}`);
    });
  })
  .catch((err) => {
    console.log(err);
  });
