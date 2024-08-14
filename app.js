require("dotenv").config({ path: "./config/.env" });
require("winston-mongodb");
const rateLimit = require("express-rate-limit");
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const { PORT } = process.env;
const routes = require("./routes/index");
const router1 = require("./routes/landingApi");
const cors = require("cors");
const { swaggerServe, swaggerSetup } = require("./config/config");
const expressWinston = require("express-winston");
const logger = require("./helpers/logger");

app.use(
	expressWinston.logger({
		winstonInstance: logger,
		statusLevels: true,
	})
);
app.use("/api-docs", swaggerServe, swaggerSetup);
app.use(cors({ origin: "*" }));
app.options("*", cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use("/v1", routes); // Used for APIs which require token
app.use("/v2", router1); // Used for APIs which do not require token

app.get("/", (req, res) => {
	res.send("Brant Ford India - V1.0.1");
});

const limiter = rateLimit({
	windowMs: 1000,
	max: 10,
});
app.use(limiter);

module.exports = app;
