
////////////////////////////////////////////////////////////////////////////////
//                                                                            //
// STORMRETS PUSH CLIENT                                                      //
// COPYRIGHT 2012 STORMRETS, INC.                                             //
//                                                                            //
// This program is free software: you can redistribute it and/or modify       //
// it under the terms of the GNU General Public License as published by       //
// the Free Software Foundation, either version 3 of the License, or          //
// (at your option) any later version.                                        //
//                                                                            //
// This program is distributed in the hope that it will be useful,            //
// but WITHOUT ANY WARRANTY; without even the implied warranty of             //
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the              //
// GNU General Public License for more details.                               //
//                                                                            //
// You should have received a copy of the GNU General Public License          //
// along with this program.  If not, see <http://www.gnu.org/licenses/>.      //
//                                                                            //
////////////////////////////////////////////////////////////////////////////////
//                                                                            //
// To run you will need to install node.js and the node package manager (npm) //
// once installed you will need to run the following commands:                //
//                                                                            //
//    `npm install websocket`                                                 //
//    `npm install mysql` or `npm install tds` or `npm install pg`            //
//    `node stormrets_push.js`                                                //
//                                                                            //
////////////////////////////////////////////////////////////////////////////////

// Enter the name of your StormRETS Push Channel, this can be found at:
//    https://www.stormrets.com/integration/push
var CHANNEL_NAME = '';

// Enter your API key, this can be found at:
//    https://www.stormrets.com/integration/push
var API_KEY = '';

// Example 1: To connect to a MySQL Database (requires `npm install mysql`)
//var mysql = require('mysql');
//var mysql_client = mysql.createClient({
//  host: 'localhost',
//  post: 3306,
//  user: 'root',
//  password: '',
//});

// Example 2: To connect to a MSSQL Database (requires `npm install tds`)
//var tds = require('tds');
//var tds_conn = new tds.Connection({
//  host: 'localhost',
//  port: 1433,
//  userName: 'sa',
//  password: ''
//});

// Example 3: To connect to PostgreSQL database (requires `npm install pg`)
//var pg = require('pg');
//var pg_client = new pg.Client("tcp://postgres:1234@localhost/postgres");
//pg_client.connect();

// Enter you per record Database Handling code here
function processProperty(property) {
    
    console.log(property);
    
    // Example 1:
    //mysql_client.query("INSERT INTO properties (`ListingId`, `Status`) VALUES (?, ?);", property.ListingId, property.Status);
    
    // Example 2:
    //
    //var stmt = conn.createStatement("INSERT INTO properties VALUES ('"+property.ListingId+"','"+property.Status+"')");
    //stmt.on('done', function(done) {
    //   conn.commit();
    //});
    
    // Example 3:
    //
    //client.query("INSERT INTO properties (ListingId, Status) values($1, $2)", [property.ListingId, property.Status]);
    
}


///
/// Do not edit below this line.
///

console.log("");
console.log("################################################################################");
console.log("# StormRETS Push Client                                                        #");
console.log("################################################################################");
console.log("");
console.log("[-] Initializing");

var WebSocketClient = require('websocket').client;
var client = new WebSocketClient();
var https = require('https');
var url = require('url');
var zlib = require('zlib');

client.on('connectFailed', function(error) {
    console.log('[-] Connect Error: ' + error.toString());
});

client.on('connect', function(connection) {
    console.log('[-] Connected');
    connection.on('error', function(error) {
        console.log("[!] Connection Error: " + error.toString());
    });
    connection.on('close', function() {
        console.log('[!] Connection Closed');
    });
    connection.on('message', function(message) {
        if (message.type === 'utf8') {
            var message_data = JSON.parse(message.utf8Data);
            var payload = JSON.parse(message_data.data);
            if (message_data.event == "property") {
                console.log('[-] Received Property Message, Id: '+payload["id"]);
                console.log('[-] Fetching Property with Id '+payload["id"]+' via API');
                https.get({ host: 'www.stormrets.com', path: "/properties/"+payload["id"]+".json?apikey="+API_KEY }, function(res) {
                    var raw_data = "";
                    function parseData(d) {
                        raw_data = raw_data + d
                    }
                    res.on('data', parseData);
                    res.on('end', function (d) {
                        api_data = JSON.parse(raw_data)
                        if (api_data.Count == 1) {
                            console.log('[-] Processing Property with Id '+payload["id"]+' via processProperty()');
                            processProperty(api_data.Properties[0]);
                        }
                    });
                });
            }
        }
    });
    function subscribe() {
        console.log('[-] Subscribing to Channel: '+CHANNEL_NAME);
        connection.sendUTF(JSON.stringify({"event": "pusher:subscribe", "data": { "channel": CHANNEL_NAME, "auth": API_KEY } }));
    }
    subscribe();
});
client.connect('ws://ws.pusherapp.com/app/e94ad0f506973bbf5ba3');
