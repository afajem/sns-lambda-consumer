/**
 * AWS Lambda function that subscribes to an SNS topic and writes the payload
 * received from the topic to a file on an S3 bucket.
 *
 * Event Flow:
 * 1. An SNS event is published to a topic
 * 2. The received message invokes the AWS Lambda function which subscribes to
 *    to the incoming message.
 * 3. The lambda function parses the message and writes it to a designated
 *     S3 bucket.
 *
 * @param event AWS event object containing event data
 * @param  context execution context of the function
 * @param callback Optional callback to return information to the caller.
*/

console.log('Loading function');

// AWS SDK
const AWS = require('aws-sdk');

//create and configure a new S3 client
let s3 = new AWS.S3();

exports.handler = function(event, context, callback) {
	"use strict";

	// Error out if the Lambda function was invoked from a non-SNS service
	console.log("EventSource = " + event.Records[0].EventSource);
 	if (event.Records[0].EventSource != "aws:sns") {
		var error = new Error("The service that invoked the function is not an Amazon SNS service. " +
			"Lambda function cannot successfully process the event payload.");
		callback(error);
	}

	//Assumes bucket in the the same region
	const bucketName = process.env.bucketName;

	//extract SNS message from lambda event
	let snsMessage = event.Records[0].Sns.Message;

	//Build S3 call
	var params = {
	  Body: snsMessage,
	  Bucket: bucketName,
	  Key: event.Records[0].Sns.Subject + "-" + event.Records[0].Sns.Timestamp + ".log"
	 };

	 //Upload object to S3 bucket
	 console.log("Logging SNS message to S3...");
	 
	 s3.putObject(params, function(err, data) {
	   if (err)
		 		console.log(err, err.stack); // an error occurred
	   else
		 		console.log("SNS message logged to S3: " + data);           // successful response
	 });


	callback(null, 'SNS Consumer Lambda function completed.');

}
