var express = require("express");
var app = express();
var bodyParser = require('body-parser');
var errorHandler = require('errorhandler');
var methodOverride = require('method-override');
var hostname = process.env.HOSTNAME || 'localhost';
var port = 1234;
const https = require("https");

app.get("/", function (req, res) {
    res.redirect("index.html")
});

app.use(
  express.urlencoded({
    extended: true
  })
);
app.use(express.json());
app.use(methodOverride());
app.use(bodyParser());
app.use(express.static(__dirname + '/public'));
app.use(errorHandler());

console.log("Simple static server listening at http://" + hostname + ":" + port);
app.listen(port);


setInterval(function(){
	const options = {
	    "method": "GET",
	    "hostname": "raksensors.data.thethingsnetwork.org",
	    "port": 443,
	    "path": "/api/v2/query?last=5s",
	    "headers": {
	      "Accept": "application/json",
	      "Authorization":"key ttn-account-v2.jNNxl6FFP5WrkPqxEpY-HH70L1BcW8LAsXGGFhYA3yQ"
	    }
	}

	const req = https.request(options, function(res) {

	    var chunks = [];

	    res.on("data", function (chunk) {
		chunks.push(chunk);
	    });

	    res.on("end", function() {
		var body = Buffer.concat(chunks);
		console.log(body.toString());
	    });

	});

	req.end()
},4500);
