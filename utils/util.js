// export
var util = {};

var https = require('https');

//Basic HTTP options for Internet of Things Foundation
var iot_foundation_api_options = {
  hostname: 'internetofthings.ibmcloud.com',
  port: 443,
  rejectUnauthorized: false
};

util.iot_httpCall = function( URI, api_key, auth_token, res, sendCred){
  
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
        if(sendCred){
          result.api_key = api_key;
          result.auth_token = auth_token;
        }
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

module.exports = util;