/*

TuyAPI node.js

Derived from

Dave Gutheinz's TP-LinkHub - Version 1.0

*/



//##### Options for this program ###################################

var logFile = "yes"	//	Set to no to disable error.log file.

var hubPort = 8083	//	Synched with Device Handlers.

//##################################################################



//---- Determine if old Node version, act accordingly -------------

console.log("Node.js Version Detected:   " + process.version)

var oldNode = "no"

if (process.version == "v6.0.0-pre") {

	oldNode ="yes"

	logFile = "no"

}



//---- Program set up and global variables -------------------------

var http = require('http')

var net = require('net')

var fs = require('fs')

const TuyaDevice = require('tuyapi')



var server = http.createServer(onRequest)



//---- Start the HTTP Server Listening to SmartThings --------------

server.listen(hubPort)

console.log("TuyAPI Hub Console Log")

logResponse("\n\r" + new Date() + "\rTuyAPI Hub Error Log")



//---- Command interface to Hubitat ---------------------------

function onRequest(request, response){

	var command = 	request.headers["command"]

	var deviceIP = 	request.headers["tuyapi-ip"]

	var cmdRcvd = "\n\r" + new Date() + "\r\nIP: " + deviceIP + " sent command " + command

	console.log(" ")

	console.log(cmdRcvd)

		

	switch(command) {

		//---- TUYA Device Command ---------------------------

		case "deviceCommand":

			processDeviceCommand(request, response)

			break

	

		default:

			response.setHeader("cmd-response", "InvalidHubCmd")

			response.end()

			var respMsg = "#### Invalid Command ####"

			var respMsg = new Date() + "\n\r#### Invalid Command from IP" + deviceIP + " ####\n\r"

			console.log(respMsg)

			logResponse(respMsg)

	}

}



//---- Send deviceCommand and send response to Hubitat ---------

function processDeviceCommand(request, response) {

	

	var deviceIP = request.headers["tuyapi-ip"]

	var deviceID = request.headers["tuyapi-devid"]

	var localKey = request.headers["tuyapi-localkey"]

	var command =  request.headers["tuyapi-command"]

        var dps = request.headers["dps"]

        var action = request.headers["action"]



//#################################################

//ADDED LINES

	var deviceNo = request.headers["deviceno"]
        var scheme = request.headers["scheme"]

	response.setHeader("deviceNo", deviceNo)

//#################################################

	response.setHeader("action", action)


        var respMsg = "deviceCommand sending to IP: " + deviceIP + " Command: " + command

	console.log(respMsg)



	var tuya = new TuyaDevice({

	  id: deviceID,

          key: localKey,

          ip: deviceIP
});



	switch(command) {

		case "off":

  tuya.set({set: false, 'dps': dps}).then(result => {

               
               response.setHeader("cmd-response", result );

               response.setHeader("onoff", "off");

	       console.log("Result of setting status to false (" + result + ") sent to Hubitat.");

	       response.end();

               
               return;

  });

		break



		case "on":

		  
  tuya.set({set: true, 'dps': dps}).then(result => {

               response.setHeader("cmd-response", result );

               response.setHeader("onoff", "on");

	       console.log("Result of setting status to false (" + result + ") sent to Hubitat.");

	       response.end();

               

      

        return;
});

		break

                case "status":

			    

  tuya.get({'dps': dps}).then(status => {

    console.log('Status: ' + status);


		response.setHeader("cmd-response", status );

                response.setHeader("onoff", "on");

	        console.log("Status (" + status + ") sent to Hubitat.");

	        response.end();

       
	return; 

});

		break



		case "statusAll":

			   

  tuya.get({schema: true,'dps': dps}).then(status => {

    

                results = JSON.stringify(status)
                
response.setHeader("cmd-response", results );

                response.setHeader("onoff", "on");

	        console.log("Results of refresh (" + results + ") sent to Hubitat.");

	        response.end();



return;

      

    

 

});
                break



		default:

			tuya.destroy();

			console.log('Unknown request');

	

	}  	

}



//----- Utility - Response Logging Function ------------------------

function logResponse(respMsg) {

	if (logFile == "yes") {

		fs.appendFileSync("error.log", "\r" + respMsg)

	}

}
