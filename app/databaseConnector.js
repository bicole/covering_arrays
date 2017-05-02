var mysql = require('mysql');
var dbconfig = require('../config/database');

//internal functions
function mySqlHandle() {
     var connection = mysql.createConnection({
        host     : dbconfig.connection.host,
        user     : dbconfig.connection.user,
        password : dbconfig.connection.password,
        database : dbconfig.database
    });

    connection.connect(function(err) {              // The server is either down
        if(err) {                                     // or restarting (takes a while sometimes).
            console.error('error when connecting to db:', err);
            //try to server a 503 like error
          
            setTimeout(mySqlHandle, 2000); // We introduce a delay before attempting to reconnect, to avoid a hot loop, and to allow our node script to process asynchronous requests in the meantime. If you're also serving http, display a 503 error.
        }

        //connection.query('USE ' + dbconfig.database);
    });                                    
                                          
    connection.on('error', function(err) {
        //console.log('db error', err);
        if(err.code === 'PROTOCOL_CONNECTION_LOST') { // Connection to the MySQL server is usually lost due to either server restart, or a connnection idle timeout (the wait_timeout server variable configures this)
            mySqlHandle();  //try to reconnect                       
        } else if(err.code === 'PROTOCOL_SEQUENCE_TIMEOUT' && connection){
            connection.end(); //database closed the connection due to timeout, close the connection on our end too              
        } else if(err.code === 'ER_USER_LIMIT_REACHED'){
            console.error("no free connection to connect to database");
        } else{
            console.error("mysql connection crashed with error code: " + err.code);
            connection.end();
            throw err; 
        }
    });

    return connection;
}



module.exports = {
    createConnection: function (){
        var connection = mySqlHandle();    
        return connection;
    },
    escape: function(input){
        return mysql.escape(input);
    }
}