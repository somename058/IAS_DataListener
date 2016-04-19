var RuleEngine = require("node-rules");
var queryString = require("querystring");
var request = require("request");
var Http = require("http");
var requestify = require('requestify');
var mongoose = require('mongoose');
var Dataset = mongoose.model("dataset");


var helper = {
	executeRule : function(fact,params,dataset){
		var rule_template = '[{ "condition": function(R) { R.when(this && ('+params[0]+')); }, "consequence": function(R) { this.result = [false,"'+params[1]+'"]; R.stop(); } }];';
		var rules = eval("x = "+rule_template);		
		var R = new RuleEngine(rules);		
		var rule_result = "";
		
		//Now pass the fact on to the rule engine for results
		rule_result = R.execute(fact,function(result){ 
			//console.log("RE : "+result.result[1]+" : "+JSON.stringify(fact));		
			if(result.result != true){
				console.log("RE2 : "+JSON.stringify(fact));
				//send callback function to Logic server				
				// Callback.findOne({name: result.result[1]},function(err, data){
				// 	if(err)
				// 		console.log("callback to logicserver : error");
				// 	else{
				// 		//console.log(data);
				// 		requestify.post(data.uri, {
				// 		    callback: data.callback,
				// 		    sensor_data: dataset
				// 		})
				// 		.then(function(response) {
				// 		    // Get the response body (JSON parsed or jQuery object for XMLs)
				// 		    console.log(">"+response.getBody());
				// 		});	
				// 	}					
				// 	//Also need to save data for analytics below here...				
				// });
				
				
			}
		});
		
	},
	//Function not in use currently :P
	evaluateCondition : function(rule, data){
		var key = Object.keys(rule);
		console.log(key);
		for (i in key){
			var condition = Object.keys(rule[key[i]])
			for(j in condition){
				switch(condition[j]){
					case 'lt':
						//console.log("> lt "+rule[key[0]][condition[0]]+" "+data[key[0]]);
						if(data[key[i]] < rule[key[i]][condition[j]])
							return true;
						else
							return false;
					break;
					case 'gt':
						if(data[key[i]] > rule[key[i]][condition[j]])
							return true;
						else
							return false;
					break; 
					default : 
						return false;
				}		
			}
		}
		
	}
}

module.exports = helper;

// var data = queryString.stringify({"callback" : result.result[1] });
				// console.log(data);
				// var req = Http.request({				    
				//     method: 'POST',
				//     host : 'localhost',
				//     port : '3001',	
				//     header : {
				//     	'Content-Type': 'application/x-www-form-urlencoded',
				//     	'Content-Length': data.length
				//     	},			    				    
				//     path: '/api/v1.0/callback' // full URL as path
				// }, function (res) {
				// 	res.setEncoding('utf8');
				//     res.on('data', function (data) {
				//         console.log(data.toString());
				//     });
				// });
				
				// req.write(data);				 
				// req.end();

				// request({
				// 	method : "post",
				// 	uri : 'http://localhost:3001/api/v1.0/callback',
				//     json: { callback: result.result[1] }
				// },
				//     function (error, response, body) {
				//         if (!error && response.statusCode == 200) {
				//             console.log(body)
				//         } else{
				//         	console.log(body);
				//         }
				//     }
				// );