const mongoose = require("mongoose");
const { DATABASE_URL } = process.env;

mongoose.set("strictQuery", false);

mongoose.connect(DATABASE_URL, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
	socketTimeoutMS: 0,
	keepAlive: true,
});

console.log("MongoDb Connection: ", DATABASE_URL);

mongoose.connection.on("connected", function () {
	console.log("Mongoose default connection open to " + DATABASE_URL);
});

mongoose.connection.on("error", function (err) {
	console.log("Mongoose default connection error: " + err);
});

mongoose.connection.on("disconnected", function () {
	console.log("Mongoose default connection disconnected");
});
