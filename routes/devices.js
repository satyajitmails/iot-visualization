var express = require('express');
var router = express.Router();

var https = require('https');

//Basic properties for historian queries
var iot_foundation_api_options = {
  hostname: 'internetofthings.ibmcloud.com',
  port: 443,
  rejectUnauthorized: false
};

/* GET realtime page. */
router.get('/', function(req, resp) {
  console.log("came ++++");
  iot_foundation_api_options.auth="a:zbicf:jqvgu9f53a" + ':' + "F(9eJikPIyI067r!+M";
  iot_foundation_api_options.path="/api/v0001/organizations/zbicf/devices";

var request = https.request(iot_foundation_api_options, function(res) {
  console.log("statusCode: ", res.statusCode);
  var devicesRes = [];
  res.on('data', function(chuck) {
    devicesRes.push(chuck);
  });

  res.on('end', function(d) {
    var deviceRespJson = JSON.parse(devicesRes.join(''));
    resp.json(deviceRespJson);
  });

});
request.end();

request.on('error', function(e) {
  console.error(e);
});

  
});

module.exports = router;