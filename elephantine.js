var AWS = require('aws-sdk');
var Dropbox = require('dropbox');

const simpleParser = require('mailparser').simpleParser;

var bucketName = process.env.BUCKET_NAME;
var keyPrefix = process.env.KEY_PREFIX;
var dropboxAccessToken = process.env.DROPBOX_ACCESS_TOKEN;

var s3 = new AWS.S3();
var dbx = new Dropbox({ accessToken: dropboxAccessToken });

exports.handler = function(event, context, callback) {
    console.log('Process email');

    var sesNotification = event.Records[0].ses;
    console.log("SES Notification:\n", JSON.stringify(sesNotification, null, 2));

    // Retrieve the email from your bucket
    s3.getObject({
	Bucket: bucketName,
	Key: keyPrefix + sesNotification.mail.messageId
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
		    var now = new Date().getTime();
		    note = {
			"type": "notes",
			"id": sesNotification.mail.messageId,
			"title": mail.subject,
			"content": mail.text,
			"taskAll": 0,
			"taskCompleted": 0,
			"created": now,
			"updated": now,
			"notebookId": "0",
			"tags": [],
			"isFavorite": 0,
			"trash": 0,
			"files": []}
		    dbx.filesUpload(
			{
			    path: '/notes-db/notes/' + sesNotification.mail.messageId + '.json',
			    contents: JSON.stringify(note)
			})
		        .then(function(response) {
			    console.log(response);
			})
		        .catch(function(error) {
			    console.error(error);
			});
		})
		.catch(err => {
		    console.log(err);
		});
	    callback(null, null);
	}
    });
};
