
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
//    `npm install faye`                                                      //
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


var faye = require('faye');
var client = new faye.Client('http://www.stormrets.com:8080/firehose', {
    retry: 5,
    timeout: 300
});
client.disable('autodisconnect');
var subscription = client.subscribe(CHANNEL_NAME, processProperty);
var subscriptionAuth = {
    outgoing: function(message, callback) {
        if (message.channel !== '/meta/subscribe') return callback(message);
        if (!message.ext) message.ext = {};
        message.ext.authToken = API_KEY;
        callback(message);
    }
};
client.addExtension(subscriptionAuth);
subscription.callback(function() {
    console.log("Running...");
});
subscription.errback(function(error) {
    console.log(error.message);
});