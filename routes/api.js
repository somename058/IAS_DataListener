var http = require('http')
var querystring = require('querystring')
var dlHelper = require('../dlHelper')
var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var HashMap = require('hashmap');
router.get("/v1.0/data_listener/gateway_data",function(req,res,next){
   res.send("This is sample");
});


var queue = [],str;
var map = new HashMap();
var q = []
q.push([ { action_name: 'setFLpressure', action_cmd: 'car_tyre_pressure.setfl(55)' } ])
map.set("5714adcc5e84ef4848340301", q)
console.log(map)

router.post("/v1.0/data_listener/gateway_data",function(req, res, next){
    console.log("POST req received");
    var js_code = req.body.js_code;
    js_code = eval("x = "+js_code);
    var header = js_code.header;
    var sensorList = js_code["body"];
    var gateway_id = header.gateway_id;
    var sensor_ids = {};
    console.log(js_code);


    //console.log("Body: " + body);
    // 1. extract individual gateway item data
    // 2. validate depending on gatewayId
    // iterate over sensorLIst and validate

    // 3. create response object and add validation status

    var jsonres = require('../templates/dl-gateway.template.json')
    jsonres.header.message_id= new Date().getTime();
    jsonres.header.gateway_id = header.gateway_id
    jsonres.header.curr_message_response.status = "VALID"
    jsonres.header.curr_message_response.status_message = "Message validation success"

    var sid =  sensorList[1].sensor_id
    var type = sensorList[1].sensor_type
    jsonres.body[0].target_sensor_id = sid
    jsonres.body[0].sensor_type = type
    //var actions = [        {"action_name":"setFLpressure",  "action_cmd": type+".setfl(55)"}]
    var actions ="", queue = "";
    if(map.has(header.gateway_id))
    {
        console.log("sensor exists its queue, "+map.get(header.gateway_id));
        queue = map.get(header.gateway_id)
    }
    function getType(p) {
                  if (Array.isArray(p)) return 'array';
                  else if (typeof p == 'string') return 'string';
                  else if (p != null && typeof p == 'object') return 'object';
                  else return 'other';
              }
    if(getType(queue)=='array'){
        if(queue.length>0) {
            actions = queue.shift()
            console.log("Removed action from cmd queu for gid " + header.gateway_id + " " + actions)
        }
    }

    jsonres.body[0].action_data = actions
    



    

    // 4. add command from holding queue if any
    // 5. send the message to event server

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.write(JSON.stringify(jsonres) );
            res.end();
       
   
});

module.exports = router;