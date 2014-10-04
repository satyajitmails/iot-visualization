var express = require('express');
var router = express.Router();

var https = require('https');

var base_path='/api/v0001/';
var historian_path =  base_path + 'historian/';
var organizations_path= base_path + 'organizations/';
var getdevices_path = '/devices';

// api to get info of a org
router.get('/organization', function(req, res) {

  var orgId = req.session.api_key.split(':')[1];
  console.log("Fetching the devices for orgId "+orgId); 
  
  var uri= organizations_path + orgId;

  iot_httpCall(uri, req.session.api_key, req.session.auth_token, res);
  
});

// api to get devices of a org
router.get('/organization/getdevices', function(req, res) {

  var orgId = req.session.api_key.split(':')[1];
  console.log("Fetching the devices for orgId "+orgId); 
  
  var uri= organizations_path + orgId + getdevices_path;

  iot_httpCall(uri, req.session.api_key, req.session.auth_token, res);
  
});

//Basic HTTP options for Internet of Things Foundation
var iot_foundation_api_options = {
  hostname: 'internetofthings.ibmcloud.com',
  port: 443,
  rejectUnauthorized: false
};

iot_httpCall = function( URI, api_key, auth_token, res){
  
  iot_foundation_api_options.auth=api_key + ':' + auth_token;
  iot_foundation_api_options.path=URI;
  
  var http_req = https.get(iot_foundation_api_options, function(http_res) {
    var data = [];
    //check for http success
    if (http_res.statusCode==200)
    {
      http_res.on('data', function(chunk) {
        data.push(chunk);
        
      });

      http_res.on('end',function(){
        var result = JSON.parse(data.join(''));
        // send the response
        res.json(result);
      });
    }
    else
    {
      console.log('Request for ' + iot_foundation_api_options.path + ' did not succeed and returned HTTP Status code ' + http_res.statusCode);
      //pass the status code to the http response
      res.status(http_res.statusCode).send();
    }

  });
  http_req.end();
  http_req.on('error', function(e) {
    console.log('Request for ' + iot_foundation_api_options.path + ' failed with : \n'+ e);
    res.status(500).send(e);
  });


};

module.exports = router;