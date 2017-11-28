var AWS = require('aws-sdk');
var s3 = new AWS.S3();
const simpleParser = require('mailparser').simpleParser;

var bucketName = 'elephantine.cc';

exports.handler = function(event, context, callback) {
    console.log('Process email');

    var sesNotification = event.Records[0].ses;
    console.log("SES Notification:\n", JSON.stringify(sesNotification, null, 2));

    // Retrieve the email from your bucket
    s3.getObject({
	Bucket: bucketName,
	Key: "self/" + sesNotification.mail.messageId
    }, function(err, data) {
	if (err) {
	    console.log(err, err.stack);
	    callback(err);
	} else {
	    console.log("Raw email:\n" + data.Body);
	    simpleParser(data.Body)
		.then(mail => {
		    console.log("Subject: " + mail.subject);
		    console.log("Plain text:\n" + mail.text);
		})
		.catch(err => {
		    console.log(err);
		});
	    callback(null, null);
	}
    });
};
