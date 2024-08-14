/* eslint-disable */
require("dotenv").config({ path: "./config/.env" });
const { MongoClient } = require("mongodb");
var elasticsearch = require("elasticsearch");

var elasticClient = new elasticsearch.Client({
	host: process.env.ELASTIC_HOST,
	httpAuth: process.env.ELASTIC_AUTH,
	log: "info",
});
var dataInArray = [];

/***
 * @description Change this constant and run this file... And the data will be synced. MONGO->ELASTIC
 * @caution Please do not change anything just change the constant object safely and run the file.
 */
const constant = {
	MONGODB_NAME: "development",
	MONGO_COLLECTION_NAME: "buildings",
	SYNC_WITH_ELASTIC_INDEX_NAME: "buildings",
};

MongoClient.connect(
	process.env.DATABASE_URL,
	{ useNewUrlParser: true },
	(err, connection) => {
		if (err) {
			console.log(`MongoDB error connecting to `, err.message);
		}
		console.log("connect mongodb sucessfully.");

		var db = connection.db(constant.MONGODB_NAME);
		db.collection(constant.MONGO_COLLECTION_NAME)
			.find({})
			.toArray((err, result) => {
				console.log("total err :", err);
				var i = 0;
				result && result.length
					? console.log("Processing ....Please wait...")
					: console.log(
							"There is no data to sync please check the CONSTANT configuration."
					  );
				result.forEach((element) => {
					dataInArray.push({
						index: {
							_index: constant.SYNC_WITH_ELASTIC_INDEX_NAME,
							_type: "_doc",
							_id: element._id.toString(),
						},
					});
					delete element._id;
					dataInArray.push(element);
					console.log("i : ", i++);
				});
				console.log(
					"Syncing This much of data....   ",
					dataInArray.length
				);
				if (dataInArray.length) {
					elasticClient.bulk(
						{
							body: dataInArray,
						},
						function (err, resp, status) {
							console.log("err ", err);
							console.log("resp : ", JSON.stringify(resp));
							console.log("status :", status);
							console.log("Data Synced Successfully");
						}
					);
				}
			});
	}
);
