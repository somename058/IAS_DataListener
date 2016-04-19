var http = require('http')
var querystring = require('querystring')
var dlHelper = require('../dlHelper')
var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var HashMap = require('hashmap');
var request = require('request');
var config = require('../utils/servers.js')

router.get("/v1.0/data_listener/gateway_data",function(req,res,next){
   res.send("This is sample");
});


var queue = [],str;
var map = new HashMap();
function readMap() {
    map.forEach(function(value, key) {
            console.log(key + " : " + value);
    });
}

router.post("/v1.0/data_listener/event_command",function(req,res,next){
    console.log("New actions received:")
    var gid = req.body.header.gateway_id;
    if(map.has(gid))
    {
        console.log("sensor exists its queue, "+map.get(gid));
        queue = map.get(string)
        for(var i=0;i<req.body.body.length;i++){
        queue.push(req.body.body[i].sensor_action_data);
        }
        map.set(gid, queue)
    }else{
        var q = []
        for(var i=0;i<req.body.body.length;i++){
            q.push(req.body.body[i].sensor_action_data);
            
        }
        map.set(gid, q)
    }
    
    console.log("now map looks like:");
    map.forEach(function(value, key) {
            console.log(key )
            for(var j=0;j<value.length;j++)
            console.log( " : " +value[j].action_name);
    });
});


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
    /*******************/
    request.post(
        'http://'+config.servers.logic_server.hostname+':'+config.servers.logic_server.port+'/api/v1.0/event',
        { form: { js_code: js_code } },
        function (error, response, body) {
            if (!error && response.statusCode == 200) {
                console.log(body)
            }
        }
    );
       /******************/
    

    // 4. add command from holding queue if any
    // 5. send the message to event server

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.write(JSON.stringify(jsonres) );
            res.end();
       
   
});

module.exports = router;