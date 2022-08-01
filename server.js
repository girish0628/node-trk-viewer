// server.js

// init project
var express = require("express");
var app = express();
var proxy = require("express-http-proxy");

// http://expressjs.com/en/starter/static-files.html
app.use(express.static("dist"));
app.use("/openanatomy.org", proxy("www.openanatomy.org"));

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function(request, response) {
  response.sendFile(__dirname + "/dist/index.html");
});

// listen for requests :)
var listener = app.listen(process.env.PORT || 4000, function() {
  console.log("Your app is listening on port " + listener.address().port);
});
