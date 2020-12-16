var express = require("express");
var app = express();
var bodyParser = require('body-parser');
var errorHandler = require('errorhandler');
var methodOverride = require('method-override');
var hostname = process.env.HOSTNAME || 'localhost';
var port = 8080;
const https = require("https");
const MS = require("mongoskin");
const db = MS.db("mongodb://localhost:27017/rakdata")

app.get("/", function (req, res) {
    res.redirect("index.html")
});

app.get("/getData", function (req, res) {
  var from = parseInt(req.query.from);
  var to = parseInt(req.query.to);
  var device_id = req.query.id
	console.log(device_id);
  console.log(to-from);
  db.collection("data").find({device_id:device_id,time:{$gt:from, $lt:to}}).sort({time:-1}).toArray(function(err, result){
    res.send(JSON.stringify(result));
  });
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
		 if(body.toString().length > 0){
		    var dps = JSON.parse(body.toString());
		    for(var i = 0; i < dps.length; i++){
			    dps[i].time = new Date(dps[i].time).getTime();
		    	db.collection("data").insert(dps[i], function(err, result){
				console.log("added");
			});
		    }
		}
	    });

	});

	req.end()
},4500);
