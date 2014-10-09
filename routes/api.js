var express = require('express');
var router = express.Router();

var util = require('../utils/util');

var pathSeperator ='/';
var base_path='/api/v0001';
var historian_path =  base_path + pathSeperator + 'historian';
var organizations_path= base_path + pathSeperator + 'organizations';
var getdevices_path = 'devices';


//Org APIs
// api to get info of a org
router.get('/organization', function(req, res) {

  var orgId = req.session.api_key.split(':')[1];
  console.log("Info for orgId "+orgId); 
  
  var uri= organizations_path + pathSeperator + orgId;

  util.iot_httpCall(uri, req.session.api_key, req.session.auth_token, res, null, true);
  
});

// api to get devices of a org
router.get('/organization/getdevices', function(req, res) {

  var orgId = req.session.api_key.split(':')[1];
  console.log("Fetching the devices for orgId "+orgId); 
  
  var uri= organizations_path + pathSeperator + orgId + pathSeperator + getdevices_path;

  util.iot_httpCall(uri, req.session.api_key, req.session.auth_token, res);
  
});

//Historian APIs

//get historical data of a org
router.get('/historian/:orgId', function(req, res) {

  var orgId = req.params.orgId;

  console.log("Fetching the historian data  for orgId "+orgId); 
  
  var uri= historian_path + pathSeperator + orgId ;

  util.iot_httpCall(uri, req.session.api_key, req.session.auth_token, res, req.query);
  
});

//get historical data of a deviceType of a org
router.get('/historian/:orgId/:deviceType', function(req, res) {

  var orgId = req.params.orgId;
  var deviceType = req.params.deviceType;

  console.log("Fetching the historian data  for orgId "+orgId+" for deviceType : "+deviceType); 
  
  var uri= historian_path + pathSeperator + orgId + pathSeperator + deviceType;

  util.iot_httpCall(uri, req.session.api_key, req.session.auth_token, res, req.query);
  
});

//get historical data of a device of particular deviceType
router.get('/historian/:orgId/:deviceType/:deviceId', function(req, res) {

  var orgId = req.params.orgId;
  var deviceType = req.params.deviceType;
  var deviceId= req.params.deviceId;

  console.log("Fetching the historian data  for orgId "+orgId+" for device : "+deviceId);
    
  var uri= historian_path + pathSeperator + orgId + pathSeperator + deviceType +  pathSeperator + deviceId;

  util.iot_httpCall(uri, req.session.api_key, req.session.auth_token, res, req.query);
  
});


module.exports = router;