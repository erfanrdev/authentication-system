const express = require("express");
const swaggerUi = require("swagger-ui-express");
const swaggerJsdoc = require("swagger-jsdoc");
const app = express();
const authRoute = require("./routes/authRouter");
const mongoose = require("mongoose");
require("dotenv").config();
const User = require("./models/user");
const cookieParser = require("cookie-parser");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Authentication API Documentation",
      version: "1.0.0",
      description:
        "Sample Project for Authentication Management Using JWT and Cookies",
    },
    servers: [
      {
        url: process.env.SWAGGER_SERVER_URL,
        description: "Local Development Server",
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "توکن دسترسی(اکسس توکن) خود را وارد کنید",
        },
      },
    },
  },
  apis: ["./routes/*.js"],
};

const specs = swaggerJsdoc(options);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));

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
