var https = require('https');
var fs = require('fs');
var options = {
key: fs.readFileSync("example_com.key"),
cert: fs.readFileSync("tourairguides_com.crt"),
ca: [
fs.readFileSync('comodorsaaddtrustca.crt'),
fs.readFileSync('tourairguides_com.ca-bundle')
]
};
https.createServer(options, function (req, res) {
res.writeHead(200);
res.end("Welcome to Node.js HTTPS Servern");
}).listen(8443)